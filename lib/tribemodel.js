/*jshint esversion: 6 */
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('./players.sqlite');


module.exports.getTribe = (id, cb) => {
    db.serialize(() => {
        db.get("select * from tribes where tribeid = ?", id, function(e,d) {
            cb(d);
        });
    });
};

module.exports.listTribes = (where, cb) => {
    if (cb === undefined) {
        cb = where;
        db.all("select * from tribes limit 5", function(e, r) {
            if (e) {
                console.log(e);
            }
            cb(r);
        });
    } else {
        db.all("select * from tribes where " + where.name + " = ? limit 5", where.value, function(e, r) {
            if (e) {
                console.log(e);
            }

            cb(r);
        });
    }
};

module.exports.getTribeMembers = (id,cb) => {
	db.serialize(()=> {
		db.all("select * from players where playertribe = ?",id, (e,r) =>{
			cb(r);
		});
	});
};
