/*jshint esversion: 6 */
var player = require("./lib/playercache.js");
var tribe = require("./lib/tribecache.js");
var fs = require('fs');
var playerModel = require("./lib/playermodel.js");
var tribeModel = require("./lib/tribemodel.js");
var authModel = require("./lib/authmodel.js");
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('./players.sqlite');
var https = require('https');
var express = require('express');
var app = express();
var options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.crt')
};
var bodyParser = require('body-parser');

const crypto = require('crypto');

const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
if(settings.daemon_mode === true) {
	require('daemon')();
}
const api_settings = settings.api_settings;
const server_settings = settings.server_config;
// app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: false
})); // support encoded

function checkHash(key, res, cb) {
    //.update('sdblas%ew5@trast')
    var hash = crypto.createHmac(api_settings.hash_type, api_settings.secret)
        .update(key)
        .digest('hex');
    authModel.getKey(hash, function(d) {
        if (d === false) {
            res.statusMessage = "Invlaid API Key!";
            res.status(400).end();
            cb(false);
        } else {
            cb(true);
        }
    });
    // return false;
}


player.setupPlayers(function() {
    tribe.setupTribes(function() {
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

        app.post('/listTribes', (req, res) => {
            checkHash(req.body.api_key, res, function(c) {
                tribeModel.listTribes(function(d) {
                    res.json(JSON.stringify(d));
                });
            });
        });

        app.post('/listPlayers', (req, res) => {
            checkHash(req.body.api_key, res, function(c) {
                playerModel.listPlayers(function(d) {
                    res.json(d);
                });
            });
        });

        app.post('/getPlayer', function(req, res) {
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
                            res.json(JSON.stringify(d));
                        }
                    });
                }
            });
        });
        var server = https.createServer(options, app).listen({
            host: server_settings.host,
            port: server_settings.port
        }, function() {
            var host = server.address().address;
            var port = server.address().port;
            console.log("Ark Query Server Up At https://%s:%s", host, port);
        }).on("error", function() {
            res.end(throwReqError("Failed to make request"));
        });
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
