////////////////////////////////////////////////////////////////////////////////
// Class _LocalGameList
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Class = require('./Class').Class;
var Proc = require('./Proc').Proc;
var ObjectRegistry = require('./ObjectRegistry').ObjectRegistry;
var Capabilities = require('./Capabilities').Capabilities;
var Time = require('./Time').Time;
var toMD5 = require('./toMD5').toMD5;
var Util = require('../Network/Util').Util;
var Base64 = require('./Base64').Base64;

////////////////////////////////////////////////////////////////////////////////

var _LocalGameList = exports._LocalGameList = Class.singleton (
/** @lends Core._LocalGameList.prototype */
{
	classname: '_LocalGameList',

	/**
	 * The <code>_LocalGameList</code> class constructs a singleton object that identifies all of the
	 * applications that a client can download. It also manages downloading of updated applications and
	 * ensures that adequate space is available to save updated files on the device.
	 * @constructs The default constructor.
	 * @augments Core.Class
	 */
	initialize: function()
	{
		ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);

		this.mGameList = [];
		var Storage = require('../Storage').Storage;
		this.mFile = Storage.FileSystem;
		this.mGameStore = Storage.KeyValueCache.global("Core.GameList");

		this.mLoadingGames = {};
		this.mActiveGameKey = "activeGames";
		this.mRequiredAvailableSpace = 0;
		this.mSpaceAvailable = 0;
		this.mSpaceFreeCallbacks = [];
		this._firstBootGameLaunch = true;

		this._getRepoSpaceSendGen();

		this._setStage(this.ProgressStage.BootFirst);
		this._reloadGameList();
		this._allowDeterminateProgress = true;
	},
	
	ProgressStage:
	{
		BootFirst: {boot:[-1,0], progressBar:[0,0.25]},
		CheckConfiguration: {boot:[-1,0], progressBar:[0.25,0.25]},
		CheckManifest: {boot:[-1,0], progressBar:[0.25,0.25]},
		DownloadFiles: {boot:[0.1,0.9], progressBar:[0.25,0.75]},
		Launching: {boot:[-1,0], progressBar:[0.75,1]}
	},
	
	_setStage: function(stage)
	{
		this._progressStage = stage;
		if (typeof stage == 'object') {
			this._progressMin = this._progressStage[ this._hasProgressBar ? "progressBar" : "boot"][0];
			this._progressRange = this._progressStage[ this._hasProgressBar ? "progressBar" : "boot"][1];
		} else {
			this._progressMin = -1;
			this._progressRange = 0;
		}
		console.log('min:', this._progressMin, 'range:', this._progressRange);
		this._setProgress(0);
	},
	
	_nextStage: function()
	{
		switch(this._progressStage)
		{
			case this.ProgressStage.BootFirst:
				this._setStage(this.ProgressStage.CheckConfiguration);
				break;
			case this.ProgressStage.CheckConfiguration:
				this._setStage(this.ProgressStage.CheckManifest);
				break;
			case this.ProgressStage.CheckManifest:
				this._setStage(this.ProgressStage.DownloadFiles);
				break;
			case this.ProgressStage.DownloadFiles:
				this._setStage(this.ProgressStage.Launching);
				break;
		}
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 303,
	// Method create = -1
	// Method updateGame = 2
	// Method updateDone = 3
	// Method getRepoSpace = 4
	// Method repoSpace = 5
	// Method deleteGame = 6
	// Method setUpdateProgress = 7
	// Method pauseUpdate = 8
	// Method resumeUpdate = 9
	// Method cancelUpdate = 10
	// Method updateProgress = 11
	// Method allowBGUpdates = 12
	// Method runGame = 13
	// Method finishGame = 14
	// Method setProgressText = 15
	// Method setSplashVisible = 16
	// Method exceptionForwarded = 17
	// Method setHasCustomProgressBar = 18
	// Method gameUnbundled = -19
	
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
				
				case 2:
					instance._updateGameRecv( cmd );
					break;
				case 5:
					instance._repoSpaceRecv( cmd );
					break;
				case 6:
					instance._deleteGameRecv( cmd );
					break;
				case 8:
					instance._pauseUpdateRecv( cmd );
					break;
				case 9:
					instance._resumeUpdateRecv( cmd );
					break;
				case 10:
					instance._cancelUpdateRecv( cmd );
					break;
				case 12:
					instance._allowBGUpdatesRecv( cmd );
					break;
				case 13:
					instance._runGameRecv( cmd );
					break;
				case 14:
					instance._finishGameRecv( cmd );
					break;
				case 17:
					instance._exceptionForwardedRecv( cmd );
					break;
				case 18:
					instance._setHasCustomProgressBarRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in _LocalGameList._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				case -19:
					_LocalGameList._gameUnbundledRecv( cmd );
					break;
				default:
					NgLogE("Unknown static method id " + cmdId + " in _LocalGameList._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[303] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_updateGameRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in _LocalGameList.updateGame from command: " + cmd );
			return false;
		}
		
		obj[ "url" ] = Proc.parseString( cmd[ 0 ] );
		if( obj[ "url" ] === undefined )
		{
			NgLogE("Could not parse url in _LocalGameList.updateGame from command: " + cmd );
			return false;
		}
		
		obj[ "id" ] = Proc.parseInt( cmd[ 1 ] );
		if( obj[ "id" ] === undefined )
		{
			NgLogE("Could not parse id in _LocalGameList.updateGame from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_repoSpaceRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in _LocalGameList.repoSpace from command: " + cmd );
			return false;
		}
		
		obj[ "space" ] = Proc.parseInt( cmd[ 0 ] );
		if( obj[ "space" ] === undefined )
		{
			NgLogE("Could not parse space in _LocalGameList.repoSpace from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_deleteGameRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in _LocalGameList.deleteGame from command: " + cmd );
			return false;
		}
		
		obj[ "mdFive" ] = Proc.parseString( cmd[ 0 ] );
		if( obj[ "mdFive" ] === undefined )
		{
			NgLogE("Could not parse mdFive in _LocalGameList.deleteGame from command: " + cmd );
			return false;
		}
		
		obj[ "game" ] = Proc.parseString( cmd[ 1 ] );
		if( obj[ "game" ] === undefined )
		{
			NgLogE("Could not parse game in _LocalGameList.deleteGame from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_pauseUpdateRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in _LocalGameList.pauseUpdate from command: " + cmd );
			return false;
		}
		
		obj[ "url" ] = Proc.parseString( cmd[ 0 ] );
		if( obj[ "url" ] === undefined )
		{
			NgLogE("Could not parse url in _LocalGameList.pauseUpdate from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_resumeUpdateRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in _LocalGameList.resumeUpdate from command: " + cmd );
			return false;
		}
		
		obj[ "url" ] = Proc.parseString( cmd[ 0 ] );
		if( obj[ "url" ] === undefined )
		{
			NgLogE("Could not parse url in _LocalGameList.resumeUpdate from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_cancelUpdateRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in _LocalGameList.cancelUpdate from command: " + cmd );
			return false;
		}
		
		obj[ "url" ] = Proc.parseString( cmd[ 0 ] );
		if( obj[ "url" ] === undefined )
		{
			NgLogE("Could not parse url in _LocalGameList.cancelUpdate from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_allowBGUpdatesRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in _LocalGameList.allowBGUpdates from command: " + cmd );
			return false;
		}
		
		obj[ "allow" ] = Proc.parseBool( cmd[ 0 ] );
		if( obj[ "allow" ] === undefined )
		{
			NgLogE("Could not parse allow in _LocalGameList.allowBGUpdates from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_runGameRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in _LocalGameList.runGame from command: " + cmd );
			return false;
		}
		
		obj[ "url" ] = Proc.parseString( cmd[ 0 ] );
		if( obj[ "url" ] === undefined )
		{
			NgLogE("Could not parse url in _LocalGameList.runGame from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_finishGameRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 0 )
		{
			NgLogE("Could not parse due to wrong argument count in _LocalGameList.finishGame from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_exceptionForwardedRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in _LocalGameList.exceptionForwarded from command: " + cmd );
			return false;
		}
		
		obj[ "exceptionString" ] = Proc.parseString( cmd[ 0 ] );
		if( obj[ "exceptionString" ] === undefined )
		{
			NgLogE("Could not parse exceptionString in _LocalGameList.exceptionForwarded from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_setHasCustomProgressBarRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in _LocalGameList.setHasCustomProgressBar from command: " + cmd );
			return false;
		}
		
		obj[ "hasProgressBar" ] = Proc.parseBool( cmd[ 0 ] );
		if( obj[ "hasProgressBar" ] === undefined )
		{
			NgLogE("Could not parse hasProgressBar in _LocalGameList.setHasCustomProgressBar from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	$_gameUnbundledRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 0 )
		{
			NgLogE("Could not parse due to wrong argument count in _LocalGameList.gameUnbundled from command: " + cmd );
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
		Proc.appendToCommandString( 0x12fffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_updateDoneSendGen: function( id, error )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Proc.appendToCommandString( 0x12f0003, this, [ +id, Proc.encodeString( error ) ] );
	},
	
	/** @private */
	_getRepoSpaceSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Proc.appendToCommandString( 0x12f0004, this );
	},
	
	/** @private */
	_setUpdateProgressSendGen: function( progress )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), ]);
#endif*/
		Proc.appendToCommandString( 0x12f0007, this, [ +progress ] );
	},
	
	/** @private */
	_updateProgressSendGen: function( url, cur, total, error )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('any'), ]);
#endif*/
		Proc.appendToCommandString( 0x12f000b, this, [ Proc.encodeString( url ), +cur, +total, ( error ? 1 : 0 ) ] );
	},
	
	/** @private */
	_setProgressTextSendGen: function( text )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Proc.appendToCommandString( 0x12f000f, this, [ Proc.encodeString( text ) ] );
	},
	
	/** @private */
	_setSplashVisibleSendGen: function( visible )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('any'), ]);
#endif*/
		Proc.appendToCommandString( 0x12f0010, this, [ ( visible ? 1 : 0 ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// _updateGameRecv: function( cmd ) {}
	// updateDone: function( id, error ) {}
	
	// getRepoSpace: function(  ) {}
	
	// _repoSpaceRecv: function( cmd ) {}
	// _deleteGameRecv: function( cmd ) {}
	// setUpdateProgress: function( progress ) {}
	
	// _pauseUpdateRecv: function( cmd ) {}
	// _resumeUpdateRecv: function( cmd ) {}
	// _cancelUpdateRecv: function( cmd ) {}
	// updateProgress: function( url, cur, total, error ) {}
	
	// _allowBGUpdatesRecv: function( cmd ) {}
	// _runGameRecv: function( cmd ) {}
	// _finishGameRecv: function( cmd ) {}
	// setProgressText: function( text ) {}
	
	// setSplashVisible: function( visible ) {}
	
	// _exceptionForwardedRecv: function( cmd ) {}
	// _setHasCustomProgressBarRecv: function( cmd ) {}
	// $_gameUnbundledRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


	,
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
	_updateGameRecv: function( cmd )
	{
		this._getRepoSpaceSendGen();

		var o = {};
		this._updateGameRecvGen(cmd, o);

		if (o.url in this.mLoadingGames)
		{
			this.mLoadingGames[o.url].id = o.id;
			this.mLoadingGames[o.url].dlman.resume();
		}
		else
		{
			this.updateGame(o.url, o.id,
				(function (url, newFiles, err)
				{
					o.id = this.mLoadingGames[url].id;
					this._updateDoneSendGen(o.id, err || ""); // err should be a string.
				}).bind(this, o.url)
			);
		}
	},
	mobageRunGame: function (funk)
	{
		this._gameRunner = funk;
	},
	_runGameRecv: function( cmd )
	{
		var o = {};
		this._runGameRecvGen(cmd, o);
		if (this._gameRunner)
		{
			console.log("_LGL running gameRunner " + o.url);
			this._gameRunner(o.url);
		}
		else
		{
			console.log("_LGL running game " + o.url);
			var _int_LGL = require('./_int_LGL')._int_LGL;
			_int_LGL.launch(o.url, _int_LGL.ProcID.Game);
		}
	},
	/**
	 * set the function that kills the current game app
	 */
	setFinishGameHandler: function(funk)
	{
		this._finishGameHandler = funk;
	},
	_finishGameRecv: function()
	{
		if (this._finishGameHandler)
		{
			this._finishGameHandler();
		} else {
			console.log("_LocalGameList: finishGameHandler is not set");
		}
	},
	_repoSpaceRecv: function( cmd )
	{
		var obj = {};
		this._repoSpaceRecvGen(cmd, obj);
		this.mSpaceAvailable = obj.space;
		console.log("SD card space available(b): " + this.mSpaceAvailable);

		var length = this.mSpaceFreeCallbacks.length;
		while (length--)
		{
			(this.mSpaceFreeCallbacks.pop())();
		}
	},

	_deleteGameRecv: function( cmd )
	{
		// site to calc md5: http://pajhome.org.uk/crypt/md5/
		var allowedGames =
		[
			"http://10.15.", // Allow partial ones, for testing
			'http://10.16.',
			'http://gamehub.mobage.com/app/1.0s/gamehub',
			'url of allowed game'
		];

		var obj = {};
		this._deleteGameRecvGen(cmd, obj);
		var i;
		for(i in allowedGames)
		{
			var match = obj.game.match(allowedGames[i]);
			if(match && !match.index)
			{
				NgLogD("Deleting " + obj.mdFive);
				this.deleteGameFiles(obj.mdFive);

				var doneCB = (function ()
				{
					NgLogD("Finished deleting game from " + this.mActiveGameKey + " for " + obj.mdFive );
				}).bind(this);
				this._deleteGameFromStorage(obj.mdFive,doneCB);

				return;
			}
			else
			{
				// for testing, allow any local server starting with 10.15
			}
		}
		NgLogE("_LocalGameList unauthorized call to deleteGame from "+obj.game+"!");
	},

// _deleteGameFromStorage is for deleting the games info from LGL storage, not the game's storage

	_deleteGameFromStorage: function(mdFive,doneCB)
	{
		var self = this;
		this.mGameStore.getItem(this.mActiveGameKey, {},
			function(error, value)
			{
				var list = JSON.parse(value);
				
				var good = false;
				var ind;
				var out = [];
				for(ind = 0; ind < list.length; ++ind)
				{
					if(list[ind].name == mdFive)
						good = true;
					else
						out.push(list[ind]);
				}
				
				if( good )
				{
					NgLogD("_LocalGameList found and removed " + mdFive);
					self.mGameStore.setItem(self.mActiveGameKey, JSON.stringify(out), { blocking: true }, doneCB);
				}
				else
				{
					NgLogD("_LocalGameList failed to find and remove " + mdFive);
					doneCB("Could not remove item: " + error);
				}
				
			}, true
		);
	},

	getGameConfig: function(identifier, isMDFive, callBack)
	{
		if (typeof isMDFive == 'function')
		{
			callBack = isMDFive;
			isMDFive = false;
		}

		var folder;
		if (isMDFive)
		{
			folder = identifier;
		}
		else
		{
			var Util = require('../Network/Util').Util;
			var norm = Util.NormalizeUrl(identifier);
			folder = toMD5(norm);
		}

		NgLogT("@@@ _LocalGameList.getGameConfig readFile +");

		this.mFile.readFile(folder + "/" + Capabilities._getConfigFile(), {},
			function (err, contents)
			{
				NgLogT("@@@ _LocalGameList.getGameConfig readFile -");
				
				var ret = {};
				if (err || !contents)
				{
					console.log("Could not get config from %s! err: %s", identifier, err);
				}
				else
				{
					ret = JSON.parse(contents);
				}
				callBack(ret);
			}
		);
	},

	getRepoSpace: function()
	{
		return this.mSpaceAvailable;
	},

	getConfig: function(gameOrigin, name, callback, failEarly)
	{// callback = function (config, err)
		// XHR
		var XHR = require('../Network/XHR').XHR;
		var Util = require('../Network/Util').Util;
		
		var httpStatus = 0;
		
		Util.OperationWithRetries(function(failCb)
		{
			var req = new XHR();
			req.onreadystatechange = function()
			{
				if(req.readyState == 4)
				{
					httpStatus = req.status;
					if(httpStatus == 200)
					{
						// Succes.
						callback(req.responseText);
					}
					else if(httpStatus == 404)
					{
						// File not on server, so load from the regular location
						console.log("no configuration file found at %s, using root server", gameOrigin + name);
						callback( "{}" );
					}
					else
					{
						//Error! Retry
						failCb();
					}
				}
			};
			req.setRequestHeader("X-Distribution", Capabilities.getDistributionName());
			req.open('GET', gameOrigin + name + Util.getCacheBustingString(), true);
			req.send();
		}, function()
		{
			callback(null, true, httpStatus);
		}, failEarly);
	},

	// gameOrigin: url to folder holding webgame.ngmanifest
	// doneCB = function(totalBytes, error)
	updateGame: function(gameOrigin, id, doneCB, failEarly, failAllowed)
	{
		// console.log ( "LGL.updateGame url = " + gameOrigin );
		// console.log ( "LGL.updateGame boot game = " + Capabilities.getBootGame() );
		
		var re = new RegExp(".*" + Capabilities.getBootGame());
		var match = gameOrigin.match(re);
		
		if (match) 
			this._firstBootGameLaunch = false;
			
		// console.log ( "_LocalGameList.updateGame updating game." );

		// Normalize URL
		var Util = require('../Network/Util').Util;
		gameOrigin = Util.NormalizeUrl(gameOrigin);

		var name = Util.GetMD5HashDirectoryFromUrl(gameOrigin);
		this.mLoadingGames[gameOrigin] = {id: id};

		NgLogI("_LocalGameList.updateGame(): url = " + gameOrigin + " name = " + name);

		// Get device-specific manifest directory
		var buildPath = {"Android" : "android", "iPhone OS" : "ios", "flash" : ""};
		// Get Device capabilities platformOs
		var caps = require("../Core/Capabilities").Capabilities;
		var build = "/" + buildPath[caps.getPlatformOS()];

		this._setStage(this.ProgressStage.CheckConfiguration);

		var curContUrl = "";
		var configFile = name + "/" + caps._getConfigFile();
		
		// This is guaranteed to be synchronous, so will always occur before the callback for subsequent operations.
		this.mFile.readFile(configFile, {},
			function(err, data)
			{
				if (data)
				{
					var obj = JSON.parse(data);
					curContUrl = obj.contentUrl;
				}
			}
		);

		var url = gameOrigin + build + "/" + caps._getConfigFile();
		NgLogI("_LocalGameList.updateGame(): downloading configuration.json, url = " + url);
		this.getConfig(gameOrigin + build, "/" + caps._getConfigFile(),
        (function(config, error, status)
		{
			if (error)
			{
				NgLogI("_LocalGameList.updateGame(): ERROR downloading configuration.json, url = " + url);
				this._setStage(-1); // ERROR
				doneCB(0, error);
				delete this.mLoadingGames[gameOrigin];
			}
			else
			{
				// Read config
				var parsedConfig = JSON.parse(config);
				if(!parsedConfig.contentUrl)
				{
					parsedConfig.contentUrl = gameOrigin + build;
				}
				else if (parsedConfig.contentUrl == curContUrl)
				{
					NgLogI("_LocalGameList.updateGame(): Game is up to date! url = " + url);

					// no need to update.
					this._setStage(this.ProgressStage.Launching);
					this.mFile.writeFile(configFile, JSON.stringify(parsedConfig), {}, (function(err)
					{
						if(err) {
							NgLogE("gameUpdate failed to write config:" + err);
						}
						doneCB(0, err);
						delete this.mLoadingGames[gameOrigin];
					}).bind(this));
					return;
				}

				NgLogI("_LocalGameList.updateGame(): Downloading game! url = " + url);
				this._setStage(this.ProgressStage.CheckManifest);
				this._callDownloadManifest(parsedConfig, gameOrigin, name, failEarly, failAllowed, (function(bytes, error)
				{
					NgLogI("_LocalGameList.updateGame(): Finished Downloading game! url = " + url);

					if (! error) {
						var that = this;
						this._reloadGameList({name:name, url:gameOrigin}, function()
						{
							if (doneCB && (typeof doneCB == 'function')) {
								doneCB(bytes, error);
								delete that.mLoadingGames[gameOrigin];
							}
						});
					} else {
						doneCB(bytes, error);
						delete this.mLoadingGames[gameOrigin];
					}
				}).bind(this));
			}
		}).bind(this), failEarly);
	},

	_allowBGUpdatesRecv: function( cmd )
	{
		var o = {};
		this._allowBGUpdatesRecvGen(cmd, o);
		this._pauseOrResumeAll(o.allow);
	},

	_pauseOrResumeAll: function(resume)
	{
		for (var i in this.mLoadingGames)
		{
			if (resume)
			{
				console.log("Resuming download of " + i);
				this.resumeUpdate(i);
			}
			else
			{
				console.log("Pausing download of " + i);
				this.pauseUpdate(i);
			}
		}
	},

	pauseUpdate: function(url)
	{
		if (this.mLoadingGames[url])
		{
			if(this.mLoadingGames[url].dlman)
			{
				this.mLoadingGames[url].dlman.pause();
				this.mLoadingGames[url].userPause = true;
			}
		}
	},

	_pauseUpdateRecv: function(cmd)
	{
		var o = {};
		this._pauseUpdateRecvGen(cmd, o);
		this.pauseUpdate(o.url);
	},

	resumeUpdate: function(url)
	{
		if (this.mLoadingGames[url])
		{
			if(this.mLoadingGames[url].dlman)
			{
				this.mLoadingGames[url].dlman.resume();
				this.mLoadingGames[url].userPause = false;
			}
		}
	},

	_resumeUpdateRecv: function(cmd)
	{
		var o = {};
		this._resumeUpdateRecvGen(cmd, o);
		this.resumeUpdate(o.url);
	},

	cancelUpdate: function(url)
	{
		if (this.mLoadingGames[url])
		{
			if (this.mLoadingGames[url].dlman) {
                this.mLoadingGames[url].dlman.abort();
            }
			delete this.mLoadingGames[url];

			//Cancel the keep alive request as well
			var LifecycleEmitter = require('../Device/LifecycleEmitter').LifecycleEmitter;

			LifecycleEmitter.cancelEngineKeepAlive(_LocalGameList.classname);
		}
	},

	_cancelUpdateRecv: function(cmd)
	{
		var o = {};
		this._cancelUpdateRecvGen(cmd, o);
		this.cancelUpdate(o.url);
	},

	_setProgress: function (progress) {
		if(progress > 1) progress = 1;
		// Indeterminate
		if(progress < 0) progress = -1;
		this._progress = progress;
		if (progress >= 0 && this._allowDeterminateProgress) {
			this._setUpdateProgressSendGen( this._progressMin + progress * this._progressRange );
		} else {
			this._setUpdateProgressSendGen(-1);
		}
	},
	
	_setAllowDeterminateProgress: function (allow) {
		this._allowDeterminateProgress = allow;
		this._setProgress(this._progress);
	},

	listenToProgress: function (listener)
	{
		this._privListener = listener;
	},

	_updateProgress: function(url, prog, total, err)
	{
		//console.log("Updating progress for: %s, %d, %d " + err, url, prog, total);
		if (this._privListener)
			this._privListener(url, prog, total, err);

		if (this.mLoadingGames[url] && this.mLoadingGames[url].id >=0)
			this._updateProgressSendGen(url,prog,total,err);
	},

	// doneCB = function(totalBytes, error)
	_callDownloadManifest: function (config, gameOrigin, name, failEarly, failAllowed, doneCB)
	{
		var contentUrl = config.contentUrl;
		var reportTotalBytes = 0;
		var self = this;
		var Downloader = require('../Network/DownloadManifest').DownloadManifest;
		
		var manifestName = require('./_int_LGL')._int_LGL.getManifestName(config);

		// Do download
		(function doDownload()
		{
			var dler = new Downloader();
			dler.mLocalGameList = self;
			var firstProgress = true;
			var LifecycleEmitter = require('../Device/LifecycleEmitter').LifecycleEmitter;
			LifecycleEmitter.requestEngineKeepAlive(_LocalGameList.classname);

			// Only allow this on iOS
			config.omitJsUpdate = config.omitJsUpdate && (Capabilities.getPlatformOS() == "iPhone OS");
			dler._setConfig(config);
			dler.start(contentUrl, name, {'webgame.ngmanifest':manifestName}, function(bytesDownloaded, bytesTotal)
			{
				if(firstProgress)
				{
					// First progress callback is made when manifest is downloaded.
					firstProgress = false;
					self._setStage(bytesDownloaded < bytesTotal ? self.ProgressStage.DownloadFiles : self.ProgressStage.Launching);
					reportTotalBytes = bytesTotal;
				}
				else
				{
					self._setProgress( bytesDownloaded / bytesTotal );
				}

				// update LGL
				self._updateProgress(gameOrigin, bytesDownloaded, bytesTotal);
			}, function(error, manifest, wasCached)
			{
				LifecycleEmitter.cancelEngineKeepAlive(_LocalGameList.classname);

				if (failAllowed)
				{
					if (doneCB)
					{
						doneCB(reportTotalBytes, error);
					}
				}
				else if(error)
				{
					NgLogE("Error: " + error);
					// update LGL
					self._updateProgress(gameOrigin, 0, 0, error);
					doneCB(0, error);
				}
				else
				{
					if (doneCB)
					{
						doneCB(reportTotalBytes);
					}
				}
			}, false, failEarly);
			self.mLoadingGames[gameOrigin].dlman = dler;
		})();
	},

	freeSpace: function(space, cb)
	{
		this.mRequiredAvailableSpace = space;
		this.mSpaceFreeCallbacks.push(
			(function()
			{
				if (this.mRequiredAvailableSpace > this.mSpaceAvailable)
				{
					if (this._privListener)
					{
						this._privListener("", 0, 0, "SD card is full");
					}
					else
					{
						console.log("Warning!! Mobage is not handling SD card full error!");
						// This is Preservation of ancient code which has and will likely never execute
						var checkAgain = function()
						{
							if (this.mRequiredAvailableSpace > this.mSpaceAvailable)
							{
								this.pruneGames(1);
								this.mSpaceFreeCallbacks.push(checkAgain);
							}
							else
							{
								cb();
							}
						};
						// Is a redundant check on space, but looks better/is simpler/won't ever be used anyhow
						checkAgain();
					}
				}
				else
				{
					cb();
				}
			}).bind(this)
		);

		this._getRepoSpaceSendGen();
	},

	pruneGames: function(number)
	{
		var self = this;

		// Function to put oldest games on top of the stack
		var sort = function (l, r)
		{
			return r.lastRun - l.lastRun;
		};

		this.mGameStore.getItem(this.mActiveGameKey, {},
			function(error, value)
			{
				var list = JSON.parse(value);
				list.sort(sort);
				while (number-- && (list.length - 1))
				{
					var game = list.pop();

					// Do not delete the currently loading game
					if (!(game.name in self.mLoadingGames))
					{
						// delete game
						self.deleteGameFiles(game.name);
					}
					else
					{
						list.push(game);
					}
				}

				// Save the data
				self.mGameStore.setItem(self.mActiveGameKey, JSON.stringify(list), {});
			}, true
		);
	},

	deleteGame: function (url, callBack)
	{
		var Util = require('../Network/Util').Util;
		var norm = Util.NormalizeUrl(url);
		var mdFive = toMD5(norm);

		this.deleteGameFiles(mdFive);
		this._deleteGameFromStorage(mdFive, callBack);
	},

	// Delete the KeyValueCache.local of the given game
	deleteGameKeyValue: function(mdFive)
	{
		var kvm = require('../Storage').KeyValueCache;
		kvm.global(mdFive).clear({});
	},

	deleteGameFiles: function(game)
	{
		var self = this;
		self.mFile.deleteFile( game, {},
			function(err)
				{
					if(err === "" )
						NgLogI('Deleted');
					else
						NgLogD("Could not delete game");

					self._getRepoSpaceSendGen();
				});
	},

	getGameList: function()
	{
		return this.mGameList;
	},

	clearWatch: function()
	{
		var fs = require('../Storage/FileSystem').FileSystem;
		fs.deleteFile(".watch", {});
	},

	/**
	 * @private
	 */
	_reloadGameList: function(newItem, cb)
	{
		this.mGameStore.getItem(this.mActiveGameKey, {},
			(function(error, value)
			{
				var list;
				if (value)
					list = JSON.parse(value);
				else
					list = [];

				if (newItem)
				{
					var bNew = true;
					for (var i in list)
					{
						if (list[i].name == newItem.name)
						{
							bNew = false;
							newItem.lastRun = list[i].lastRun;
							list[i] = newItem;
							break;
						}
					}

					if (bNew)
					{
						list.push(newItem);
					}
					this.mGameStore.setItem(this.mActiveGameKey, JSON.stringify(list), {});
				}

				this.mGameList = list;

				if (typeof cb == 'function')
					cb();
			}).bind(this),
			true
		);
	},

	_getRunningGame: function(callBack)
	{
		// Function to put oldest games on top of the stack
		var sort = function (l, r)
		{
			return r.lastRun - l.lastRun;
		};

		this._reloadGameList(false, (function(cb)
		{
			var list = this.mGameList;
			list.sort(sort);
			var current = null;
			var len = list.length;
			for (var i = 0; i < len; ++i)
			{
				if (list[i].lastRun)
				{
					current = list[i];
					break;
				}
			}
			if (current && current.url)
				cb(current.url);
		}).bind(this, callBack));
	},

	/** @private */
	_pausingGame: function()
	{
		// true to resume download when pausing a game
		this._pauseOrResumeAll(true);
	},

	/** @private */
	_resumingGame: function()
	{
		// Check if the current game allows downloading
		this._getRunningGame((function(game)
		{
			this.getGameConfig(game, (function(config)
			{
				if (config.noBackgroundUpdates)
				{
					// false to pause download when resuming a game
					this._pauseOrResumeAll(false);
				}
			}).bind(this));
		}).bind(this));
	},

	setSplashVisible: function( visible )
	{
		this._setSplashVisibleSendGen(visible);
	},

	setProgressText: function( text )
	{
		this._progressText = text;
		this._setProgressTextSendGen(text);
	},

	updateAvailable: function(game, doneCB, errorCB)
	{
		var _int_LGL = require('./_int_LGL')._int_LGL;
		_int_LGL.updateAvailable(game, doneCB, errorCB);
	},

	/*
	 * Set the exception handler. Default is undefined.
	 * @param {Function} the function that handles the exception occurred in the Game proc. signature: function(exceptionString)
	 */
	setExceptionHandler: function(func)
	{
		this._exceptionHandler = func;
	},

	_exceptionForwardedRecv: function( cmd )
	{
		var obj = {};
	        var exception = {};
		this._exceptionForwardedRecvGen(cmd, obj);
		try {
			exception = JSON.parse(obj.exceptionString);
		} catch (e) {
			console.log("ERROR: Unparseable exception: " + obj.exceptionString);
		}
		if (this._exceptionHandler) this._exceptionHandler(exception);
	},
	
	_setHasCustomProgressBarRecv: function( cmd ) {
		var obj = {};
		this._setHasCustomProgressBarRecvGen(cmd, obj);
		this._hasProgressBar = obj.hasProgressBar;
	},

	registerUnbundleListener: function(cb)
	{
		if (this.unbundled)
		{
			cb();
		}
		else
		{
			this.unbundleListener = cb;
		}
	},
	$_gameUnbundledRecv: function( cmd )
	{
		this.unbundled = true;
		if (this.unbundleListener)
		{
			this.unbundleListener();
		}
	}
});
