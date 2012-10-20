////////////////////////////////////////////////////////////////////////////////
// Class IPCEmitter
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Core = require('../Core').Core;
var Class          = require('../Core/Class').Class;
var Proc           = require('../Core/Proc').Proc;
var ObjectRegistry = require('../Core/ObjectRegistry').ObjectRegistry;
var Base64         = require('../Core/Base64').Base64;
var MessageEmitter = require('../Core/MessageEmitter').MessageEmitter;
var DownloadFile   = require('../Network/DownloadFile').DownloadFile;
var Util           = require('../Network/Util').Util;
var FileSystem     = require('../Storage/FileSystem').FileSystem;

////////////////////////////////////////////////////////////////////////////////

exports.IPCEmitter = MessageEmitter.singleton(
/** @lends Device.IPCEmitter.prototype */
{

	classname: 'IPCEmitter',

	/**
	 * @class The IPCEmitter class is a singleton that enables an ngCore app to launch another
	 * app on the device, or to switch to that app if it is already running. For example, you can
	 * use this class to launch Google Play (on Android devices) or the App Store (on iOS devices).
	 * <br /><br />
	 * To launch another app, you pass a URL to <code>{@link Device.IPCEmitter#launch}</code>. The
	 * device examines the first part of the URL, then determines whether the device has an app that
	 * can handle the request. For example, on Android devices, a URL that begins with
	 * <code>market://</code> will be handled by the Google Play app. The remainder of the URL will
	 * be passed to the app that is being launched.
	 * <br /><br />
	 * In addition, you can use the method <code>{@link Device.IPCEmitter#canLaunch}</code> to check
	 * whether the device has an app that can handle a URL.
	 * @example
	 * // Require the user to download an updated copy of the app from Google Play.
	 * // NOTE: This example works only on Android. In addition, this example will
	 * // not work correctly in the sandbox environment, because ngCore apps have
	 * // different bundle IDs in the sandbox and production environments.
	 * 
	 * var bundleId = Core.Capabilities.getBundleIdentifier();
	 * var url = "market://details?id=" + bundleId;
	 *
	 * var Updater = Core.Class.singleton({
	 *     classname: "Updater",
	 *
	 *     showToast: function(message) {
	 *         var toast = new UI.Toast({
	 *             text: message
	 *         });
	 *         toast.setOnDisappear(function() {
	 *             toast.destroy();
	 *         });
	 *         toast.show();
	 *     },
	 *
	 *     launch: function() {
	 *         showToast("Update required. Opening Google Play...");
	 *
	 *         // Wait 3 seconds, then launch Google Play.
	 *         setTimeout(function() {
	 *             Device.IPCEmitter.launch(uri, function(error) {
	 *                 if (error) {
	 *                     showToast("Please open Google Play to download the update.");
	 *                 }
	 *             });
	 *         }, 3000);
	 *     }
	 * });
	 *
	 * Updater.update();
	 * @constructs
	 * @augments Core.MessageEmitter
	 * @singleton
	 */
	initialize: function()
	{
		console.log('IPCEmitter.initialize');
		this._callbackID = 0;
		this._callbacks = [];
		
		this._shouldEmitIntents = false;

		ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
	},

	/**
	 * Check whether the device has an app that can handle a URL.
	 * @example
	 * var urlToLaunch = "mobagesample://example?test=test";
	 * Device.IPCEmitter.canLaunch(urlToLaunch, function(canLaunch) {
	 *     if (canLaunch) {
	 *         console.log("Launching URL: " + canLaunch);
	 *         Device.IPCEmitter.launch(urlToLaunch, function(error) {
	 *             console.log("An error occurred while launching " + urlToLaunch +
	 *               ": " + error);
	 *         });
	 *     } else {
	 *         console.log("Cannot launch the URL: " + urlToLaunch);
	 *     }
	 * });
	 * @param {String} url A URL to test.
	 * @cb {Function} callback The function to call after checking whether the URL can be launched.
	 * @cb-param {Boolean} canLaunch Set to <code>true</code> if the URL can be launched.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status
	 * @since 1.0
	 */
	canLaunch: function(url, callback)
	{
		this._callbacks[this._callbackID] = callback;
		this._canLaunchSendGen(url,this._callbackID);
		this._callbackID++;
	},

	/**
	 * Launch an app that can handle the specified URL, or switch to the app if it is already
	 * running.
	 * @example
	 * var urlToLaunch = "mobagesample://example?test=test";
	 * Device.IPCEmitter.launch(urlToLaunch, function(error) {
	 *     console.log("An error occurred while launching " + urlToLaunch +
	 *       ": " + error);
	 * });
	 * @param {String} url A URL to launch.
	 * @cb {Function} callback The function to call after attempting to launch the URL.
	 * @cb-param {String} error Information about the error, if any.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.0
	 */
	launch: function(url, callback)
	{
		 this._callbacks[this._callbackID] = callback;
		 this._launchSendGen(url,this._callbackID);
		 this._callbackID++;
	},

	launchIntent: function( intent, extras, packageName )
	{
		// Similar to launchService, stash the packageName in extras.
		if (typeof(packageName) == "string")
		{
			if (typeof(extras) == "string")
			{
				extras = JSON.parse(extras);
			}
			extras["packageName"] = packageName;
		}
		if (typeof extras == 'object') {
			extras = JSON.stringify(extras);
		}
		this._launchIntentSendGen(intent, extras);
	},
	
	launchService: function( intent, extras, packageName )
	{
		//This function originally did not take a "packageName" parameter, it was part of the extrasObj.
		//The separate parameter is added to make it a bit more clear that it is necessary to pass in a packageName.
		//Not sure it's going to help though, because we're trying to preserve backwards compatibility here.
		if (typeof(packageName) == "string")
		{
			var extrasObj;
			if (typeof(extras) == "string")
			{
				extrasObj = JSON.parse(extras);
			}
			else
			{
				extrasObj = {};
			}
			extrasObj["packageName"] = packageName;
			extras = JSON.stringify(extrasObj);
		}
		this._launchServiceSendGen(intent,extras);
	},

	/**
	 * Launch a Single Sign-on URL.
	 * @private
	 * @example var appToLaunch = 'mobage//auth?packageName=xxx.xxx&amp;className=xxx.xxx';
	 * Device.IPCEmitter.launchForSSO(appToLaunch, function(error) {
	 *     label.setText('failed in  launching the URL:' + appToLaunch);
	 * });
	 * @param {String} url The URL to launch. The URL must include the following as part of the query string: packageName=xxxx&amp;className=yyyy.
	 * @cb {Function} callback The function to call after launching the URL.
	 * @cb-param {String} error The error message, if any.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status
	 * @since 1.0
	 */
	launchForSSO: function(url, callback)
	{
		url += '&sso_auth';
		this.launch(url, callback);
	},

	/**
	 * Retrieve an array of signatures for the packageName.
	 * @private
	 * @param {String} packageName packageName is like "com.ngmoco.gamejs"
	 * @cb {Function} callback The function to call after retrieving the signatures.
	 * @cb-param {String[]} signatures An array of signatures.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status Android
	 * @since 1.0
	 */
	getAppSignatures: function(packageName, callback)
	{
		this._callbacks[this._callbackID] = callback;
		this._getAppSignaturesSendGen(packageName,this._callbackID);
		this._callbackID++;
	},

	/**
	 * Retrieve the package name that invokes this ngCore app.
	 * @private
	 * @cb {Function} callback The function to call after retrieving the package name.
	 * @cb-param {String} packageName The package name.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status Android
	 * @since 1.1.5
	 */
	getCallingPackage: function(callback)
	{
		this._callbacks[this._callbackID] = callback;
		this._getCallingPackageSendGen(this._callbackID);
		this._callbackID++;
	},
	
	/**
	 * Determine whether a service is running.
	 * @private
	 * @param {Device.IPCEmitter.Service} serviceEnum The service to query.
	 * @cb {Function} callback The function to call after determining whether the service is
	 *		running.
	 * @cb-param {Boolean} isServiceRunning Set to <code>true</code> if the service is running.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status Android
	 * @since 1.3.1b
	 */
	getIsServiceRunning: function(serviceEnum, callback)
	{
		this._callbacks[this._callbackID] = callback;
		this._getIsServiceRunningSendGen(serviceEnum, this._callbackID);
		this._callbackID++;
	},


	app: function()
	{
		return this._app;
	},

	App: Class.subclass(
	/** @lends Device.IPCEmitter.App.prototype */
	{
		classname: 'App',

		/**
		 * @class Information about the app.
		 * @ignore
		 */
		initialize: function(sourceAppID, intentURL)
		{
			this._sourceAppID   = sourceAppID;
			this._intentURL     = intentURL;
		},

		/**
		 * information for checking if application has launched or resumed with custom URL scheme.
		 * @type String
		 * @ignore
		 */
		getID: function()
		{
			return this._sourceAppID;
		},

		/**
		 * Returns the URL used to launch this app, or an empty string if not launched via URL
		 * @type String
		 * @ignore
		 */
		getURL: function()
		{
			return this._intentURL;
		}
	}),

	Intent: Class.subclass(
	/** @lends Device.IPCEmitter.App.prototype */
	{
		classname: 'Intent',

		/**
		 * @class Information about the app.
		 * @ignore
		 */
		initialize: function(action, extras)
		{
			this._action   = action;
			this._extras   = extras;
		},

		/**
		 * information for checking if application has launched or resumed with custom URL scheme.
		 * @type String
		 * @ignore
		 */
		getAction: function()
		{
			return this._action;
		},

		/**
		 * Returns the URL used to launch this app, or an empty string if not launched via URL
		 * @type String
		 * @ignore
		 */
		getExtras: function()
		{
			return this._extras;
		}
	}),

	/**
	 * Create home screen shortcut icon.
	 * @private
	 * @param {String} name Displayed shortcut name
	 * @param {String} url Invoked url when icon clicked.
	 * @param {String} icon_path Local file path that stores icon file.
	 * @returns {void}
	 * @status Android
	 * @since 1.3.1b
	 */
	createShortcut: function( name, url, icon_path )
	{
		this._createShortcutSendGen(name, url, icon_path);
	},

	/**
	 * Create home screen shortcut icon with downloading its image.
	 * @private
	 * @param {String} name Displayed shortcut name.
	 * @param {String} url Invoked url when icon clicked.
	 * @param {String} icon_url Icon image url.
	 * @cb {Function} [callback] The function to call after creating the shortcut icon.
	 * @cb-param {Boolean} hasDownloadError Returns <code>true</code> if there was an error
	 *		downloading the icon.
	 * @cb-returns {void}
	 * @returns {void}
	 * @status Android
	 * @since 1.3.1b
	 */
	createShortcutByIconUrl: function( name, url, icon_url, callback )
	{
                NgLogD("createShortcutByIconUrl called", name, url, icon_url);

                var df = new DownloadFile();
                var filename = 'shortcut_icon_image'+(new Date().getTime());
                var self = this;
                NgLogD("Icon download begin");
		Util.OperationWithRetries(function(failCb, abortCb) {
			df.start(filename, 'GET', icon_url, [], function( statusCode, fileSignature ) {
				NgLogD("Icon download finished status="+statusCode);
				if(statusCode == 200) {
					self.createShortcut( name, url, filename );
					FileSystem.deleteFile( filename, {}, function() {
						if(callback)
							callback(false);
					});
				}
				else if(statusCode == 404)
				{
					NgLogE("Unable download icon file: icon_url="+icon_url+", status="+statusCode);
					abortCb();
				}
				else
				{
					NgLogE("Unable download icon file: icon_url="+icon_url+", status="+statusCode);
					failCb();
				}
			});
		},
		function() {
			NgLogE("Unable download icon file");
			if(callback)
				callback(true);
		}, 
		true);
	},

	// ------------------------------------------------------------------
	// private
	//

	/**
	 * invoked from native when the app is resumed back from other app.
	 * @private
	 * @since 1.0
	 */
	_onResumedFromOthers: function (url, sourceAppID)
	{
		this._app = new Device.IPCEmitter.App(sourceAppID, url);
		this.emit(this._app);

		//Cascade the original message back out to native for forwarding
		this._onResumeFromOthersSendGen(url, sourceAppID);
	},
	
	// The game should not call this
	_setEmitIntents: function ( emit ) {
		this._shouldEmitIntents = Boolean(emit);
	},

	_onIntentReceived: function (action, extras)
	{
		console.log("On IntentReceived: " + action + " / " + JSON.stringify(extras));
		if (this._shouldEmitIntents) {
			this.emit( new exports.IPCEmitter.Intent(action, extras) );
		}
	},

	// private
	_canLaunchCallbackRecv: function( cmd )
	{
		var msg = {};
		if (! this._canLaunchCallbackRecvGen(cmd, msg))
			return;

		var func = this._callbacks[parseInt(msg.callbackID, 10)];
		if (func) {
			func(msg.canLaunch);
		}
	},

	_onResumeFromOthersRecv: function(cmd)
	{
		var msg = {};
		if (! this._onResumeFromOthersRecvGen(cmd, msg))
			return;

		this._onResumedFromOthers(msg.url, msg.sourceAppID);
	},

	_launchFailedRecv: function( cmd )
	{
		var msg = {};
		if (! this._launchFailedRecvGen(cmd, msg))
			return;

		var func = this._callbacks[parseInt(msg.callbackID, 10)];
		if (func) {
			func(msg.canLaunch);
		}
	},

	_getAppSignaturesCallbackRecv: function( cmd )
	{
		var msg = {};
		if (! this._getAppSignaturesCallbackRecvGen(cmd, msg))
			return;

		var func = this._callbacks[parseInt(msg.callbackID, 10)];
		if (func) {
			func(msg.signatures.split(','));
		}
	},

	_getCallingPackageCallbackRecv: function( cmd )
	{
		var msg = {};
		if (! this._getCallingPackageCallbackRecvGen(cmd, msg))
			return;

		var func = this._callbacks[parseInt(msg.callbackID, 10)];
		if (func) {
			func(msg.packageName);
		}
	},
	
	
	_getIsServiceRunningCallbackRecv: function( cmd )
	{
		var msg = {};
		if (! this._getIsServiceRunningCallbackRecvGen(cmd, msg))
			return;

		var func = this._callbacks[parseInt(msg.callbackID, 10)];
		if (func) {
			func(msg.running);
		}
	},
	
	_onIntentReceivedRecv: function( cmd )
	{
		var msg = {};
		if (! this._onIntentReceivedRecvGen(cmd, msg))
			return;
		
		this._onIntentReceived( msg.action, JSON.parse(msg.extras, 10) );
	},
	
	/**
	 * Enumeration for services whose status can be queried.
	 * @private
	 * @name Service
	 * @fieldOf Device.IPCEmitter#
	 */
	
	/**
	 * The download provider for the system.
	 * @private
	 * @name Service.SystemDownloadProvider
	 * @fieldOf Device.IPCEmitter#
	 * @constant
	 */

// {{?Wg Generated Code}}
	
	// Enums.
	Service:
	{ 
		SystemDownloadProvider: 1
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 349,
	// Method create = -1
	// Method canLaunch = 2
	// Method launch = 3
	// Method onResumeFromOthers = 4
	// Method launchFailed = 5
	// Method canLaunchCallback = 6
	// Method getAppSignatures = 7
	// Method getAppSignaturesCallback = 8
	// Method getCallingPackage = 9
	// Method getCallingPackageCallback = 10
	// Method launchIntent = 11
	// Method launchService = 12
	// Method onIntentReceived = 13
	// Method getIsServiceRunning = 14
	// Method getIsServiceRunningCallback = 15
	// Method createShortcut = 16
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Core.Proc.parseInt( cmd.shift(), 10 );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Core.Proc.parseInt( cmd.shift(), 10 );
			var instance = Core.ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				case 4:
					instance._onResumeFromOthersRecv( cmd );
					break;
				case 5:
					instance._launchFailedRecv( cmd );
					break;
				case 6:
					instance._canLaunchCallbackRecv( cmd );
					break;
				case 8:
					instance._getAppSignaturesCallbackRecv( cmd );
					break;
				case 10:
					instance._getCallingPackageCallbackRecv( cmd );
					break;
				case 13:
					instance._onIntentReceivedRecv( cmd );
					break;
				case 15:
					instance._getIsServiceRunningCallbackRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in IPCEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in IPCEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[349] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_onResumeFromOthersRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in IPCEmitter.onResumeFromOthers from command: " + cmd );
			return false;
		}
		
		obj[ "url" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "url" ] === undefined )
		{
			NgLogE("Could not parse url in IPCEmitter.onResumeFromOthers from command: " + cmd );
			return false;
		}
		
		obj[ "sourceAppID" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "sourceAppID" ] === undefined )
		{
			NgLogE("Could not parse sourceAppID in IPCEmitter.onResumeFromOthers from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_launchFailedRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in IPCEmitter.launchFailed from command: " + cmd );
			return false;
		}
		
		obj[ "error" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "error" ] === undefined )
		{
			NgLogE("Could not parse error in IPCEmitter.launchFailed from command: " + cmd );
			return false;
		}
		
		obj[ "callbackID" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "callbackID" ] === undefined )
		{
			NgLogE("Could not parse callbackID in IPCEmitter.launchFailed from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_canLaunchCallbackRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in IPCEmitter.canLaunchCallback from command: " + cmd );
			return false;
		}
		
		obj[ "canLaunch" ] = Core.Proc.parseBool( cmd[ 0 ] );
		if( obj[ "canLaunch" ] === undefined )
		{
			NgLogE("Could not parse canLaunch in IPCEmitter.canLaunchCallback from command: " + cmd );
			return false;
		}
		
		obj[ "callbackID" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "callbackID" ] === undefined )
		{
			NgLogE("Could not parse callbackID in IPCEmitter.canLaunchCallback from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_getAppSignaturesCallbackRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in IPCEmitter.getAppSignaturesCallback from command: " + cmd );
			return false;
		}
		
		obj[ "signatures" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "signatures" ] === undefined )
		{
			NgLogE("Could not parse signatures in IPCEmitter.getAppSignaturesCallback from command: " + cmd );
			return false;
		}
		
		obj[ "callbackID" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "callbackID" ] === undefined )
		{
			NgLogE("Could not parse callbackID in IPCEmitter.getAppSignaturesCallback from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_getCallingPackageCallbackRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in IPCEmitter.getCallingPackageCallback from command: " + cmd );
			return false;
		}
		
		obj[ "packageName" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "packageName" ] === undefined )
		{
			NgLogE("Could not parse packageName in IPCEmitter.getCallingPackageCallback from command: " + cmd );
			return false;
		}
		
		obj[ "callbackID" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "callbackID" ] === undefined )
		{
			NgLogE("Could not parse callbackID in IPCEmitter.getCallingPackageCallback from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_onIntentReceivedRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in IPCEmitter.onIntentReceived from command: " + cmd );
			return false;
		}
		
		obj[ "action" ] = Core.Proc.parseString( cmd[ 0 ] );
		if( obj[ "action" ] === undefined )
		{
			NgLogE("Could not parse action in IPCEmitter.onIntentReceived from command: " + cmd );
			return false;
		}
		
		obj[ "extras" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "extras" ] === undefined )
		{
			NgLogE("Could not parse extras in IPCEmitter.onIntentReceived from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/** @private */
	_getIsServiceRunningCallbackRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 2 )
		{
			NgLogE("Could not parse due to wrong argument count in IPCEmitter.getIsServiceRunningCallback from command: " + cmd );
			return false;
		}
		
		obj[ "running" ] = Core.Proc.parseBool( cmd[ 0 ] );
		if( obj[ "running" ] === undefined )
		{
			NgLogE("Could not parse running in IPCEmitter.getIsServiceRunningCallback from command: " + cmd );
			return false;
		}
		
		obj[ "callbackID" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "callbackID" ] === undefined )
		{
			NgLogE("Could not parse callbackID in IPCEmitter.getIsServiceRunningCallback from command: " + cmd );
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
		Core.Proc.appendToCommandString( 0x15dffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_canLaunchSendGen: function( url, callbackID )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15d0002, this, [ Core.Proc.encodeString( url ), +callbackID ] );
	},
	
	/** @private */
	_launchSendGen: function( url, callbackID )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15d0003, this, [ Core.Proc.encodeString( url ), +callbackID ] );
	},
	
	/** @private */
	_onResumeFromOthersSendGen: function( url, sourceAppID )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15d0004, this, [ Core.Proc.encodeString( url ), Core.Proc.encodeString( sourceAppID ) ] );
	},
	
	/** @private */
	_getAppSignaturesSendGen: function( packageName, callbackID )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15d0007, this, [ Core.Proc.encodeString( packageName ), +callbackID ] );
	},
	
	/** @private */
	_getCallingPackageSendGen: function( callbackID )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15d0009, this, [ +callbackID ] );
	},
	
	/** @private */
	_launchIntentSendGen: function( intent, extras )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15d000b, this, [ Core.Proc.encodeString( intent ), Core.Proc.encodeString( extras ) ] );
	},
	
	/** @private */
	_launchServiceSendGen: function( intent, extras )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15d000c, this, [ Core.Proc.encodeString( intent ), Core.Proc.encodeString( extras ) ] );
	},
	
	/** @private */
	_getIsServiceRunningSendGen: function( serviceEnum, callbackID )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15d000e, this, [ +serviceEnum, +callbackID ] );
	},
	
	/** @private */
	_createShortcutSendGen: function( name, url, icon_path )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x15d0010, this, [ Core.Proc.encodeString( name ), Core.Proc.encodeString( url ), Core.Proc.encodeString( icon_path ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// canLaunch: function( url, callbackID ) {}
	
	// launch: function( url, callbackID ) {}
	
	// _onResumeFromOthersRecv: function( cmd ) {}
	// onResumeFromOthers: function( url, sourceAppID ) {}
	
	// _launchFailedRecv: function( cmd ) {}
	// _canLaunchCallbackRecv: function( cmd ) {}
	// getAppSignatures: function( packageName, callbackID ) {}
	
	// _getAppSignaturesCallbackRecv: function( cmd ) {}
	// getCallingPackage: function( callbackID ) {}
	
	// _getCallingPackageCallbackRecv: function( cmd ) {}
	// launchIntent: function( intent, extras ) {}
	
	// launchService: function( intent, extras ) {}
	
	// _onIntentReceivedRecv: function( cmd ) {}
	// getIsServiceRunning: function( serviceEnum, callbackID ) {}
	
	// _getIsServiceRunningCallbackRecv: function( cmd ) {}
	// createShortcut: function( name, url, icon_path ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
