////////////////////////////////////////////////////////////////////////////////
// Class _int_LGL
//
// Copyright (C) 2010 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////


var Class = require('./Class').Class;
var Proc = require('./Proc').Proc;
var Base64 = require('./Base64').Base64;

////////////////////////////////////////////////////////////////////////////////
function getCorrectedPlatformOS() {
	var os = Capabilities.getPlatformOS();
	switch (os) {
		case 'Android': return 'android';
		case 'iPhone OS': return 'ios';
	}
	return os;
}

function expandTexName(name)
{
	var list =
	{
		"pvr": "GL_IMG_texture_compression_pvrtc",
		"atc": "GL_AMD_compressed_ATC_texture",
		"etc1": "GL_OES_compressed_ETC1_RGB8_texture",
		"3dc": "GL_AMD_compressed_3DC_texture"
	};

	return list[name] || name;
}

var overridePropertyEvaluators = {
	isMatch: function(condition, value) {
		// Return true if the condition holds for the provided value
		// condition may be prefixed with an operator, so we extract it.
		var symbol;
		switch (condition.charAt(0)) {
		case '>':
			symbol = (condition.charAt(1) == '=') ? '>=' : '>';
			break;
		case '<':
			symbol = (condition.charAt(1) == '=') ? '<=' : '<';
			break;
		}
		// Consume any characters we detected, then set the default operation (equals)
		if (symbol) {
			condition = condition.slice(symbol.length);
		} else symbol = '=';

		if (condition == value) {
			return (symbol == '=' || symbol == '<=' || symbol == '>=');
		} else if (condition < value) {
			return (symbol == '<' || symbol == '<=');
		} else {
			return (symbol == '>' || symbol == '>=');
		}
	},

	isVersionMatch: function(condition, value) {
		// Return true if the condition holds for the provided value
		// condition may be prefixed with an operator, so we extract it.
		var symbol;
		if (condition.length > 0) switch (condition.charAt(0)) {
		case '>':
			symbol = (condition.charAt(1) == '=') ? '>=' : '>';
			break;
		case '<':
			symbol = (condition.charAt(1) == '=') ? '<=' : '<';
			break;
		case '=':
			symbol = (condition.charAt(1) == '=') ? '==' : '=';
			break;
		}
		// Consume any characters we detected, or set the default operation (equals)
		if (symbol) {
			condition = condition.slice(symbol.length);
		} else symbol = '=';

		var con = condition.split('.');
		var val = value.split('.');

		var l = Math.max(con.length, val.length);

		for (var i = 0; i < l; i++) {
			var ci = '0.' + (con[i] || 0);
			var vi = '0.' + (val[i] || 0);
			if (ci == vi) continue;
			if (ci < vi) {
				return (symbol == '<' || symbol == '<=');
			} else {
				return (symbol == '>' || symbol == '>=');
			}
		}
		return true;
	},

	'sdkVersion': function(v) {
		return this.isVersionMatch('' + v, Capabilities.getSDKVersion());
	},

	'binaryVersion': function(v) {
		return this.isVersionMatch('' + v, Capabilities.getBinaryVersion());
	},

	'platformOS': function(v) {
		return v == getCorrectedPlatformOS();
	},

	'platformOSVersion': function(v) {
		return this.isVersionMatch('' + v, Capabilities.getPlatformOSVersion());
	},

	'platformHW': function(v) {
		return v == Capabilities.getPlatformHW();
	},

	'physicalMem': function(v) {
		return this.isMatch(v, Capabilities.getPhysicalMem());
	},

	'physicalCpus': function(v) {
		return this.isMatch(v, Capabilities.getPhysicalCpus());
	},

	'activeCpus': function(v) {
		return this.isMatch(v, Capabilities.getActiveCpus());
	},

	'language': function(v) {
		return v == Capabilities.getLanguage();
	},

	'textureMatch': "none",
	'textureCompression': function(v) {
		var matched = Capabilities.getOglExtensions().indexOf(expandTexName(v)) > -1;
		if (matched) this.textureMatch = v;
		return matched;
	},

	'screenWidth': function(v) {
		return this.isMatch(v, Capabilities.getScreenWidth());
	},

	'screenHeight': function(v) {
		return this.isMatch(v, Capabilities.getScreenHeight());
	},

	'screenResolution': function(v) {
		return v == (Capabilities.getScreenWidth() + 'x' + Capabilities.getScreenHeight());
	},

	'screenUnits': function(v) {
		return this.isMatch(v, Capabilities.getScreenUnits());
	},

	'screenPixelUnits': function(v) {
		return this.isMatch(v, Capabilities.getScreenPixelUnits());
	},

	'maxTextureSize': function(v) {
		return this.isMatch(v, Capabilities.getMaxTextureSize());
	},
	
	'reset': function(v) {
		this.textureMatch = "none";
	}
};

var _int_LGL = Class.singleton(
/** @lends Core._int_LGL.prototype */
{
	classname: '_int_LGL',

	initialize: function()
	{
		this._loadCallbacks = {};
	},

	launch: function(url, proc)
	{
		var Util = require('../Network/Util').Util;
		// Default to game proc. Games should actually not be aware of the third option,
		//	as they cannot use it anyway.
		if (!proc)
			proc = _int_LGL.ProcID.Game;

		url = Util.NormalizeUrl(url);

		var run = (function()
		{
			gNgShutdownPending = true;
			this._launchSendGen(url,proc);
		}).bind(this);

		if (proc == _int_LGL.ProcID.Game)
		{
			this.updateGameUse(url, run);
		}
		else
		{
			run();
		}
	},

	loadGame: function(url, callback)
	{
		var Util = require('../Network/Util').Util;

		url = Util.NormalizeUrl(url);

		this._loadCallbacks[url] = callback;
		this._loadGameSendGen(url);
	},

	_gameLoadedRecv: function( cmd ) {
		var msg = {};
		this._gameLoadedRecvGen(cmd, msg);

		var url = msg.url;

		if(this._loadCallbacks[url])
		{
			var cb = this._loadCallbacks[url];
			delete this._loadCallbacks[url];
			cb();
		}
	},

	launchLoadedGame: function()
	{
		this._launchLoadedGameSendGen();
	},
	
	updateAvailable: function(game, doneCB, errorCB)
	{
		// Normalize URL
		var url = game;
		if (! url.match(/^\//) && !url.match(/https?:\/\//))
			url = '/' + url;

		var caps = require("./Capabilities").Capabilities;

		// If we are testing ourselves, we don't to md5 our url
		var name = "";
		if (caps.getUrl() != game)
		{
			var Util = require('../Network/Util').Util;
			url = Util.NormalizeUrl(url);
			name = Util.GetMD5HashDirectoryFromUrl(url);
		}

		// Get device-specific manifest directory
		var buildPath = {"Android" : "android", "iPhone OS" : "ios", "flash" : ""};
		// Get Device capabilities platformOs
		var build = "/" + buildPath[caps.getPlatformOS()];

		var DownloadManifest = require('../Network/DownloadManifest').DownloadManifest;
		var dm = new DownloadManifest();

		dm.isUpdated(url + build, name, false, doneCB, errorCB);
	},

// Utility (non-generated) functionality
	updateGameUse: function(game, doneCB)
	{
		var Util = require('../Network/Util').Util;
		var url = Util.NormalizeUrl(game);
		var name = Util.GetMD5HashDirectoryFromUrl(url);
		var self = this;
		var KeyValueCache = require('../Storage/KeyValue').KeyValueCache;
		this.mGameStore = KeyValueCache.global("Core.GameList");
		this.mActiveGameKey = "activeGames";

		// Get our list of games
		this.mGameStore.getItem(this.mActiveGameKey, {},
			function(error, value)
			{
				var list;
				if (value)
					list = JSON.parse(value);
				else
					list = [];

				var item;
				for (var i in list)
				{
					if (list[i].name == name)
					{
						item = list[i];
						break;
					}
				}

				if (!item)
				{
					item = {"name": name};
					list.push(item);
				}

				item.lastRun = (new Date()).getTime();
				item.url = game;

				self.mGameStore.setItem(self.mActiveGameKey, JSON.stringify(list), {});

                LocalGameList.updateGameList(list);
 				doneCB();
			}, true
		);
	},
	
	getManifestName: function(config) {
		var manifestName = 'webgame.ngmanifest';

		if (config && config.manifestOverrides) {
			try {
				var overrides = config.manifestOverrides;

				for (var i = 0; i < overrides.length; i++) {
					var override = overrides[i];
					if (override && override.criteria) {
						// Clear any matched values...
						overridePropertyEvaluators.reset();

						var criteria = override.criteria;
						var key, overrideMatched = true;
						for (key in criteria) {
							if (!criteria.hasOwnProperty(key)) continue;
							var value = criteria[key];

							var evaluator = overridePropertyEvaluators[key];
							if (typeof evaluator != 'function') {
								console.log("ERROR! Undefined criterion " + key + " in configuration.json");
								overrideMatched = false;
								break;
							}

							var criterionMatched = false;
							if (value instanceof Array) {
								for (var vi = 0; vi < value.length; vi++) {
									criterionMatched |= evaluator.call(overridePropertyEvaluators, value[vi]);
									if (criterionMatched) break;
								}
							} else {
								criterionMatched = evaluator(value);
							}

							if (!criterionMatched) {
								overrideMatched = false;
								break;
							}
						}

						// At this point, the override has matched. Figure out its name and return the value.
						if (overrideMatched) {
							console.log("MATCHED Override: " + JSON.stringify(override));

							// Format the override manifest name:
							var format = override.manifest.slice(0);
							for (var fi = 1; fi < format.length; fi++) {
								key = format[fi];
								switch (key) {
								case 'textureCompression':
									format[fi] = overridePropertyEvaluators.textureMatch;
									break;
								case 'platformOS':
									format[fi] = getCorrectedPlatformOS();
									break;
								default:
									// Look up the named property on Capabilities.
									var cap = Capabilities['get' + key.charAt(0).toUpperCase() + key.slice(1)]();
									format[fi] = cap.replace(' ', '_');
								}
							}

							return require('../../Shared/Lib/sprintf').sprintf(format);
						} else {
							console.log("DID NOT MATCH Override: " + JSON.stringify(override));
						}
					}
				}
			} catch (e) {
				console.log("ERROR! Exception occurred in manifest overrides: " + e);
			}
		}

		return manifestName;
	},

// {{?Wg Generated Code}}
	
	// Enums.
	ProcID:
	{ 
		Persist: -1,
		Game: -2
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 342,
	// Method launch = -1
	// Method loadGame = -2
	// Method gameLoaded = -3
	// Method launchLoadedGame = -4
	
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
				
				default:
					NgLogE("Unknown instance method id " + cmdId + " in _int_LGL._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				case -3:
					_int_LGL._gameLoadedRecv( cmd );
					break;
				default:
					NgLogE("Unknown static method id " + cmdId + " in _int_LGL._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[342] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	$_gameLoadedRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in _int_LGL.gameLoaded from command: " + cmd );
			return false;
		}
		
		obj[ "url" ] = Proc.parseString( cmd[ 0 ] );
		if( obj[ "url" ] === undefined )
		{
			NgLogE("Could not parse url in _int_LGL.gameLoaded from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_launchSendGen: function( url, proc )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x156ffff, [ Proc.encodeString( url ), +proc ] );
	},
	
	/** @private */
	$_loadGameSendGen: function( url )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Proc.appendToCommandString( 0x156fffe, [ Proc.encodeString( url ) ] );
	},
	
	/** @private */
	$_launchLoadedGameSendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Proc.appendToCommandString( 0x156fffc );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $launch: function( url, proc ) {}
	
	// $loadGame: function( url ) {}
	
	// $_gameLoadedRecv: function( cmd ) {}
	// $launchLoadedGame: function(  ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});

exports._int_LGL = _int_LGL;
