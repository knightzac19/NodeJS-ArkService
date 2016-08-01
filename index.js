/*jshint esversion: 6 */
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('./players.sqlite');
var fs = require('fs');
var https = require('https');
var util = require('util');
var express = require('express');
var app = express();
var options = {
    // key: fs.readFileSync('server.key'),
    // cert: fs.readFileSync('server.crt')
};
var bodyParser = require('body-parser');
var path = require('path');
const crypto = require('crypto');

function checkHash(key, res, cb) {
    //.update('sdblas%ew5@trast')

    var hash = crypto.createHmac(api_settings.hash_type, api_settings.secret)
        .update(key)
        .digest('hex');
    authModel.getKey(hash, function(d) {
        if (d === false) {
            res.statusMessage = "Invalid API Key!";
            res.status(400).end();
        } else {
            cb(true);
        }
    });
    // return false;
}
var defaultSettings = {
    "daemon_mode": false,
    "log_console": false,
    "sourcequery": {
        "host": "<CHANGEME>",
        "port": 27015,
        "rconport": 27020,
        "rconpass": "<changeme>"
    },
    "server_config": {
        "host": "localhost",
        "port": 8081,
        "use_ajax": true,
        "allowed_server": "http://localhost",
        "ark_path": "C:\\Steam\\steamapps\\common\\ARK",
        "steam_key": "YOURSTEAMKEY",
        "cache_refresh": 1800000
    },
    "api_settings": {
        "secret": "<CHANGEME>",
        "hash_type": "sha256"
    }
};
var settings;
try {
    settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
    if (JSON.stringify(settings) == JSON.stringify(defaultSettings)) {
        console.error("ERROR: Failed to start, default settings detected!");
        process.exit(1);
    }
} catch (err) {
    settings = defaultSettings;
    fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 4));
    console.error("Your settings.json has been initialized, please edit it before running again!");
    process.exit(1);
}

if (Object.keys(defaultSettings).length == Object.keys(settings).length && Object.keys(defaultSettings.sourcequery).length == Object.keys(settings.sourcequery).length && Object.keys(defaultSettings.server_config).length == Object.keys(settings.server_config).length && Object.keys(defaultSettings.api_settings).length == Object.keys(settings.api_settings).length) {
    console.log("Config verification finished!");
} else {
    if (!settings.server_config.cache_refresh) {
        settings.server_config.cache_refresh = 1800000;
        fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 4));
    }
    if (!settings.server_config.host) {
        settings.server_config.host = null;
        fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 4));
    }
    if (!settings.server_config.port) {
        settings.server_config.port = 8081;
        fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 4));
    }
    console.error("ERROR: Config verification failed. Please ensure all options are there.");
    process.exit(1);
}
Object.freeze(settings);
try {
    var ark = fs.readFileSync(path.join(settings.server_config.ark_path, "version.txt"));
} catch (err) {
    console.error("ERROR: Ark not found...Exiting!");
    process.exit(1);
}

if (settings.log_console === true) {
    try {
        var old_file = fs.accessSync(path.join(path.dirname(require.main.filename),"console_log.txt"), fs.F_OK);
        fs.renameSync(path.join(path.dirname(require.main.filename),"console_log.txt"), "./console_log.old.txt");
    }
    //we don't care if this errors out!
    catch (e) {}
    var logFile = fs.createWriteStream('./console_log.txt', {
        flags: 'w'
    });
    // Or 'w' to truncate the file every time the process starts.
    var logStdout = process.stdout;

    console.log = function() {
        logFile.write(util.format.apply(null, arguments) + '\n');
        logStdout.write(util.format.apply(null, arguments) + '\n');
    };
    console.error = console.log;
}


if (settings.daemon_mode === true) {
    require('daemon')();
}
const api_settings = settings.api_settings;
const server_settings = settings.server_config;
Object.freeze(api_settings);
Object.freeze(server_settings);

var arkdata = require('arkdata');
var player = arkdata.player;
var tribe = arkdata.tribe;
var playerModel = require("./lib/playermodel.js");
var tribeModel = require("./lib/tribemodel.js");
var authModel = require("./lib/authmodel.js");
var arkserver = require("./lib/server.js");
var cacheInt;
var refreshing = true;

function refreshCache(cb) {
    if (refreshing === true) {
        return false;
    }
    refreshing = true;
    player.setupPlayers(function(e) {
        var er;
        if (e !== undefined) {
            er = e;
        }
        tribe.setupTribes(function(e) {
            if (e !== undefined) {
                er = er + " | " + e;
            }
            refreshing = false;
            console.log("Player/Tribe Data refreshed!");
            cb(er);
        });
    });
}

player.setupPlayers(function() {
    tribe.setupTribes(function() {
        //default is 30 minutes to refresh
        cacheInt = setInterval(refreshCache, server_settings.cache_refresh);
        refreshing = false;

        // tribeModel.getTribeMembers(1023269468, function(d) {
        //     console.log(d);
        // });

        //You must have a valid SSL cert to use this
        //PHP can be set to ignore the self-signed-cert
        if (server_settings.use_ajax) {
            app.use(function(req, res, next) {

                // Website you wish to allow to connect
                // Only set this if you wish to use AJAX instead of PHP to communicate
                res.setHeader('Access-Control-Allow-Origin', server_settings.allowed_server);

                // Request methods you wish to allow
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

                // Request headers you wish to allow
                res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

                // Set to true if you need the website to include cookies in the requests sent
                // to the API (e.g. in case you use sessions)
                res.setHeader('Access-Control-Allow-Credentials', true);

                // Pass to next layer of middleware
                next();
            });
        }

        /*{ key: 'T50hwb8Q67K56cNEdGsFTo',
          steamid: '76561198041798116',
          notetitle: 'ARK-ALARM: 07/04 @ 23:06 on Local Server, ALARM IN \'The Southern Islets\' WAS TRIPPED!',
          message: '...' }*/
        // create application/json parser
        // This currently doesn't do anything...
        var jsonParser = bodyParser.json();
        app.post('/arkServerMessage', (req, res) => {
            console.log("Message");
            checkHash(req.body.key, res, function(c) {
                // console.log(req.body.key,req.body.steamid,req.body.notetitle,req.body.message);
                console.log(req.body);
                res.end("Goodbye!");
                // res.json(arkserver.getSQData());
            });
        });

        app.post('/getServerData', jsonParser, (req, res) => {
            checkHash(req.body.api_key, res, function(c) {
                arkserver.getSQData(function(v) {
                    res.json({
                        d: v
                    });
                });

            });
        });

        app.post('/getChat', jsonParser, (req, res) => {
            checkHash(req.body.api_key, res, function(c) {
                arkserver.getChat(function(d) {
                    res.json({
                        "chat": d.split("\n")
                    });
                });
            });
        });

        app.post('/listOnline', jsonParser, (req, res) => {
            checkHash(req.body.api_key, res, function(c) {
                arkserver.listOnline(function(d) {
                    res.json({
                        "players": d.split("\n")
                    });
                });
            });
        });

        app.post('/saveWorld', jsonParser, (req, res) => {
            checkHash(req.body.api_key, res, function(c) {
                arkserver.saveWorld(function(d) {
                    res.json({
                        text: "World Saved!"
                    });
                });
            });
        });

        app.post('/destroyDinos', jsonParser, (req, res) => {
            checkHash(req.body.api_key, res, function(c) {
                arkserver.destroyWildDinos(function(d) {
                    res.json({
                        text: "Wild Dinos Destroyed!"
                    });
                });
            });
        });

        app.post('/command', jsonParser, (req, res) => {
            checkHash(req.body.api_key, res, function(c) {
                arkserver.runCommand(req.body.cmd, function(d) {
                    if (d === undefined || d === null || d === "") {
                        d = "No Response From Server";
                    }
                    res.json({
                        result: d
                    });
                });
            });
        });

        app.post('/broadcast', jsonParser, (req, res) => {
            checkHash(req.body.api_key, res, function(c) {
                arkserver.broadcast(req.body.msg, function() {
                    res.json({
                        chat: "[ALL] " + msg
                    });
                });
            });
        });

        app.post('/listTribes/:style', jsonParser, (req, res) => {
            checkHash(req.body.api_key, res, function(c) {
                var array = false;
                if (req.params.style === "true") {
                    array = true;
                }

                tribeModel.listTribes({
                    array: array
                }, function(d) {
                    res.json({
                        d: d
                    });
                });
            });
        });


        app.post('/listPlayers', jsonParser, (req, res) => {
            checkHash(req.body.api_key, res, function(c) {
                playerModel.listPlayers(function(d) {
                    res.json({
                        d: d
                    });
                });
            });
        });

        app.post('/getPlayer', jsonParser, function(req, res) {
            checkHash(req.body.api_key, res, function(c) {
                if (req.body.id === undefined) {
                    res.statusMessage = "Invalid ID!";
                    res.status(400).end();
                } else {
                    playerModel.getPlayer(req.body.id, function(d) {
                        if (d === undefined) {
                            res.statusMessage = "Player Not Found!";
                            res.status(400).end();
                            // res.status(500).end(throwReqError("Player Not Found!"));
                        } else {
                            res.json({
                                d: d
                            });
                        }
                    });
                }
            });
        });

        app.post('/forceRefreshCache', jsonParser, function(req, res) {
            checkHash(req.body.api_key, res, function(c) {
                if (refreshing === true) {
                    res.statusMessage = "Cache currently refreshing. Please try again later!";
                    res.status(400).end();
                } else {
                    clearInterval(cacheInt);
                    refreshCache(function(e) {
                        var err = '';
                        if (e !== undefined && e !== false) {
                            err = " | Error Occured:" + e;
                        }
                        refreshing = false;
                        cacheInt = setInterval(refreshCache, server_settings.cache_refresh);
                        res.json({
                            text: "Cache Refreshed" + err
                        });
                    });
                }
            });
        });

        app.post('/getTribe', jsonParser, function(req, res) {
            checkHash(req.body.api_key, res, function(c) {
                if (req.body.id === undefined) {
                    res.statusMessage = "Invalid ID!";
                    res.status(400).end();
                } else {
                    tribeModel.getTribe(req.body.id, function(d) {
                        if (d === undefined) {
                            res.statusMessage = "Tribe Not Found!";
                            res.status(400).end();
                        } else {
                            res.json({
                                d: d
                            });
                        }
                    });
                }
            });
        });

        app.post('/getTribeMembers', jsonParser, function(req, res) {
            checkHash(req.body.api_key, res, function(c) {
                if (req.body.id === undefined) {
                    res.statusMessage = "Invalid ID!";
                    res.status(400).end();
                } else {
                    tribeModel.getTribe(req.body.id, function(d) {
                        if (d === undefined) {
                            res.statusMessage = "Tribe Not Found!";
                            res.status(400).end();
                            // res.status(500).end(throwReqError("Player Not Found!"));
                        } else {
                            res.json({
                                d: d
                            });
                        }
                    });
                }
            });
        });
        app.use(bodyParser.json()); // support json encoded bodies
        app.use(bodyParser.urlencoded({
            extended: true
        })); // support encoded
        var server = app.listen({
            host: server_settings.host,
            port: server_settings.port
        }, function() {
            console.log("Ark Query Server Up At http://%s:%s", server.address().address, server_settings.port);
        });
        // var server = http.createServer(app).listen({
        //     host: server_settings.host,
        //     port: server_settings.port
        // }, function() {
        //     var host = server.address().address;
        //     var port = server.address().port;
        //     console.log("Ark Query Server Up At http://%s:%s", host, port);
        // }).on("error", function(err) {
        //     console.log(err);
        // });
    });
    // playerModel.getPlayer("76561197960539228",function(d){
    // 	console.log(d);
    // });
    // playerModel.listPlayers({name:"steamid",value:"76561197960539228"},function(d){
    // 	console.log(d);
    // });
});


function throwReqError(msg) {
    return JSON.stringify({
        error: msg
    });
}
