/*jshint esversion: 6 */
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs');
var db = new sqlite3.cached.Database('./players.sqlite');
var settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));



var randomstring = require("randomstring");
const crypto = require('crypto');
db.serialize(function() {

    db.run('CREATE TABLE IF NOT EXISTS "api_keys" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "service_name" VARCHAR NOT NULL  UNIQUE , "service_key" VARCHAR NOT NULL  UNIQUE , "key_expires" DATETIME, "master_key" INTEGER NOT NULL DEFAULT 0, "key_creation" DATETIME NOT NULL  DEFAULT CURRENT_TIMESTAMP)');
    db.get('select count(*) as c from api_keys', (err, sql) => {
		var secret = settings.api_settings.secret;
		var hash_type = settings.api_settings.hash_type;
		if(sql.c === 0){
            var key = randomstring.generate({
                length: 16
            });
			console.log("A new API key has been generated: ", key);
			console.log("Please save the above key as you will not be able to retrieve it!");
			// console.log(hash);
            var hash = crypto.createHmac(hash_type, secret)
                .update(key)
                .digest('hex');
			db.run('insert into api_keys (service_name,service_key) values (?,?)',"Main Key",hash);
        }
    });
});

module.exports.getKey = (hash, cb) => {
    db.get("select id from api_keys where service_key = ? and (key_expires IS NULL OR key_expires > date('now'))", hash, function(e, r) {
        if (e) {
            console.log(e);
        }
        if (r !== undefined) {
            cb(true);
        } else {
            cb(false);
        }

    });
};

module.exports.getMasterKey = (hash, cb) => {
    db.get("select id from api_keys where master_key = ? and (key_expires IS NULL OR key_expires > date('now'))", hash, function(e, r) {
        if (e) {
            console.log(e);
        }
        if (r !== undefined) {
            cb(true);
        } else {
            cb(false);
        }

    });
};
