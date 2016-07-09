/*jshint esversion: 6 */
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('./players.sqlite');

db.parallelize(function() {
	db.run('CREATE TABLE IF NOT EXISTS "api_keys" ("id" INTEGER PRIMARY KEY  AUTOINCREMENT  NOT NULL , "service_name" VARCHAR NOT NULL  UNIQUE , "service_key" VARCHAR NOT NULL  UNIQUE , "key_expires" DATETIME, "key_creation" DATETIME NOT NULL  DEFAULT CURRENT_TIMESTAMP)');
});

module.exports.getKey =  (hash,cb) => {
		db.get("select id from api_keys where service_key = ? and (key_expires IS NULL OR key_expires > date('now'))",hash,function(e,r){
			if(e) {
				console.log(e);
			}
			if(r !== undefined ){
				cb(true);
			} else {
				cb(false);
			}

		});
};
