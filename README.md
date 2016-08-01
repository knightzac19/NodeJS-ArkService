# NodeJS-ArkService

This repository houses a NodeJS Web Service that lets you load all the data from your ARK server Asynchronously. The nodejs server must be on the same server that houses your ARK server in order for this to function properly. You also will need to open up the port you specify in the settings.json to the outside world.

## Install

```
npm install ark-query-tool
```

Inside your **index.js** just put the following,
```
require('ark-query-tool');
```
There's no functions that need to be run, it will start the server up from there.


**Do not run the server until you complete the setup below! If you happen to run it before hand, you will encounter several errors. It will generate a corrupt sqlite file and you should just delete it before continuing.**

Then just run **node index.js** and you should something like see this,
```
Config verification finished!
Player DB....
Save Done...
Loading Steam...
Caching Steam Info...
Profiles are done updating!
Bans are done updating!
Time to start:  4s
Tribes....
Ark Query Server Up At http://:::8081
```

You can also just clone this repo and run **npm install** and then run **node index.js** and you will get the same result.


## Setup

First you need to copy settings.json-example to settings.json and edit everything inside OR just run the module once and it will generate a settings.json for you that you can modify. Make sure nothing says **CHANGEME** when you are done. Also make note of your secret as you'll need it to setup your api key.

### API Key

Your api key will be outputted to you in your console and log file the first time you run the module. If you forget to save the api key, just delete your player.sqlite and let it regen the cache.


## API Calls

All api calls (unless otherwise noted) must be encoded as **application/json** and be a valid JSON call.

**getServerData**

```
POST: {api_key: YOURKEY}
RETURNS: {d:{mods:[],map:'',maxplayers:0}}
```

**getChat**

```
POST: {api_key: YOURKEY}
RETURNS: {chat:[]}
```

**listOnline**

```
POST: {api_key: YOURKEY}
RETURNS: {players:[]}
```


**saveWorld**

```
POST: {api_key: YOURKEY}
RETURNS: {text:'World Saved'}
```

**destroyDinos**

```
POST: {api_key: YOURKEY}
RETURNS: {text:'Wild Dinos Destroyed'}
```

**command**

```
POST: {api_key: YOURKEY, cmd: RCONCOMMAND}
RETURNS: {result:''}
```

**broadcast**

```
POST: {api_key: YOURKEY, msg: YOURMESSAGE}
RETURNS: {chat:'[ALL] YOURMESSAGE'}
```

**listTribes/true**

```
POST: {api_key: YOURKEY}
RETURNS: {d:[
{"Id":1234567890,
"Name":"",
"OwnerId":123456789,
"FileCreated":"2016-07-04 17:15:34",
"FileUpdated":"2016-07-09 15:10:33"}
]}
```

**listTribes/false**

```
POST: {api_key: YOURKEY}
RETURNS: {
	d:{
		1234567890:
			{"Id":1234567890,
			"Name":"",
			"OwnerId":123456789,
			"FileCreated":"2016-07-04 17:15:34",
			"FileUpdated":"2016-07-09 15:10:33"}
			}
		}
```

**listPlayers**

```
POST: {api_key: YOURKEY}
RETURNS: {d:[
{"Id":132456789,
"TribeId":123456789,
"Level":50,
"Engrams":1000,
"SteamId":"1234156748974",
"Admin":null,
"CharacterName":"",
"SteamName":"",
"ProfileUrl":"http://steamcommunity.com/id/",
"AvatarUrl":"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/",
"CommunityBanned":0,
"VACBanned":0,
"NumberOfVACBans":0,
"NumberOfGameBans":0,
"DaysSinceLastBan":0,
"FileUpdated":"2016-07-09 15:10:33",
"FileCreated":"2016-07-04 17:15:34"}
]}
```

**getPlayer**

```
POST: {api_key: YOURKEY, id: STEAMID}
RETURNS: {d:
{"Id":132456789,
"TribeId":123456789,
"Level":50,
"Engrams":1000,
"SteamId":"1234156748974",
"Admin":null,
"CharacterName":"",
"SteamName":"",
"ProfileUrl":"http://steamcommunity.com/id/",
"AvatarUrl":"https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/",
"CommunityBanned":0,
"VACBanned":0,
"NumberOfVACBans":0,
"NumberOfGameBans":0,
"DaysSinceLastBan":0,
"FileUpdated":"2016-07-09 15:10:33",
"FileCreated":"2016-07-04 17:15:34"}
}
```
