////////////////////////////////////////////////////////////////////////////////
// Class LocalGameList
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Proc = require('./Proc').Proc;
var Class = require('./Class').Class;
var MessageListener = require('./MessageListener').MessageListener;
var ObjectRegistry = require('./ObjectRegistry').ObjectRegistry;
var Capabilities = require('./Capabilities').Capabilities;
var Base64 = require('./Base64').Base64;
var toMD5 = require('./toMD5').toMD5;
var Util = require('../Network/Util').Util;
var LifecycleEmitter = require('../Device/LifecycleEmitter').LifecycleEmitter;
var OrientationEmitter = require('../Device/OrientationEmitter').OrientationEmitter;

////////////////////////////////////////////////////////////////////////////////

var LifeListener = MessageListener.subclass(
{
	initialize: function(listen)
	{
		LifecycleEmitter.addListener(this, this.onLifecycleUpdate);
		this._listener = listen;
	},

	destroy: function()
	{
		LifecycleEmitter.removeListener(this);
	},

	onLifecycleUpdate: function(event)
	{
		switch (event)
		{
			case Device.LifecycleEmitter.Event.Resume:
				this._listener.onResume();
				break;
		}
	}
});

exports.LocalGameList = Class.singleton (
/** @lends Core.LocalGameList.prototype */
{
	classname: 'LocalGameList',

	/**
	 * @class The <code>LocalGameList</code> class constructs objects that handle the loading and updating of a user's application list.
	 * @status iOS, Android, Test, iOSTested, AndroidTested
	 * @constructs The default constructor.
	 * @singleton
	 * @augments Core.Class
	 * @since 1.0
	 */
	initialize: function()
	{
		ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);

		new LifeListener(this);
		this.mRefCount = 0;
		this.mRefTable = [];
		this.mSpaceAvailable = 0;
		this.mRequiredAvailableSpace = 0;
		
		this.mSpaceCB = [];

		this._getRepoSpaceSendGen();

		var self = this;
		var KeyValueCache = require('../Storage/KeyValue').KeyValueCache;
		this.mGameStore = KeyValueCache.global("Core.GameList");
		this.mActiveGameKey = "activeGames";
		this.onResume();
	},


	/** @private */
	onResume: function()
	{
		this._reloadGameList();
	},

	_reloadGameList: function()
	{
		this.mGameStore.getItem(this.mActiveGameKey, {},
			(function(error, value)
			{
				var list;
				if (value)
					list = JSON.parse(value);
				else
					list = [];

				this.mGameList = list;
				if (typeof this.mListListen == 'function')
					this.mListListen();
			}).bind(this),
			true
		);
	},

	/** @private */
	setListListener: function(funk)
	{
		this.mListListen = funk;
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 302,
	// Method create = -1
	// Method updateGame = 2
	// Method updateDone = 3
	// Method getRepoSpace = 4
	// Method repoSpace = 5
	// Method deleteGame = 6
	// Method _setUpdateProgressVisible = 7
	// Method _setUpdateProgressBounds = 8
	// Method pauseUpdate = 9
	// Method resumeUpdate = 10
	// Method cancelUpdate = 11
	// Method updateProgress = 12
	// Method runGame = 13
	// Method finishGame = 14
	// Method _forwardException = 15
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Proc.parseInt( cmd.shift(), 10 );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Proc.parseInt( cmd.shift(), 10 );
			var instance = ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				case 3:
					instance._updateDoneRecv( cmd );
					break;
				case 5:
					instance._repoSpaceRecv( cmd );
					break;
				case 12:
					instance._updateProgressRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in LocalGameList._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in LocalGameList._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[302] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_updateDoneRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in LocalGameList.updateDone from command: " + cmd );
			return false;
		}
		
		obj[ "id" ] = Proc.parseInt( cmd[ 0 ] );
		if( obj[ "id" ] === undefined )
		{
			NgLogE("Could not parse id in LocalGameList.updateDone from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Proc.parseString( cmd[ 1 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in LocalGameList.updateDone from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_repoSpaceRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in LocalGameList.repoSpace from command: " + cmd );
			return false;
		}
		
		obj[ "space" ] = Proc.parseInt( cmd[ 0 ] );
		if( obj[ "space" ] === undefined )
		{
			NgLogE("Could not parse space in LocalGameList.repoSpace from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_updateProgressRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 4 )
		{
			NgLogE("Could not parse due to wrong argument count in LocalGameList.updateProgress from command: " + cmd );
			return false;
		}
		
		obj[ "url" ] = Proc.parseString( cmd[ 0 ] );
		if( obj[ "url" ] === undefined )
		{
			NgLogE("Could not parse url in LocalGameList.updateProgress from command: " + cmd );
			return false;
		}
		
		obj[ "cur" ] = Proc.parseInt( cmd[ 1 ] );
		if( obj[ "cur" ] === undefined )
		{
			NgLogE("Could not parse cur in LocalGameList.updateProgress from command: " + cmd );
			return false;
		}
		
		obj[ "total" ] = Proc.parseInt( cmd[ 2 ] );
		if( obj[ "total" ] === undefined )
		{
			NgLogE("Could not parse total in LocalGameList.updateProgress from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Proc.parseBool( cmd[ 3 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in LocalGameList.updateProgress from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x12effff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_updateGameSendGen: function( url, id )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x12e0002, this, [ Proc.encodeString( url ), +id ] );
	},
	
	/** @private */
	_getRepoSpaceSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Proc.appendToCommandString( 0x12e0004, this );
	},
	
	/** @private */
	_deleteGameSendGen: function( mdFive )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Proc.appendToCommandString( 0x12e0006, this, [ Proc.encodeString( mdFive ) ] );
	},
	
	/** @private */
	__setUpdateProgressVisibleSendGen: function( visible )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Proc.appendToCommandString( 0x12e0007, this, [ ( visible ? 1 : 0 ) ] );
	},
	
	/** @private */
	__setUpdateProgressBoundsSendGen: function( x, y, w, h )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x12e0008, this, [ +x, +y, +w, +h ] );
	},
	
	/** @private */
	_pauseUpdateSendGen: function( url )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Proc.appendToCommandString( 0x12e0009, this, [ Proc.encodeString( url ) ] );
	},
	
	/** @private */
	_resumeUpdateSendGen: function( url )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Proc.appendToCommandString( 0x12e000a, this, [ Proc.encodeString( url ) ] );
	},
	
	/** @private */
	_cancelUpdateSendGen: function( url )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Proc.appendToCommandString( 0x12e000b, this, [ Proc.encodeString( url ) ] );
	},
	
	/** @private */
	_runGameSendGen: function( url )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Proc.appendToCommandString( 0x12e000d, this, [ Proc.encodeString( url ) ] );
	},
	
	/** @private */
	_finishGameSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Proc.appendToCommandString( 0x12e000e, this );
	},
	
	/** @private */
	__forwardExceptionSendGen: function( exceptionString )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Proc.appendToCommandString( 0x12e000f, this, [ Proc.encodeString( exceptionString ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// updateGame: function( url, id ) {}
	
	// _updateDoneRecv: function( cmd ) {}
	// getRepoSpace: function(  ) {}
	
	// _repoSpaceRecv: function( cmd ) {}
	// deleteGame: function( mdFive ) {}
	
	// _setUpdateProgressVisible: function( visible ) {}
	
	// _setUpdateProgressBounds: function( x, y, w, h ) {}
	
	// pauseUpdate: function( url ) {}
	
	// resumeUpdate: function( url ) {}
	
	// cancelUpdate: function( url ) {}
	
	// _updateProgressRecv: function( cmd ) {}
	// runGame: function( url ) {}
	
	// finishGame: function(  ) {}
	
	// _forwardException: function( exceptionString ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


	,
	_setProgressVisible: function (progressVisible) {
		this.progressVisible = progressVisible;
		this.__setUpdateProgressVisibleSendGen(progressVisible);
	},
	
	_setProgressBounds: function(bounds) {
		this.__setUpdateProgressBoundsSendGen(bounds[0],bounds[1],bounds[2],bounds[3]);
	},

	/**
	 * Restart the current application.
	 * @returns {void}
	 * @since 1.0.6
	 */
	restartGame: function()
	{
		this.runGame(Capabilities.getServer() + "/" + Capabilities.getGame());
	},

	/**
	 * Launch an application from the specified URL.
	 * @param {String} url The URL of an application. On the Japan platform, use the value
	 *		<code>null</code> to exit the application.
	 * @returns {void}
	 * @since 1.0
	 */
	runGame: function( url )
	{
		console.log("Calling runGame with " + url);
		if (!url)
		{
			console.log("Finishing");
			this._finishGame();
		}
		else
		{
			this._runGameSendGen(Util.NormalizeUrl(url));
		}
	},

	/** 
	 * @private 
	 */
	_finishGame: function()
	{
		this._finishGameSendGen();
	},

	// Next 5 functions are for mobage, not developers.

	// callback = function(gameUrl, dl'd, total, error)
	// mobage responsibility to intercept when dl'd == total, update is finished
	//	or know if there was an error by checking that param

    /**
     * @private
     */
	listenUpdates: function(callback)
	{
		this.mUpdateListener = callback;
	},

    /**
     * @private
     */
	stopUpdateListening: function()
	{
		delete this.mUpdateListener;
	},

    /**
     * @private
     */
	pauseUpdate: function(url)
	{
		this._pauseUpdateSendGen(Util.NormalizeUrl(url));
	},

    /**
     * @private
     */
	resumeUpdate: function(url)
	{
		this._resumeUpdateSendGen(Util.NormalizeUrl(url));
	},

    /**
     * @private
     */
	cancelUpdate: function(url)
	{
		this._cancelUpdateSendGen(Util.NormalizeUrl(url));
	},

	/**
	* Update an application at the specified URL.
	* @example Core.LocalGameList.updateGame(url, (function(err)
	*	{
	*		if (err)
	*		{
	*			NgLogE("GameHub error updating game! " + err);
	*			Network.Util.showSimpleNetworkError();
	*			this._loadingGame = false;
	*		}
	*		else
	*		{
	*			Core.LocalGameList.runGame(url);
	*		}
	*	});
	* @param {String} url The specified URL.
	* @cb {Function} cb The function to call after updating the application.
	* @cb-param {String} err The error message, if any.
	* @cb-returns {void}
	* @returns {Number} The number of additional applications being updated.
	* @status Flash, Test, FlashTested
	* @since 1.0
	*/
	updateGame: function( url , cb )
	{
		var reqId = this.mRefCount;
		this.mRefTable[this.mRefCount++] = cb;

		this._updateGameSendGen( Util.NormalizeUrl(url), reqId );
		return reqId;
	},

	/**
	 * Update and restart the current application without restarting the ngCore binary. Calling this
	 * method is equivalent to calling <code>{@link Core.LocalGameList#runUpdatedGame}</code> and
	 * specifying the current application in the <code>url</code> parameter.
	 * @example
	 * Core.LocalGameList.updateAndRestartCurrentGame();
	 * @returns {void}
	 * @since 1.7
	 */
	updateAndRestartCurrentGame : function()
	{
		this.runUpdatedGame(Capabilities.getUrl());
		OrientationEmitter.setInterfaceOrientation(OrientationEmitter.Orientation.Portrait, false);
	},

	/**
	* Launch an updated application from the specified URL.
	* @example Core.LocalGameList.runUpdatedGame('/games/MyGames');
	* @param {String} url The specified URL of an updated application.
	* @returns {void}
	* @status Flash, Test, FlashTested
	* @since 1.0
	*/
	runUpdatedGame: function (url)
	{
		if (!url)
		{
			this._finishGame();
			return;
		}

		this.updateGame(url,
			(function(err)
			{
				if (err)
				{
					NgLogE("LGL Error updating game! " + err);
					Util.showFatalErrorDialog();
				}
				else
				{
					this.runGame(url);
				}
			}).bind(this)
		);
	},

	_updateProgressRecv: function( cmd )
	{
		var obj = {};
		this._updateProgressRecvGen(cmd, obj);
		if (this.mUpdateListener)
			this.mUpdateListener(obj.url, obj.cur, obj.total, obj.error);
	},

	_updateDoneRecv: function( cmd )
	{
		var obj = {};
		this._updateDoneRecvGen(cmd, obj);

		this._reloadGameList();

		var cb = this.mRefTable[obj.id];
		if (cb)
		{
			cb(obj.error);
		}

		delete this.mRefTable[obj.id];
		this._getRepoSpaceSendGen();
	},

	_repoSpaceRecv: function( cmd )
	{
		var obj = {};
		this._repoSpaceRecvGen(cmd, obj);
		this.mSpaceAvailable = obj.space - 7340032; // KJ report 7mb less
		console.log('LocalGameList.got response:', this.mSpaceAvailable, 'and need:', this.mRequiredAvailableSpace);
		
		if(this.mRequiredAvailableSpace > this.mSpaceAvailable)
		{
			var errorAlert = new UI.AlertDialog();
			errorAlert.setText(Core.Localization.getString("SD card is full"));
			errorAlert.setChoices([Core.Localization.getString("Exit")]);
			errorAlert.game = this.game;
			errorAlert.onchoice = function(ret)
			{
				errorAlert.hide();
				LifecycleEmitter.exitProcess();
			};
			errorAlert.show();
		}
		else
		{
			for(var i=0; i < this.mSpaceCB.length; ++i)
			{
				this.mSpaceCB[i]();
			}
			this.mSpaceCB = [];
			this.mRequiredAvailableSpace = 0;
		}
	},

	/**
	 * @private
	 */
	getGameList: function()
	{
		// Caveat! This will return an empty list if it is the first call. Must initialize beforehand.-KJ
		return this.mGameList;
	},

	/**
	 * @private
	 */
	updateGameList: function(list)
	{
		this.mGameList = list;
	},

	/**
	 * @private
	 */
	freeSpace: function(space, cb)
	{
		this.mRequiredAvailableSpace += space;
		
		this.mSpaceCB.push(cb);
		console.log('LocalGameList.freeSpace space=', this.mRequiredAvailableSpace);
		if(this.mSpaceCB.length == 1)
		{
			console.log('LocalGameList.sending request to native');
			// Send request to native if this is the first requester.
			this._getRepoSpaceSendGen();
		}
	},

	/**
	 * @private
	 */
	deleteGame: function(url)
	{
		url = Util.NormalizeUrl(url);
		var hash = toMD5(url);
		this._deleteGameSendGen(hash);

		var self = this;
		var doneCB = function ()
		{
			NgLogD("LocalGameList finished deleting game from " + self.mActiveGameKey + " for " + hash );
		};

		// Update cached game list to match what's going to happen outside of game proc.
		// Matches logic in _LocalGameList._deleteGameFromStorage, but doesn't
		// write to Storage key.
		if( this.mGameList )
		{
			var list = this.mGameList;
			var good = false;
			var ind;
			var out = [];
			for(ind = 0; ind < list.length; ++ind)
			{
				if(list[ind].name == hash)
					good = true;
				else
					out.push(list[ind]);
			}

			if( good )
			{
				NgLogD("LocalGameList found and removed " + hash);
				this.mGameList = out;
			}
			else
				NgLogD("LocalGameList failed to find and remove " + hash);
		}
		else
			NgLogD("LocalGameList cache not warm, can't remove " + hash);
	},

	/**
	 * Check if an update is available for the specified application.<br /><br />
	 * The following code illustrates how to retrieve an application name to pass in for this call.
	 * @param {String} game The specified game. Use <code>{@link Core.Capabilities#getGame}</code> to return the game name.
	 * @cb {Function} doneCB The function to call after checking for an update.
	 * @cb-param {Boolean} updated Set to <code>true</code> if an update is available for the
	 *		application.
	 * @cb-param {Number} spaceNeeded The amount of space, in bytes, that is required to download
	 *		the update.
	 * @cb-returns {void}
	 * @cb {Function} errorCB The function to call if an error occurs.
	 * @cb-param {String} err The error message, if any.
	 * @cb-returns {void}
	 * @example
	 *
	 * updateButton.onclick = function() {
	 *     LocalGameList.updateAvailable(Core.Capabilities.getUrl(), function(updated, spaceNeeded) {
	 *         if (updated)
	 *             LGL.runUpdatedGame(Core.Capabilities.getUrl());
	 *     },
     *     function (error) {
     *         console.log("An error occurred while checking for an application update: " + error);
	 *     });
	 * };
	 * @returns {void}
	 * @status
	 * @since 1.0
	 */
	updateAvailable: function(game, doneCB, errorCB)
	{
		var _int_LGL = require('./_int_LGL')._int_LGL;
		_int_LGL.updateAvailable(game, doneCB, errorCB);
	},

	_forwardException: function( exceptionString )
	{
		this.__forwardExceptionSendGen(exceptionString);
	}
});
