var RouterInited = require("../../../_Internal/RouterInit");
var GSGlobals = require("../../../_Internal/GSGlobals");

/**
 * @namespace 
 * @name Social.US.Service.Home
 */
exports.Home = {
	
	/**
	 * Displays the Mobage home screen.
	 *
	 * @name Social.US.Service.Home.showMobage
	 * @function
	 * @private	 
	 *
	 * @param {Function} callback The callback function.
	 * <br/> 
	 * <b>Callback Example:</b><br/>
	 * <code>function(error){<br/>
	 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;<br/>
	 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;<br/>
	 * &nbsp;&nbsp;   }<br/>
	 * </code>
	 */		
	showMobage: function(onDismissCallback) {
		NgLogD("Public call showMobage");
	
		var cmd = {
			apiURL:"US.Service.Home.showMobage"
		};
	
		if(onDismissCallback != undefined && typeof onDismissCallback == "function") {
			cmd["callbackFunc"] = onDismissCallback;
		}
	
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};
