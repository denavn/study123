var RouterInited = require("../../_Internal/RouterInit");
var GSGlobals = require("../../_Internal/GSGlobals");
var OrientationEmitter = require('../../../Device/OrientationEmitter').OrientationEmitter;

exports._Tests = {
	_sendCommand: function(apiURL,msg,callback){
		NgLogD("JP Public call :" + apiURL);
		var cmd = {
			apiURL:apiURL,
			data:msg
		};
	
		if(callback !== undefined && typeof callback == "function") {
			cmd["callbackFunc"] = callback;
		}
	
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

	initSessionWithUserInfo: function(msg,callback) {
		this._sendCommand("JP.Service.Misc.initSessionWithUserInfo",msg,callback);
	},

	loginWithUserInfo:function(msg) {
		var cmd = {
			apiURL:"JP.Service.Misc.loginWithUserInfo",
			data:msg
		};

		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

	logout:function(msg) {
		var cmd = {
			apiURL:"JP.Service.Misc.logout",
			data:msg
		};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

	updateFriendList: function(msg,callback) {
		var cmd = {
			apiURL:"JP.Service.Misc.updateFriendList",
			data:msg
		};
	
		if(callback !== undefined && typeof callback == "function") {
			cmd["callbackFunc"] = callback;
		}

		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

	_sendGameOrientationChange: function() {
		var Orientation = OrientationEmitter.getInterfaceOrientation();
		var cmd = {
			data: {
				Orientation: Orientation
			},
			apiURL:"JP.Service.Misc.receiveGameOrienationChange"
		};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};
