/*jshint esversion: 6 */
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('./players.sqlite');
var fs = require('fs');
var https = require('https');
var start = Date.now();
var express = require('express');
var app = express();
var options = {
    // key: fs.readFileSync('server.key'),
    // cert: fs.readFileSync('server.crt')
};
var bodyParser = require('body-parser');
var path = require('path');
const crypto = require('crypto');
const serverConfig = require("./lib/config.js");

const api_settings = serverConfig.api_settings;
const server_settings = serverConfig.server_settings;

var authModel = require("./lib/authmodel.js");
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
var arkdata = require('arkdata');
var player = arkdata.player;
var tribe = arkdata.tribe;
var routes = require("./lib/routes.js");



function setupAccessControl() {
    return new Promise((r, rj) => {
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
        r();
    });
}
module.exports.startServer = function() {
	player.setupPlayers()
    .then(() => tribe.setupTribes())
    .then(() => setupAccessControl())
    .then(() => {
        //default is 30 minutes to refresh


        /*{ key: 'T50hwb8Q67K56cNEdGsFTo',
          steamid: '76561198041798116',
          notetitle: 'ARK-ALARM: 07/04 @ 23:06 on Local Server, ALARM IN \'The Southern Islets\' WAS TRIPPED!',
          message: '...' }*/
        // create application/json parser
        var jsonParser = bodyParser.json();
        for (let [key, value] of entries(routes.getRoutes())) {
            if (value.type !== undefined) {
                if (value.keyName === undefined) {
                    value.keyName = "api_key";
                }
				if(value.altPath !== undefined) {
					key = value.altPath;
				}
                if (value.parse === false) {
                    app.post('/' + key, (req, res) => {
                        checkHash(req.body[value.keyName], res, function(c) {
                            value.run(req, res);
                        });
                    });
                } else {
                    app.post('/' + key, jsonParser, (req, res) => {
                        checkHash(req.body[value.keyName], res, function(c) {
                            value.run(req, res);
                        });
                    });
                }
            }
        }
        app.use(bodyParser.json()); // support json encoded bodies
        app.use(bodyParser.urlencoded({
            extended: true
        })); // support encoded
        var server = app.listen({
            host: server_settings.host,
            port: server_settings.port
        }, function() {
			console.log("Time to start: ", (Math.round(Date.now() - start)  / 1000) + "s");
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
};
if(process.argv.length === 3 && process.argv[2] === "start"){
	module.exports.startServer();
}

function throwReqError(msg) {
    return JSON.stringify({
        error: msg
    });
}


function* entries(obj) {
    if (obj === undefined) {
        yield false;
    }
    for (let key of Object.keys(obj)) {
        yield [key, obj[key]];
    }
}
