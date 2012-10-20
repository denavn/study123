/**
 * Public Social.Common.Auth
 */

var GSGlobals = require("../../_Internal/GSGlobals");

exports.Auth = {
	authorizeToken: function(token, callback) {
		var cmd = {
			apiURL: "JP.Auth.authorizeToken",
			token: token
		};
		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = function(error, verifier){
				callback(error, verifier);
			};
		}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};
