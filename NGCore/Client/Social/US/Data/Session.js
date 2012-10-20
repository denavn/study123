var CoreReq = require('../../../../Client/Core');
//var UserReq = require('../Models/User');
var MessageEmitterReq = require("../../../../Client/Core/MessageEmitter");
var CacheReq = require('../Models/Cache');
var Dispatcher = require('./Dispatcher').Dispatcher;

/**
 * <code>Session</code> manages a user's game sessions.
 * @class 
 * @name Social.US.Session
 */
var Session = exports.Session = MessageEmitterReq.MessageEmitter.subclass({
		
	classname: "Session",
	
	/**
	 * Constructs a session object.
	 * @name Social.US.Session.initialize
	 * @private
	 * @constructs 
	 */	
	initialize: function(gameData){
		if(gameData){
			this._loadSessionData(gameData);
		}
	},
	
	/**
	 * Loads the user's game data into the current session.
	 *
	 * @name Social.US.Session._loadSessionData
	 * @function
	 * @private
	 *
	 * @param {Type} gameData Takes game data and loads it into the current session.
	 */		
	_loadSessionData: function(gameData){
		this._appKey = gameData.appId || this._appKey || null;
		this._appVersion = gameData.appVersion || this._appVersion || null;
		this._platformVersion = gameData.platformVersion || this._platformVersion || "1.0";
		this._serverMode = gameData.serverMode || this._serverMode || null;

		this._user = (gameData.userID ? this.dataCache().getObjectWithRecordID("User", gameData.userID) : null);		
		this.emit({user: this._user});
	},
	
	/**
	 * Returns the cache for the current session. If a session cache does not exist, this call creates a new cache, loads it and returns it.
	 *
	 * @name Social.US.Session.dataCache
	 * @function
	 * @private
	 *
	 * @return {Social.US.Cache} The cache for the current session.
	 */			
	dataCache: function(){
		if(!this._cache){
			this._cache = new CacheReq.Cache();
			this._cache.loadCache(function(err){
				NgLogD("Loaded cache: " + err);
			});
		}
		return this._cache;
	},
	
	
	/**
	 * Returns the user for this session.
	 *
	 * @name Social.US.Session.user
	 * @function
	 *
	 * @returns {Social.US.User} The user for the current session.
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */					
	user: function(){
		return this._user;
	},
	
	

	// data you probably don't need
	/**
	 * Returns the name of the game for this session.
	 *
	 * @name Social.US.Session.appKey
	 * @function
	 *
	 * @returns {String} The application name.
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */						
	appKey: function(){
		return this._appKey;
	},
	
	/**
	 * Returns the version of the game for this session.	 
	 *
	 * @name Social.US.Session.appVersion
	 * @function
	 *
	 * @returns {String} The application version.
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */	
	appVersion: function(){
		return this._appVersion;
	},
	
	/**
	 * Returns the server mode of the game for this session.
	 *
	 * @name Social.US.Session.serverMode
	 * @function
	 *
	 * @returns {String} The server mode.
	 * <b>Note:</b> Valid settings for the server mode include:<br/>
	 * <ul>
	 * <li>staging</li>
	 * <li>integration</li>
	 * <li>sandbox</li>
	 * <li>production</li>
	 * <li>unknown</li>
	 * </ul>
	 * @see Social.US.Session.serverModes
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */		
	serverMode: function(){
		return this._serverMode;
	},
	
	/**
	 * Returns the platform version of the game for this session.
	 *
	 * @name Social.US.Session.platformVersion
	 * @function
	 *
	 * @returns {String} The platform version.
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */		
	platformVersion: function(){
		return this._platformVersion;
	},
	

	/**
	 * Takes a consumer key and retrieves the session tokens for the the consumer key.
	 *
	 * @name Social.US.Session.getSessionTokensForConsumerKey
	 * @function
	 * 
	 * @param {String} consumerKey The consumer key.
	 * @cb {Function} cb The function to call after retrieving the session tokens for the
	 *		consumer key.
	 * @cb-param {Object} error Information about the error, if any.
	 * @cb-param {String} error.description A description of the error.
	 * @cb-param {String} error.errorCode A code identifying the error type.
	 * @cb-param {Object} tokens The session tokens for the consumer key.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 */	
	getSessionTokensForConsumerKey: function(consumerKey, cb){
		Dispatcher.callClassMethodOnRemoteObject("Session", ["getCurrentSession", "getSessionTokensForConsumerKey"], [[], [consumerKey, cb]]);
	}
});


/**
 * The session modes for the server. Session modes include:
 * <ul>
 * <li><code>staging</code></li>
 * <li><code>integration</code></li>
 * <li><code>sandbox</code></li>
 * <li><code>production</code></li>
 * <li><code>unknown</code></li>
 * </ul>
 * @name Social.US.Session.serverModes
 * @field
 * @public
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */
Session.serverModes = {
	staging: "staging",
	integration: "integration",
	partner: "sandbox",
	sandbox: "sandbox",
	production: "production",
	unknown: "unknown"
};

/**
 * Returns the current session.  
 * @name Social.US.Session.getCurrentSession
 * @function
 * @static
 *
 * @returns {Social.US.Session} The current session.
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */	
Session.getCurrentSession = function(){
	return Session._currentSession;
};



Session._emitter = null;

/**
 * Adds a listener to the current session.
 *
 * @name Social.US.Session.addCurrentSessionListener
 * @function
 * @static
 *  
 * @param {Core.MessageListener} listener The listener to add to the current session.
 * @cb {Function} callback The function to call when a session event occurs.
 * @cb-returns {void}
 * @param priority The priority for this <code>MessageListener</code>.
 *
 * @see Core.MessageListener
 * @returns {void}
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */
Session.addCurrentSessionListener = function(listener, callback, priority){	
	if(!Session._emitter){
		Session._emitter = new MessageEmitterReq.MessageEmitter();
	}
	
	Session._emitter.addListener(listener, callback, priority);
};

/**
 * Removes the listener from the current session.
 *
 * @name Social.US.Session.removeCurrentSessionListener 
 * @function
 * @static
 *
 * @param {Core.MessageListener} listener The listener for the current session.
 * @returns {void}
 * @status iOS, Android, Test, iOSTested, AndroidTested
 */
Session.removeCurrentSessionListener = function(listener){
	if(Session._emitter){
		Session._emitter.removeListener(listener);
	}
};
