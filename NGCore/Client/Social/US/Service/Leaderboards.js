var GSGlobals = require("../../_Internal/GSGlobals");

/**
 * @class
 * @name Social.US.Service.Leaderboards
 */

exports.Leaderboards = {
	
	/**
	 * Shows the leaderboards.
	 * 
	 * @name Social.US.Service.Leaderboards.showLeaderboards
	 * @function
	 * @public
	 * 
	 * @status un tested
	 */			
	showLeaderboards:function(){
		var cmd = {
			apiURL:"US.Service.Leaderboards.showLeaderboards"
		};
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};
