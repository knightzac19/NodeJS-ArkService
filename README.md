# NodeJS-ArkService

This repository houses a NodeJS Web Service that lets you load all the data from your ARK server Asynchronously.


## Setup

First you need to copy settings.json-example to settings.json and edit everything inside. Make sure nothing says **CHANGEME** when you are done. Also make note of your secret as you'll need it to setup your api key.

### API Key

There's currently no way to add your api key using the service yet, you'll have to open the sqlite file up in a sqlite browser and add the key yourself.

To generate a key, in nodejs run the following,

```
var key = 'YOUR KEY';
var hash = crypto.createHmac('sha256', 'YOURSECRET')
	.update(key)
	.digest('hex');
console.log(hash);
```

Change **YOUR KEY** to anything you want, but don't forget what you put there. Change YOURSECRET to what you have in your settings.json file. Then take what it outputs and put it into your sqlite database.


## API Calls

All api calls (unless otherwise noted) must be encoded as **application/json** and be a valid JSON call.

**/getServerData**

```
POST: {api_key: YOURKEY}
RETURNS: {d:{mods:[],map:'',maxplayers:0}}
```
