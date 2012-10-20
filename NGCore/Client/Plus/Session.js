var Storage = require('../Storage').Storage;
var PlusRequestReq = require("./PlusRequest");
var UserReq = require('./User');
var CoreReq = require('../Core');
var UpdaterReq = require("./Updater");
var MessageEmitterReq = require("../../Shared/MessageEmitter");
var Capabilities = require('../Core/Capabilities').Capabilities;

var Session = exports.Session = MessageEmitterReq.MessageEmitter.subclass({
	classname: "Session",
	initialize: function(gameData){
		gameData = gameData || {};
		
		this._consumerKey = gameData._consumerKey || null;
		this._consumerSecret = gameData._consumerSecret || null;
		this._appName = gameData._appName || null;
		this._appVersion = gameData._appVersion || null;

		this.accessToken = null;
		this.accessTokenSecret = null;
		this.user = null;
	},
	loginWithExistingSession: function(cb){
		var session = this;
		Storage.KeyValueCache.local.getItem("com.ngmoco.plus.session.auth_token", function(err, auth_token){
			if(!auth_token){
				cb("No auth_token", session);
				return;
			}
			NgLogD("Logging in with existing session");

			var request = new PlusRequestReq.PlusRequest();
			request.setApiMethod("session");
			request.setHttpMethod("POST");
			var params = session._loginParameters();
			params.auth_token = auth_token;
			request.setPostBody(params);

			request.send(function(err, data, headers, status){
				session._handleLoginResponse(err, data, headers, status, cb);
			});
		});
	},
	loginWithUsernameAndPassword: function(username, password, cb){
		var session = this;
		var request = new PlusRequestReq.PlusRequest();
		request.setApiMethod("session");
		request.setHttpMethod("POST");
		var params = session._loginParameters();
		params.gamertag = username;
		params.password = password;
		request.setPostBody(params);

		var self = this;
		request.send(function(err, data, headers, status){
			self._handleLoginResponse(err, data, headers, status, cb);
		});
	},
	
	getSessionTokensForConsumerKey: function(consumerKey, cb){
		return PlusRequestReq.PlusRequest.getSessionTokensForConsumerKey(consumerKey, cb);
	},

	authenticatedUser: function(){
		return this.user;
	},
	appKey: function(){
		return this._appName;
	},
	appVersion: function(){
		return this._appVersion;
	},
	OAuthConsumerInfo: function(){
		return {
			token: this.accessToken,
			tokenSecret: this.accessSecret,

			consumerKey: this._consumerKey,
			consumerSecret: this._consumerSecret			
		};
	},
	/**
	 * Handles a login response by parsing and setting the User appropriately
	 * @private
	 */
	_handleLoginResponse: function(err, data, headers, status, cb){
        var session = this,
            oldUser = false; //is there a user that is being logged out.
		if(!err && data && data.success === true){
			this.accessToken = data.oauth_token;
			this.accessSecret = data.oauth_secret;

			NgLogD("UserLogin: Get user with data " + JSON.stringify(data.profile));
			var user = UserReq.User.getUserWithData(data.profile);
			if(!user){
				cb("Could not get user from good data", null);
				return;
			} else {
				oldUser = true;
				CoreReq.Core.Analytics._getPipe().sessionEndEvent();
			}

			UpdaterReq.Updater.stop();

            UserReq.User.setCurrentUser(user);
			this.user = user;
			
			this.emit({user: user});

            UpdaterReq.Updater.start();

			if (oldUser) {
				CoreReq.Core.Analytics._getPipe().initialize();
			}
			var auth_token = data.auth_token;
		    NgLogD("Setting local storage - 'com.ngmoco.plus.session.auth_token': '" + auth_token + "'");
		    Storage.KeyValueCache.local.setItem("com.ngmoco.plus.session.auth_token", auth_token, {}, function(){
		    	cb(err, session);
		    });
		}else{
			err = data.error_msg;
			//err = data.error_msg;
			if(data && data.error_msg){
				err = data.error_msg;
			}
			cb(err, session);
		}
	},

	/**
	 * Gets the login parameters
	 * @return A hash of login parameters
	 * @private
	 */
	_loginParameters: function(){
		var devId = Capabilities.getUniqueId();
		var platformOS        = Capabilities.getPlatformOS();
		var platformOSVersion = Capabilities.getPlatformOSVersion();

		if (platformOS == "Mac OS" || platformOS == "flash") {
			platformOS = "flash";
			platformOSVersion = "4.1";
			devId = "2800B673-5927-5B58-895C-363C1260B309";
		}

		// TODO Locale
		// TODO Timezone
		return {
			timezone: "US/Pacific (PDT) offset -25200 (Daylight)",
			device_type: platformOS,
			os_version:  platformOSVersion,
			id: devId,
			locale: "en_US"
		};
	},
	
	end: function(){
		
	}
});

/*
 Begins a game session. This should be called when a game is launched. It sets
 all of the required fields needed for making requests to Plus and handles
 logging users in and out of Plus. 

 keys required: consumerKey, consumerSecret, appName, appVersion
*/
Session.beginGameSessionWithData = function(gameData, cb){
	if(!gameData){
		throw "Missing game data, cannot connect to Plus";
	}
	
	var consumerKey = gameData.consumerKey;
	var consumerSecret = gameData.consumerSecret;
	var appName = gameData.appName;
	var appVersion = gameData.appVersion;
	
	if(!consumerKey){
		throw "Missing consumerKey, cannot connect to Plus+";
	}
	
	if(!consumerSecret){
		throw "Missing consumerSecret, cannot connect to Plus+";
	}
	
	if(!appName){
		throw "Missing appName, cannot connect to Plus+";
	}
	
	if(!appVersion){
		throw "Missing appVersion, cannot connect to Plus+";
	}
	
	var session = new Session();
	session._consumerKey = consumerKey;
	session._consumerSecret = consumerSecret;
	session._appName = appName;
	session._appVersion = appVersion;
	
	Session._currentSession = session;
	
	session.loginWithExistingSession(cb || function(){});
	CoreReq.Core.Analytics.instantiate();
};

Session.endGameSession = function(){
	
};

Session.getCurrentSession = function(){
	return Session._currentSession;
};
