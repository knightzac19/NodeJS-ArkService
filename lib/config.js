/*jshint esversion: 6 */
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.cached.Database('./players.sqlite');
var fs = require('fs');
var util = require('util');
var path = require('path');

const defaultSettings = {
    "daemon_mode": false,
    "log_console": false,
    "sourcequery": {
        "host": "<CHANGEME>",
        "port": 27015,
        "rconport": 27020,
        "rconpass": "<changeme>"
    },
    "server_config": {
        "host": "localhost",
        "port": 8081,
        "use_ajax": true,
        "allowed_server": "http://localhost",
        "ark_path": "C:\\Steam\\steamapps\\common\\ARK",
        "steam_key": "YOURSTEAMKEY",
        "cache_refresh": 1800000,
        "save_folder":""
    },
    "api_settings": {
        "secret": "<CHANGEME>",
        "hash_type": "sha256"
    }
};
var settings;
try {
    settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));
    if (JSON.stringify(settings) == JSON.stringify(defaultSettings)) {
        console.error("ERROR: Failed to start, default settings detected!");
        process.exit(1);
    }
} catch (err) {
    settings = defaultSettings;
    fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 4));
    console.error("Your settings.json has been initialized, please edit it before running again!");
    process.exit(1);
}

if (Object.keys(defaultSettings).length == Object.keys(settings).length && Object.keys(defaultSettings.sourcequery).length == Object.keys(settings.sourcequery).length && Object.keys(defaultSettings.server_config).length == Object.keys(settings.server_config).length && Object.keys(defaultSettings.api_settings).length == Object.keys(settings.api_settings).length) {
    console.log("Config verification finished!");
} else {
    if (!settings.server_config.cache_refresh) {
        settings.server_config.cache_refresh = 1800000;
        fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 4));
    }
    if (!settings.server_config.host) {
        settings.server_config.host = null;
        fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 4));
    }
    if (!settings.server_config.port) {
        settings.server_config.port = 8081;
        fs.writeFileSync('./settings.json', JSON.stringify(settings, null, 4));
    }
    console.error("ERROR: Config verification failed. Please ensure all options are there.");
    process.exit(1);
}
Object.freeze(settings);
try {
  fs.readFileSync(path.join(settings.server_config.ark_path, "version.txt"));
} catch (err) {
    try {
        fs.readFileSync(path.join(settings.server_config.ark_path, "steamclient.so"));
    } catch (err) {
        console.error("ERROR: Ark not found...Exiting!");
        process.exit(1);
    }

}


if (settings.log_console === true) {
    try {
        var old_file = fs.accessSync(path.join(path.dirname(require.main.filename), "console_log.txt"), fs.F_OK);
        fs.renameSync(path.join(path.dirname(require.main.filename), "console_log.txt"), "./console_log.old.txt");
    }
    //we don't care if this errors out!
    catch (e) {}
    var logFile = fs.createWriteStream('./console_log.txt', {
        flags: 'w'
    });
    var logStdout = process.stdout;

    console.log = function() {
        logFile.write(util.format.apply(null, arguments) + '\n');
        logStdout.write(util.format.apply(null, arguments) + '\n');
    };
    console.error = console.log;
}



if (settings.daemon_mode === true) {
    require('daemon')();
}
module.exports.api_settings = settings.api_settings;
module.exports.server_settings = settings.server_config;
Object.freeze(module.exports.api_settings);
Object.freeze(module.exports.server_settings);
