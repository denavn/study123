var RouterInited 	= require("../../../_Internal/RouterInit");
var GSGlobals 		= require("../../../_Internal/GSGlobals");

/**
 * @namespace 
 * @name Social.US.Service.Games
 */
exports.Games = {
	
	
	/**
	 * Shows the game profile.
	 *
	 * @name Social.US.Service.Games.showProfile
	 * @function
	 * @public	 
	 *
	 * @param {Social.US.Game} gameRef A reference to the current game.
	 */		
	showProfile:function(gameRef){
		var cmd = {
			apiURL:"US.Service.Games.showProfile",
			data: {
				gameRef:gameRef
			}
		};
	
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	
	
	/**
	 * Shows the game catalog.
	 *
	 * @name Social.US.Service.Games.showCatalog
	 * @function
	 * @public	 
	 *
	 */	
	showCatalog:function(){
		var cmd = {
			apiURL:"US.Service.Games.showCatalog"
		};
	
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};

