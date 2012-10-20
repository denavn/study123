/**
 * Public Social.Common.Blacklist
 */

var GSGlobals = require("../../_Internal/GSGlobals");

exports.Blacklist = {
	checkBlacklist: function(userId, targetUserId, opt, callback) {
		var option = {};
		option["start"] = (opt && opt.start) ? opt.start : null;
		option["count"] = (opt && opt.count) ? opt.count : null;
		var data = {
			userId: userId,
			targetUserId: targetUserId,
			opt: option
		};
		this._sendListComannd("JP.Blacklist.checkBlacklist", data, callback);
	},	
	_sendListComannd: function(apiURL, data , callback){
		var cmd = {
			apiURL: apiURL,
			data: data
		};
		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = function(error, result){
				var newResult = {
					total: result.total,
					start: result.start,
					count: result.count
				};
				if(!error){error = undefined;}
				callback(error, result.blacklists, newResult);
			};
		}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};
