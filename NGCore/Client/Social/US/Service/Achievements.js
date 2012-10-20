var RouterInited = require("../../_Internal/RouterInit");
var GSGlobals = require("../../_Internal/GSGlobals");

exports.Achievements = {

	showAchievementsScreen: function() {
		NgLogD("Public - showAchievementsScreen");
		
		var cmd = {
			apiURL:"US.Service.Achievements.showAchievementsScreen"
		};

		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};