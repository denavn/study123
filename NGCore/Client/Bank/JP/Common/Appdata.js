/**
 * Public Social.Common.Appdata
 */

var GSGlobals = require("../../_Internal/GSGlobals");

exports.Appdata = { 
	getEntries: function(keys, callback){
		var data = {
			keys: keys
		};
		this._sendReadCommand("JP.Appdata.getEntries", data, callback);
	},

	updateEntries: function(entries, callback){
		var data = {
			entries: entries
		};
		this._sendWriteCommand("JP.Appdata.updateEntries", data, callback);
	},

	deleteEntries: function(keys, callback) {
		var data = {
			keys: keys
		};
		this._sendWriteCommand("JP.Appdata.deleteEntries", data, callback);
	},
	_sendReadCommand: function(apiURL, data, callback) {
		var cmd = {
			apiURL: apiURL,
			data: data
		};
		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = function(error, result){
				if(!error){error = undefined;}
				callback(error, result.entries)
			};
		}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	_sendWriteCommand: function(apiURL, data, callback) {
		var cmd = {
			apiURL: apiURL,
			data: data
		};
		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = function(error, keys){
				if(!error){error = undefined;}
				callback(error, keys)
			};
		}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};
