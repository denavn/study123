/**
 * Public Social.Common.Profanity
 */
var GSGlobals = require("../../_Internal/GSGlobals");

exports.Profanity = {
	checkProfanity: function(text, callback) {
		var data = {
			text: text
		};
		this._sendComannd("JP.Profanity.checkProfanity", data, callback);
	},	
	_sendComannd: function(apiURL, data , callback){
		var cmd = {
			apiURL: apiURL,
			data: data
		};
	
		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = function(error, profanity){
				callback(error, profanity);
				if(!error){error = undefined;}
			};
		}
	
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};
