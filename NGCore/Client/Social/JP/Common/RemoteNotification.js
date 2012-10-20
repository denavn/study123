/**
 * Public Social.Common.RemoteNotification
 */

var GSGlobals = require("../../_Internal/GSGlobals");
var _notificationEmitter = new Core.MessageEmitter();
var _notificationQueue = [];

/** @lends Social.Common.RemoteNotification.prototype */
exports.RemoteNotification = {
	/*
	 * 
	 *
	 */

	/*
	 *
	 */
	send: function(recipientId, payload, callback){
		var data = {
			recipientId: recipientId,
			payload: payload
		};
		this._sendSingleUserCommand("JP.RemoteNotification.send", data, callback);
	},

	/*
	 *
	 */
	getRemoteNotificationsEnabled: function(callback){ 
		var data = {
		};
		this._sendSingleUserCommand("JP.RemoteNotification.getRemoteNotificationsEnabled", data, callback);
	},


	/*
	 *
	 */
	setRemoteNotificationsEnabled: function(enabled, callback){ 
		var data = {
			enabled: enabled
		};
		this._sendSingleUserCommand("JP.RemoteNotification.setRemoteNotificationsEnabled", data, callback);
	},

	// private methods to handle Router Command
	_sendSingleUserCommand: function(apiURL, data, callback) {
		var cmd = {
			apiURL: apiURL,
			data: data
		};
		if(callback != undefined && typeof callback == "function") {
			cmd["callbackFunc"] = function(error, remoteNotification){
				if(!error){error = undefined;}
				callback(error, remoteNotification);
			};
		}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};
