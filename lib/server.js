/*jshint esversion: 6 */
var fs = require('fs');
var path = require('path');
var SourceQuery = require('sourcequery');
let Rcon = require('srcds-rcon');
var http = require('http');
const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
var mods = [];
var map = '';
var maxplayers,
    version,
    curplayers,
    conplayers,
    latestversion;
var running,
    available;




function* entries(obj) {
    if (obj === undefined) {
        yield false;
    }
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]];
    }
}


module.exports.getSQData = function(cb) {
    maxplayers = 0;
    version = 0;
    curplayers = 0;
    conplayers = 0;
    latestversion = 0;
    running = false;
    available = false;
    if (!cb) {
        return false;
    }
    var sq = new SourceQuery(3000); // 1000ms timeout
    sq.open(settings.sourcequery.host, settings.sourcequery.port);
    console.log("Loading MOD, map, and maxplayers from SourceQuery...");
    sq.getInfo(function(err, info) {
        if (info !== undefined) {
            map = info.map;
            maxplayers = info.maxplayers;
            running = true;
        }
		//removed until we can find another way to get version!
        //version = fs.readFileSync(path.join(settings.server_config.ark_path, "version.txt")).toString();
        version = 0;

    });
    sq.getPlayers(function(err, players) {
        players.forEach(elem => {
            if (elem.name === '') {
                conplayers++;
                return true;
            }
            curplayers++;
            available = true;
        });
    });
    sq.getRules(function(err, rules) {
        // console.log(err);
        // console.log('Server Rules:', rules);
        for (let [key, value] of entries(rules)) {
            if ((key === "MOD0_s" || key === "MOD1_s" || key === "MOD2_s" || key === "MOD3_s") && value !== "" && value !== undefined) {
                mods.push(value.slice(0, 9));
            }
        }
    });

    sq.close(function() {
        console.log("SourceQuery is Finished...");
        http.request({
            host: "arkdedicated.com",
            path: "/version"
        }, function(res) {
            var bodyChunks = [];
            res.on('data', function(chunk) {
                // You can process streamed parts here...
                bodyChunks.push(chunk.toString());
            });
            res.on("end", function(body) {
                latestversion = bodyChunks[0];
                cb({
                    mods: mods,
                    map: map,
                    maxplayers: maxplayers,
                    installversion: version,
                    online: curplayers,
                    pendingonline: conplayers,
                    latestversion: latestversion,
                    status: {
                        online: running,
                        accessible: available
                    }
                });
            });
        }).end();

    });
};

let rcon = Rcon({
    address: settings.sourcequery.host + ':' + settings.sourcequery.rconport,
    password: settings.sourcequery.rconpass
});

module.exports.getChat = (cb) => {
    __connectRCON().then(() => {
        return __command('getchat', 1000).then((data) => {
            cb(data);
        });
    }).then(() => {
        rcon.disconnect();
    });
};

module.exports.listOnline = (cb) => {
    __connectRCON().then(() => {

        return __command('listplayers', 1000).then((data) => {
            cb(data);
        });
    }).then(() => {
        rcon.disconnect();
    });
};

module.exports.saveWorld = (cb) => {
    __connectRCON().then(() => {
        return __broadcast("A world save is about to be performed, you may experience some lag during this process. Please be patient.");
    }).then(() => {
        console.log("Saving World");
        return __command('saveworld').then((data) => {
            cb(data);
        });
    }).then(() => {
        rcon.disconnect();
    });
};

module.exports.destroyWildDinos = (cb) => {
    __connectRCON().then(() => {
        return __broadcast("About to destroy all wild creatures, you may experience some lag during this process. Please be patient.");
    }).then(() => {
        console.log("Destroying Dinos");
        return __command('destroywilddinos').then((data) => {
            cb(data);
        });
    }).then(() => {
        rcon.disconnect();
    });
};
module.exports.broadcast = (txt, cb) => {
    __connectRCON().then(() => {
        return __broadcast(txt);
    }).then(() => {
        cb();
        rcon.disconnect();
    });
};

function __broadcast(txt) {
    return __command('broadcast ' + txt);
}

module.exports.doExit = (cb) => {
    __connectRCON().then(() => {
        return __command('quit').then((data) => {
            cb(data);
        });
    }).then(() => {
        rcon.disconnect();
    });
};

module.exports.runCommand = (cmd, cb) => {
    __connectRCON().then(() => {
        return __command(cmd).then((d) => {
            cb(d);
        });
    }).then(() => {
        rcon.disconnect();
    });
};

function __command(cmd) {
    return rcon.command(cmd);
}


function __connectRCON() {
    return rcon.connect().then(() => {
        console.log("RCON Authorized");
    }).catch(console.error);
}
