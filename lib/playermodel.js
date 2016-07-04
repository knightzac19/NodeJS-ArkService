/*jshint esversion: 6 */
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('./players.sqlite');


module.exports.getPlayer = (steamid,cb) => {
	db.serialize(() => {
		db.get("select  * from players where steamid = ?",steamid,function(e,r){
			if(e) {
				console.log(e);
			}
			cb(r);
		});
	});
};
//params must be an object {name:'',value:''}!
module.exports.listPlayers = (where,cb) => {
	if(cb === undefined) {
		cb = where;
		db.all("select * from players",function(e,r){
			if(e) {
				console.log(e);
			}
			cb(r);
		});
	} else {
		db.all("select * from players where "+where.name+" = ?",where.value,function(e,r){
			if(e) {
				console.log(e);
			}
			cb(r);
		});
	}


};
