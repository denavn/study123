var GSGlobals = require("../../_Internal/GSGlobals");

exports._Misc = {
	openHomeScreen:function(msg) {
		var cmd = {
			apiURL:"JP.Service.Misc.openHomeScreen",
			data:msg
		};


		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);

	},

	openGameTop: function(msg) {
		var cmd = {
			apiURL:"JP.Service.Misc.openGameTop",
			data:msg
		};


		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);

	},

	createSessionWithUserInfo : function(userInfo,cb) {
		var cmd = {
			apiURL:"JP.Service.Misc.createSessionWithUserInfo",
			data: {
				userInfo : userInfo
			},
			callbackFunc : cb
		};

		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);

	}
};
