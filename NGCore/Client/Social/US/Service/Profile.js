var RouterInited = require("../../_Internal/RouterInit");
var GSGlobals = require("../../_Internal/GSGlobals");

/**
 * @class
 * @name Social.US.Service.Profile
 */

exports.Profile = {
	
	/**
	 * Shows the user profile of the user specified by the <code>userOrGamertag</code> parameter.
	 * 
	 * @name Social.US.Service.Profile.showUserProfile
	 * @function
	 * @public
	 * 
	 * @param userOrGamertag Identifies the user or gamertag corresponding to the user profile.
	 * @param tab Specifies the name of the tab to show when the UI opens. If <code>null</code>, it opens the default tab.
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */			
	showUserProfile:function(userOrUserGamertag,tab){		
		var cmd = {
			apiURL:"US.Service.Profile.showUserProfile", 
			data:{
				user:userOrUserGamertag
			}
		};
		if(tab){cmd.tab = tab;}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};
