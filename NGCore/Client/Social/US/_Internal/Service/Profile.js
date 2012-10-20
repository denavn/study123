var RouterInited = require("../../../_Internal/RouterInit");
var GSGlobals = require("../../../_Internal/GSGlobals");

/**
 * @namespace
 * @name Social.US.Service.Profile
 */

exports.Profile = {
	/**
	 * Shows the current user profile.
	 * @name Social.US.Service.Profile.showMyPage
	 * @function
	 * @public 
	 * 
	 * @param tab 
	 */	
	showMyPage:function(tab){		
		var cmd = {
			apiURL:"US.Service.Profile.showMyPage"
		};
		
		if(tab){cmd.tab = tab;}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	
	/**
	 * Shows the current user's account settings.
	 * @name Social.US.Service.Profile.showAccountSettings
	 * @function
	 * @public
	 * 
	 * @param tab 
	 */		
	showAccountSettings:function(tab){		
		var cmd = {
			apiURL:"US.Service.Profile.showMyPage"
		};
		
		if(tab){cmd.tab = tab;}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	
	/**
	 * Shows the current user gamercard.
	 * @name Social.US.Service.Profile.showMyGamercard
	 * @function
	 * @public 
	 * 
	 * @param tab 
	 */
	showMyGamercard:function(tab){
		var cmd = {
			apiURL:"US.Service.Profile.showMyGamercard"
		};
		
		if(tab){cmd.tab = tab;}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	
	showUserGamercard:function(userID){
		var cmd = {
			apiURL:"US.Service.Profile.showUserGamercard"
		};
		
		if(userID){cmd.userID = userID;}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};
