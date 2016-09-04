/*jshint esversion: 6 */
var arkdata = require('arkdata');
var player = arkdata.player;
var tribe = arkdata.tribe;
var playerModel = require("./playermodel.js");
var tribeModel = require("./tribemodel.js");
var arkserver = require("./server.js");
var refreshing = true;
var cacheInt;
const serverConfig = require("./config.js");

const api_settings = serverConfig.api_settings;
const server_settings = serverConfig.server_settings;

function refreshCache(cb) {
    if (refreshing === true) {
        return false;
    }
    refreshing = true;
    player.setupPlayers()
        .then(() => tribe.setupTribes())
        .then(() => {
            console.log("Player/Tribe Data refreshed!");
			refreshing = false;
            cb();
        });
}
refreshing = false;

cacheInt = setInterval(refreshCache, server_settings.cache_refresh);
module.exports.getRoutes = function() {

    let routes = {
        arkServerMessage: {
            type: 'POST',
            parse: false,
            keyName: "key",
            run: function(req, res) {
                console.log(req.body);
            }
        },
        getServerData: {
            type: 'POST',
            run: function(req, res) {
                arkserver.getSQData(function(v) {
                    res.json({
                        d: v
                    });
                });
            }
        },
        getChat: {
            type: 'POST',
            run: function(req, res) {
                arkserver.getChat(function(d) {
                    res.json({
                        "chat": d.split("\n")
                    });
                });
            }
        },
        listOnline: {
            type: 'POST',
            run: function(req, res) {
                arkserver.listOnline(function(d) {
                    res.json({
                        "players": d.split("\n")
                    });
                });
            }
        },
        saveWorld: {
            type: 'POST',
            run: function(req, res) {
                arkserver.saveWorld(function(d) {
                    res.json({
                        text: "World Saved!"
                    });
                });
            }
        },
        destroyDinos: {
            type: 'POST',
            run: function(req, res) {
                arkserver.destroyWildDinos(function(d) {
                    res.json({
                        text: "Wild Dinos Destroyed!"
                    });
                });
            }
        },
        command: {
            type: 'POST',
            run: function(req, res) {
                arkserver.runCommand(req.body.cmd, function(d) {
                    if (d === undefined || d === null || d === "") {
                        d = "No Response From Server";
                    }
                    res.json({
                        result: d
                    });
                });
            }
        },
        broadcast: {
            type: 'POST',
            run: function(req, res) {
                arkserver.broadcast(req.body.msg, function() {
                    res.json({
                        chat: "[ALL] " + msg
                    });
                });
            }
        },
        listTribes: {
            type: 'POST',
			altPath: 'listTribes/:style',
            run: function(req, res) {
                var array = false;
                if (req.params.style === "true") {
                    array = true;
                }

                tribeModel.listTribes({
                    array: array
                }, function(d) {
                    res.json({
                        d: d
                    });
                });
            }
        },
        listPlayers: {
            type: 'POST',
            run: function(req, res) {
                playerModel.listPlayers(function(d) {
                    res.json({
                        d: d
                    });
                });
            }
        },
        getPlayer: {
            type: 'POST',
            run: function(req, res) {
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
                            res.json({
                                d: d
                            });
                        }
                    });
                }
            }
        },
        forceRefreshCache: {
            type: 'POST',
            run: function(req, res) {
                if (refreshing === true) {
                    res.statusMessage = "Cache currently refreshing. Please try again later!";
                    res.status(400).end();
                } else {
                    clearInterval(cacheInt);
                    refreshCache(function(e) {
                        var err = '';
                        if (e !== undefined && e !== false) {
                            err = " | Error Occured:" + e;
                        }
                        refreshing = false;
                        cacheInt = setInterval(refreshCache, server_settings.cache_refresh);
                        res.json({
                            text: "Cache Refreshed" + err
                        });
                    });
                }
            }
        },
        getTribe: {
            type: 'POST',
            run: function(req, res) {
                if (req.body.id === undefined) {
                    res.statusMessage = "Invalid ID!";
                    res.status(400).end();
                } else {
                    tribeModel.getTribe(req.body.id, function(d) {
                        if (d === undefined) {
                            res.statusMessage = "Tribe Not Found!";
                            res.status(400).end();
                        } else {
                            res.json({
                                d: d
                            });
                        }
                    });
                }
            }
        },
        getTribeMembers: {
            type: 'POST',
            run: function(req, res) {
                if (req.body.id === undefined) {
                    res.statusMessage = "Invalid ID!";
                    res.status(400).end();
                } else {
                    tribeModel.getTribe(req.body.id, function(d) {
                        if (d === undefined) {
                            res.statusMessage = "Tribe Not Found!";
                            res.status(400).end();
                            // res.status(500).end(throwReqError("Player Not Found!"));
                        } else {
                            res.json({
                                d: d
                            });
                        }
                    });
                }
            }
        }
    };

    return routes;
};
