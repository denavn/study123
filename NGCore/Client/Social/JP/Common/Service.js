
var GSGlobals = require("../../_Internal/GSGlobals");

var Core = require('../../../Core').Core;
var callbackForGL;

var _Service;
var _invitedUserEmitter = new Core.MessageEmitter();

_Service = {
	
	openUserFinder: function() {
		var data = {};
		console.log("OPEN USER FINDER IN PUBLICK");
		_Service._sendCommandToGameService("JP.Service.Friends.openUserFinder",data);
	},

	
	
	openFriendPicker: function(maxFriendsToSelect,callback) {
		
		var data = {
			maxFriendsToSelect : maxFriendsToSelect
		};

		_Service._sendCommandToGameService("JP.Service.Friends.openFriendPicker",data,callback);
	},

	
	openUserProfile: function(userId,callback) {
		var data = {
			userId: userId
		};

		
		var _callback = function(error) {


			if (callback) {
			callback(error);
			}
		};

		_Service._sendCommandToGameService("JP.Service.Profile.openUserProfile", data, callback);

	},


	showCommunityButton: function(gravity,theme,callback) {

		var data = {
			gravity: gravity,
			theme : theme
		};
	
	
		_Service._sendCommandToGameService("JP.Service.Overlays.showCommunityButton", data, callback);
	},

	
	hideCommunityButton: function(callback) {
		var data = null;

		_Service._sendCommandToGameService("JP.Service.Overlays.hideCommunityButton", data, callback);
	},

	showBalanceButton: function(rect,theme,callback) {

		var _callback;
		var _theme;
		
		if (typeof(theme) == "function" ) {
			_callback = theme;
			_theme = null;
		} else {
			_callback = callback;
			_theme = theme;
		}

		var data = {
			frame: rect.array(),
			theme : _theme
		};
	
		_Service._sendCommandToGameService("JP.Service.Overlays.showBalanceButton", data, _callback);
	},

	hideBalanceButton: function(callback) {

		var data = {};

		_Service._sendCommandToGameService("JP.Service.Overlays.hideBalanceButton", data, callback);

	},

	_setCallbackForGLView: function(){
		if(callbackForGL){
			return; 
		}

		var cmd = {
			apiURL: "JP.Service.Overlays.setCommunityButtonOnClick"
		};
		if(callback !== undefined && typeof callback === "function") {
			cmd.callbackFunc = function(error, action){
				if(action == 'open'){
					Core.UpdateEmitter.setTickRate(1);
				}else{
					Core.UpdateEmitter.setTickRate(0.01);
				}
			};
		}
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	},

	invitedUserEmitter : _invitedUserEmitter,
	
	_recvFriendInvitation : function (fullCommand) {
		var users = fullCommand.data.users;
		_Service.invitedUserEmitter.emit(users);
	},

	
	_sendCommandToGameService: function(apiURL, data , callback){

		var cmd = {
			apiURL: apiURL,
			data: data
		};

		if(callback !== undefined && typeof callback === "function") {
			cmd.callbackFunc = function(error, result){
				callback(error,result);
			};
		}	
		GSGlobals.getRouterInstance().sendCommandToGameService(cmd);
	}
};




exports.Service = _Service;



