/*jshint esversion: 6 */
var fs = require('fs');
    // ini = require('ini');
const path = require('path');
const settings = JSON.parse(fs.readFileSync('./settings.json', 'utf8'));

var iniReader = require('inireader');
// initialize
var parser = new iniReader.IniReader({multiValue:true});
// parser.load(path.join(settings.server_config.ark_path,"Saved","Config","WindowsServer","GameUserSettings.ini"));
// get the config tree
// console.log(parser.getBlock());
try {
	parser.load(path.join(settings.server_config.ark_path,"Saved","Config","WindowsServer","Game.ini"));
	// get the config tree
	var gamesettings = parser.getBlock('/script/shootergame.shootergamemode');
	// gamesettings = gamesettings['/script/shootergame.shootergamemode'];
	parser.param('/script/shootergame.shootergamemode.MaxNumberOfPlayersInTribe',20);

	// var humanover = gamesettings.LevelExperienceRampOverrides[0].replace("(","").replace(")","").split(",");
	// var dinoover = gamesettings.LevelExperienceRampOverrides[1].replace("(","").replace(")","").split(",");
	// var engramover = gamesettings.OverridePlayerLevelEngramPoints;
	// var dinospawnweightmultiply = gamesettings.DinoSpawnWeightMultipliers;
	// var dinoweight = [{}];
	// var c = 0;
	// var t = {};
	// dinospawnweightmultiply.forEach(function(elem) {
	// 	t = elem.replace("(","").replace(")","").split(",");
	// 	dinoweight.push(t);
	// 	console.log(dinoweight);
	//
	// 	// Object.keys(dinospawnweightmultiply[c]).forEach(function (key) {
	// 	// 	dinoweight[c] = dinospawnweightmultiply[c][key].split("=");
	// 	// });
	// 	// c++;
	// });
	// console.log(dinoweight[0]);
	// if(humanover.length !=  engramover.length) {
	// 	throw "Error: Level Overrides and Engram Overrides must be the same length!";
	// }
	// parser.param(["/script/shootergame.shootergamemode","MaxNumberOfPlayersInTribe"],20);
	parser.write();

	// parser.load(path.join(settings.server_config.ark_path,"Saved","Config","WindowsServer","GameUserSettings.ini"));
	// var gameusersettings = parser.getBlock();
	// parser.param(['MessageOfTheDay','Message'],"Test my Message!");
	// parser.write();
	// console.log(gameusersettings['T-Rex Egg']);



} catch(err) {
	console.log(err);
}

// var gameusersettings = ini.parse(fs.readFileSync(path.join(settings.server_config.ark_path,"Saved","Config","WindowsServer","GameUserSettings.ini"), 'UTF-8'));
// var gamesettings = ini.parse(fs.readFileSync(path.join(settings.server_config.ark_path,"Saved","Config","WindowsServer","Game.ini"), 'UTF-8'));

// console.log(gamesettings.DinoSpawnWeightMultipliers);
