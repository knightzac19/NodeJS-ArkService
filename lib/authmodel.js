/*jshint esversion: 6 */
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('./players.sqlite');


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
