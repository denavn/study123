var Rect = require("../../../UI/ViewGeometry").Rect;

var RouterInited = require("../../_Internal/RouterInit");
var GSGlobals = require("../../_Internal/GSGlobals");

var MessageEmitter = require("../../../Core/MessageEmitter").MessageEmitter;

var Friends = require("../Service/Friends").Friends;
var Profile = require("../Service/Profile").Profile;
var User    = require("../Models/User").User;

/**
 * @class 
 * @name Social.US.Service.ButtonOverlays
 */
exports.ButtonOverlays = {
	/**
	* Displays the "Mobage Community" button.
	*	
	* @name Social.US.Service.ButtonOverlays.showCommunityButton
	* @function
	* @public 
	* 
	* @param {exports.Gravity} gravity Displays the button in the specified corner.
	* @param {Function} callback The callback function if there is an error related to <code>gravity</code> or <code>theme</code> usage.
	* <br/> 
	* <b>Callback Example:</b><br/>
	* <pre class="code">function(error){
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;
	* &nbsp;&nbsp;   }
	* </pre>
	* @see exports.Gravity
	* @status iOS, Android, Test, iOSTested, AndroidTested
	*/   
	showCommunityButton: function(gravity, callback) {
		NgLogD("Public - showCommunityButton");
		
		var cmd = {
			apiURL:"US.Service.ButtonOverlays.showCommunityButton"
		};
		
		cmd.gravity = gravity = gravity || [0,0];
		if (( gravity[0] !== 0 && gravity[0] !== 1)
			|| ( gravity[1] !== 0 && gravity[1] !== 1) )
		{
			throw new Error("showCommunityButton: Illegal/Out-of-Bounds parameter: gravity "+JSON.stringify(gravity));
		}
		
		if (callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = callback;
		} else {
			cmd["callbackFunc"] = null;
		}
		
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

	/**
	* Hides the "Mobage Community" button.
	*
	* @name Social.US.Service.ButtonOverlays.hideCommunityButton
	* @function
	* @public 
	*	
	* @param {Function} callback The callback function if there is an error hiding the button.
	* <br/> 
	* <b>Callback Example:</b><br/>
	* <pre class="code">function(error){
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;
	* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;
	* &nbsp;&nbsp;   }
	* </pre>
	* @status iOS, Android, Test, iOSTested, AndroidTested
	*/	
	hideCommunityButton: function(callback) {
		NgLogD("Public - hideCommunityButton");
		
		var cmd = {
			apiURL:"US.Service.ButtonOverlays.hideCommunityButton"
		};
		
		if (callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = callback;
		} else {
			cmd["callbackFunc"] = null;
		}
		
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

	/**
	 * Shows the balance button.
	 * Shows the balance button where the <code>rect</code> parameter 
	 * determines the size and position of the button.
	 *
	 * @name Social.US.Service.ButtonOverlays.showBalanceButton
	 * @function
	 * @public
	 *	 
	 * @param {UI.ViewGeometry.Rect} rect Determines the size and position of the balance button.
	 * @param {Function} callback The callback function if there is an error with the <code>rect</code> parameter.
     * @param {String} sourcePage String for the Analytics class to event the originating transacting page.
	 * <br/> 
	 * <b>Callback Example:</b><br/>
	 * <pre class="code">function(error){
	 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;
	 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;
	 * &nbsp;&nbsp;   }
	 * </pre>
	 * @see UI.ViewGeometry.Rect
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */
	showBalanceButton: function(rect, callback, sourcePage) {
		NgLogD("Public - showBalanceButton");
		
		var cmd = {
			apiURL:"US.Service.ButtonOverlays.showBalanceButton"
		};
		
		if (rect != undefined) {
			cmd["rect"] = (new Rect(rect)).array(); //Rects Don't travel cleanly.
		} else {
			cmd["rect"] = undefined;
		}
		
		if (callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = callback;
		} else {
			cmd["callbackFunc"] = null;
		}
		
		if(sourcePage != undefined) {
			cmd["sourcePage"] = sourcePage.toString();
		} else {
			cmd["sourcePage"] = "somewhere_game";
		}
	
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},
	
	/**
	 * Hides the balance button.	
	 * @name Social.US.Service.ButtonOverlays.hideBalanceButton
	 * @function
	 * @public 
	 * 
	 * @param {Function} callback The callback function called after the view closes.
	 * <br/> 
	 * <b>Callback Example:</b><br/>
	 * <pre class="code">function(error){
	 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorCode = error.errorCode;
	 * &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;   	var errorDesc = error.description;
	 * &nbsp;&nbsp;   }
	 * </pre>
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */		
	hideBalanceButton: function(callback) {
		NgLogD("Public - hideBalanceButton");
		
		var cmd = {
			apiURL:"US.Service.ButtonOverlays.hideBalanceButton"
		};

		if (callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = callback;
		} else {
			cmd["callbackFunc"] = null;
		}
	
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};