var RouterInited = require("../../_Internal/RouterInit");
var GSGlobals = require("../../_Internal/GSGlobals");

var MessageEmitter = require("../../../Core/MessageEmitter").MessageEmitter;

var DataModelR = require("../Models/DataModel");
var Dispatcher = require("../Data/Dispatcher").Dispatcher;

/**
 * @class 
 * @name Social.US.Service.Friends
 */
var Friends = exports.Friends = DataModelR.DataModel.subclass({
    classname: "Friends"
});

/**
 * Opens the "Find Friends" view.
 *
 * @name Social.US.Service.Friends.showFindFriends
 * @function
 * @static
 *
 * @param {String} [selectedTab] Takes an optional tab reference.
 * @returns {void}
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */		
Friends.showFindFriends = function(selectedTab) {
		NgLogD("Public call showFindFriends");
	
		var cmd = {
			apiURL:"US.Service.Friends.showFindFriends"
		};
		
		if(selectedTab){
            cmd.data = {};
			cmd.data.tab = selectedTab;
		}
		
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
};

/**
 * Shows the "Friend Picker" view.
 * 
 * @name Social.US.Service.Friends.showFriendPicker
 * @function
 * @static
 * 
 * @param maxFriendsToPick The maximum number of friends to pick. <code>0</code> for unlimited.
 * @cb {Function} callback The function to call after opening the Friend Picker view.
 * @cb-param {Object} error Information about the error, if any.
 * @cb-param {String} [error.description] A description of the error.
 * @cb-param {String} [error.errorCode] A code identifying the error type.
 * @cb-param {String[]} users The user IDs of the selected users. 
 * @cb-returns {void}
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */		
Friends.showFriendPicker = function(maxFriendsToPick, callback) { 
    Dispatcher.callClassMethodOnRemoteObject(Friends, "showFriendPicker", [maxFriendsToPick, callback]);
};

/**
* <code>Social.US.Service.Friends</code> has an invited user message emitter. 
* To add a message listener to the message emitter, see the example below.
*
* @name Social.US.Service.Friends.invitedUserEmitter
* @field
* @example
* 
* Social.US.Service.Friends.invitedUserEmitter.addListener(
*				new Core.MessageListener(), 
*				function(user){ 
*				// do sth. w/ User object 
*				}
* Social.US.Service.Friends.invitedUserEmitter.emit({user: user});
* @see Core.MessageListener
* @see Core.MessageEmitter
* @returns {void}
* @status iOS, Android, Test, iOSTested, AndroidTested
*/
Friends.invitedUserEmitter = new MessageEmitter();