/*jshint esversion: 6 */
var fs = require('fs');
var parser = require("./parse.js");
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('./players.sqlite');
const path = require('path');
const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
const server_settings = settings.server_config;

function checkId(id, cb) {
    db.get("SELECT id from tribes where TribeId = " + id, (err, row) => {
        // console.log(row);
        cb(row);
    });
}

function saveTribes(data, cb) {
    console.log("Tribes....");
    db.run("BEGIN");
    let reqs = data.map((item) => {
        return new Promise((resolve) => {
            checkId(item.Id, function(d) {
                if (d === undefined && item.Id !== false) {
                    db.parallelize(function() {
                        db.run("INSERT INTO tribes (TribeId,TribeName,TribeOwnerId,	TribeCreateTime,TribeLastUpdated ) VALUES (?,?,?,?,?)", [item.Id, item.Name, item.OwnerId, item.FileCreated, item.FileUpdated], function(err, sql) {
                            if (err) {
                                console.log("LINE 24:", err);
                            }
                        });
                        // cn++;
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        });
    });

    Promise.all(reqs).then(() => {
        db.run("COMMIT");
        cb();
    });
}
var qrylist = [];
module.exports.setupTribes = function(cb) {
    db.serialize(function() {
        db.run('CREATE TABLE IF NOT EXISTS tribes (id INTEGER PRIMARY KEY AUTOINCREMENT, TribeId INTEGER  NOT NULL UNIQUE,TribeName VARCHAR NOT NULL,TribeOwnerId INT NULL,	TribeCreateTime DATETIME NULL,TribeLastUpdated DATETIME NULL)');

    });

fs.readdir(path.normalize(server_settings.ark_path), (err, files) => {
    var players = [];
    var tribeData = {};
    let reqs = files.map((v) => {
        return new Promise(function(resolve) {
            var re = new RegExp("^.*\\.arktribe");
            if (re.test(v)) {
                var data = fs.readFileSync(path.join(server_settings.ark_path, v));
                tribeData = {};
                if (err) {
                    return console.log(err);
                }
                tribeData.Name = parser.getString("TribeName", data);
                tribeData.OwnerId = parser.getUInt32("OwnerPlayerDataID", data);
                tribeData.Id = parser.getInt("TribeID", data);
                var fdata = fs.statSync(path.join(server_settings.ark_path, v));
                tribeData.FileCreated =  new Date(fdata.birthtime);
                tribeData.FileUpdated = new Date(fdata.mtime);
				tribeData.FileUpdated = tribeData.FileUpdated.toISOString().slice(0, 19).replace('T', ' ');
                qrylist.push(tribeData);
            }
            resolve();
        });

    });
    Promise.all(reqs).then(() => {

        saveTribes(qrylist, function() {

            cb();
        });

    });
});
};
