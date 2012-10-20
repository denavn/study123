// Class ErrorEmitter
// Emit an error from native to js.
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var MessageEmitter = require('./MessageEmitter').MessageEmitter;
var ObjectRegistry = require('./ObjectRegistry').ObjectRegistry;
var Proc = require('./Proc').Proc;

////////////////////////////////////////////////////////////////////////////////

exports.ErrorEmitter = MessageEmitter.singleton(
/** @lends Core.ErrorEmitter.prototype */
{
	classname: 'ErrorEmitter',
	
	/**
	 * @class The <code>Core.ErrorEmitter</code> provides applications a way to gather
	 * data about unexpected error situations. 
	 * It emits two things: 
	 * <ol><li>Errors that have happened in the native side of the Javascript bridge</li>
	 * <li>Uncaught exceptions in the Javascript game code.</li></ol>
	 * 
	 * When these errors occur, they are packaged and sent to a URL specified by 
	 * {@link Core.ErrorEmitter#setErrorReportPostUrl}. The first time an error is 
	 * encountered, the user will be prompted for permission to send this data.<br/><br/>
	 * @singleton
	 * @constructs The default constructor. 
	 * @augments Core.MessageEmitter
	 * @since 1.6
	 */
	initialize: function()
	{
		ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);
		this._errorReportPostUrl = null;
	},

	/**
	 * Set the URL to post the uncaught exception.
	 * If this function is called with a valid URL, the first time an exception is thrown, 
	 * the user will be asked to permit the application to send error diagnosis information 
	 * to the specified URL.
	 * @example
	 * initialize: function ()
	 * {
	 *     Core.ErrorEmitter.setErrorReportPostUrl("https://myhost.com/error_report.php");
	 * }
	 *
	 * @param {String} url The url where the error diagnosis will be sent. For security, 
	 * HTTPS is preferable to HTTP.
	 * @returns {void}
	 * @since 1.7
	 */
	setErrorReportPostUrl: function(url)
	{
		this._errorReportPostUrl = url;
	},

	_raiseRecv: function( cmd )
	{
		var msg = {};
		if (!this._raiseRecvGen(cmd, msg))
			return;

		this.emit(msg.errorMessage);
	},

	_handleUncaughtException: function(error)
	{
		var that = this;
		if (this._hasErrorReportUrl()) {
			this._checkUserHasAcceptedSendingErrorReport(function(hasAccepted) {
				if (hasAccepted) {
					that._sendErrorReport(error);
					return;
				}

				that._checkUserHasAskedForPermission(function(hasAsked) {
					if (hasAsked)
						return;

					that._showErrorReportAskPermissionDialog(function(accepted) {
						if (accepted) {
							that._setUserAcceptedSendingErrorReport();
							that._sendErrorReport(error);
						} else {
							that._setAlreadyAsked();
						}
					});
				});
			});
		}

		this.emit(error);
	},

	_hasErrorReportUrl: function()
	{
		return this._errorReportPostUrl !== null;
	},

	_checkUserHasAcceptedSendingErrorReport: function(callback)
	{
		var KeyValueCache = require('../Storage/KeyValue').KeyValueCache;
		var ErrorReporterKV = KeyValueCache.global("ErrorReporter");
		return ErrorReporterKV.getItem("userHasAcceptedSendingErrorReport", {}, function(error, value) {
			callback(error ? false : value);
		});
	},

	_checkUserHasAskedForPermission: function(callback)
	{
		var KeyValueCache = require('../Storage/KeyValue').KeyValueCache;
		var ErrorReporterKV = KeyValueCache.global("ErrorReporter");
		return ErrorReporterKV.getItem("userHasAskedForPermission", {}, function(error, value) {
			callback(error ? false : value);
		});
	},

	_setAlreadyAsked: function()
	{
		var KeyValueCache = require('../Storage/KeyValue').KeyValueCache;
		var ErrorReporterKV = KeyValueCache.global("ErrorReporter");
		ErrorReporterKV.setItem("userHasAskedForPermission", "true", {}, function() {});
	},

	_setUserAcceptedSendingErrorReport: function()
	{
		var KeyValueCache = require('../Storage/KeyValue').KeyValueCache;
		var ErrorReporterKV = KeyValueCache.global("ErrorReporter");
		ErrorReporterKV.setItem("userHasAcceptedSendingErrorReport", "true", {}, function() {});
	},

	_showErrorReportAskPermissionDialog: function(callback)
	{
		var AlertDialog = require('../UI/AlertDialog').AlertDialog;

		// TODO: title and text shuold be customizable
		var dialog = new AlertDialog({
			title: 'Application has a problem',
			text: 'Send an error report to the developer?',
			choices: ['No', 'Yes']
		});
		dialog.setOnChoice(function(event) {
			dialog.hide();
			callback(event.choice === 1);
		});
		dialog.show();
	},

	_sendErrorReport: function(errorString)
	{
		var environment = this._gatherEnvironmentInfo();
		var payload = JSON.stringify({environment:environment, error:errorString});

		var XHR = require('../Network/XHR').XHR;
		var request  = new XHR();
		request.open('POST', this._errorReportPostUrl, true);
		request.onreadystatechange = function() {
			// TODO:
			//   if cannot post it to the server, like the case user is offline,
			//   retry it or push into the pending queue to post it again when online.
			//NgLogD('XHR request state changed to: ' + this.readyState);
		};
		request.send(payload);
	},

	_gatherEnvironmentInfo: function() {
		var Capabilities = require('./Capabilities').Capabilities;

		var env = {
			SDKVersion: Capabilities.getSDKVersion(),
			SDKBuildDate: Capabilities.getSDKBuildDate(),
			SDKBuildHash: Capabilities.getSDKBuildHash(),
			BinaryVersion: Capabilities.getBinaryVersion(),
			BinaryBuildDate: Capabilities.getBinaryBuildDate(),
			DeviceName: Capabilities.getDeviceName(),
			PlatformOS: Capabilities.getPlatformOS(),
			PlatformOsVersion: Capabilities.getPlatformOSVersion(),
			PlatformHW: Capabilities.getPlatformHW(),
			PhysicalMem: Capabilities.getPhysicalMem(),
			PhysicalCpus: Capabilities.getPhysicalCpus(),
			ActiveCpus: Capabilities.getActiveCpus(),
			Language: Capabilities.getLanguage(),
			BootDir: Capabilities.getBootDir(),
			GameDir: Capabilities.getGameDir(),
			ProductName: Capabilities.getProductName(),
			ContentUrl: Capabilities.getContentUrl(),
			BootGame: Capabilities.getBootGame(),
			StartingServer: Capabilities.getStartingServer(),
			BundleGame: Capabilities.getBundleGame(),
			BundleServer: Capabilities.getBundleServer(),
			BundleIdentifier: Capabilities.getBundleIdentifier(),
			Game: Capabilities.getGame(),
			Server: Capabilities.getServer(),
			Url: Capabilities.getUrl(),
			ScreenWidth: Capabilities.getScreenWidth(),
			ScreenHeight: Capabilities.getScreenHeight(),
			ScreenUnits: Capabilities.getScreenUnits(),
			ScreenPixelUnits: Capabilities.getScreenPixelUnits(),
			MaxTextureSize: Capabilities.getMaxTextureSize(),
			MaxTextureUnits: Capabilities.getMaxTextureUnits(),
			OglExtentions: Capabilities.getOglExtensions(),
			HasAccel: Capabilities.getHasAccel(),
			HasGyro: Capabilities.getHasGyro(),
			HasTouch: Capabilities.getHasTouch(),
			HasMultiTouch: Capabilities.getHasMultiTouch(),
			HasGps: Capabilities.getHasGps(),
			HasCompass: Capabilities.getHasCompass(),
			HasHwKeyboard: Capabilities.getHasHwKeyboard(),
			HasBackButton: Capabilities.getHasBackButton(),
			HasCamera: Capabilities.getHasCamera(),
			HasWwan: Capabilities.getHasWwan(),
			HasWifi: Capabilities.getHasWifi(),
			Career: Capabilities.getCarrier(),
			Locale: Capabilities.getLocale(),
			AppReleaseVersion: Capabilities.getAppReleaseVersion(),
			SimCountryCode: Capabilities.getSimCountryCode(),
			NetworkCountryCode: Capabilities.getNetworkCountryCode(),
			UdpAvailable: Capabilities.getUdpAvailable(),
			TcpAvailable: Capabilities.getTcpAvailable(),
			SslAvailable: Capabilities.getSslAvailable()
		};

		return env;
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 359,
	// Method create = -1
	// Method raise = 2
	
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
					instance._raiseRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in ErrorEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in ErrorEmitter._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[359] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_raiseRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 1 )
		{
			NgLogE("Could not parse due to wrong argument count in ErrorEmitter.raise from command: " + cmd );
			return false;
		}
		
		obj[ "errorMessage" ] = Proc.parseString( cmd[ 0 ] );
		if( obj[ "errorMessage" ] === undefined )
		{
			NgLogE("Could not parse errorMessage in ErrorEmitter.raise from command: " + cmd );
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
		Proc.appendToCommandString( 0x167ffff, [ +__objectRegistryId ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// _raiseRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
