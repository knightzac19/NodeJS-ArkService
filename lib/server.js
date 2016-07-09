/*jshint esversion: 6 */
var fs = require('fs');
var SourceQuery = require('sourcequery');
let Rcon = require('srcds-rcon');
const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
var mods = [];
var map = '';
var maxplayers = 0;
var sq = new SourceQuery(3000); // 1000ms timeout
sq.open(settings.sourcequery.host, settings.sourcequery.port);
console.log("Loading MOD, map, and maxplayers from SourceQuery...");
sq.getInfo(function(err, info) {
    map = info.map;
    maxplayers = info.maxplayers;
});
// sq.getPlayers(function(err, players){
//     console.log('Online Players:', players);
// });
function* entries(obj) {
        for (let key of Object.keys(obj)) {
            yield [key, obj[key]];
        }
    }
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
});


module.exports.getSQData = function() {
	return {mods:mods,map:map,maxplayers:maxplayers};
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
        })
    }).then(() => {
        rcon.disconnect();
    });
}

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
