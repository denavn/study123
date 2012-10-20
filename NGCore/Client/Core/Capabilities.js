	////////////////////////////////////////////////////////////////////////////////
// Class Capabilities
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////


var Class = require('./Class').Class;
var ObjectRegistry = require('./ObjectRegistry').ObjectRegistry;
var Proc = require('./Proc').Proc;


////////////////////////////////////////////////////////////////////////////////

function packVersion(arg1, arg2, arg3, arg4, arg5) {
	if (arg1 instanceof Array) return packVersion.apply(null, arg1);
	return arg1 << 24 | arg2 << 18 | arg3 << 12 | arg4 << 6 | arg5;
}

function unpackVersion(pVers) {
	return [
		pVers >> 24 & 0x03F,
		pVers >> 18 & 0x03F,
		pVers >> 12 & 0x03F,
		pVers >> 6 & 0x03F,
		pVers & 0x03F
	];
}

function packStringVersion(str) {
	return packVersion.apply(null,str.split(/\D/));
}

function stringForVersion(a) {
	if (typeof a == "number") a = unpackVersion(a);
	// Drop trailing zeroes
	while (a.length && (0 | a[a.length - 1]) === 0) {
		a.pop();
	}
	return a.length ? a.join('.') : "Invalid Version";
}

////////////////////////////////////////////////////////////////////////////////

exports.Capabilities = Class.singleton(
/** @lends Core.Capabilities.prototype */
{
	classname: 'Capabilities',
	_configFile: 'configuration.json',
	// The packed integer for the binary version string
	_binaryVersion: 0,
	// The lower of the JS and Binary versions.
	_effectiveVersion: 0,

	/**
	 * @class The <code>Capabilities</code> class provides information about the capabilities of the
	 * device that is running the app. The class also provides details about the app's
	 * configuration and the ngCore binary that is running the app. The information that is provided
	 * by the <code>Capabilities</code> class remains the same throughout the lifetime of the app.
	 * @singleton
	 * @constructs The default constructor.
	 * @augments Core.Class
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
	{
		ObjectRegistry.register(this);
		this._createSendGen(this.__objectRegistryId);

        // Please keep this on one line, sed won't update otherwise
		this._fields = {version: '1.8.0.3', buildDate: '20120702', buildHash: 'g7da6adf'};
	},

	_getConfigFile:			function() {return this._configFile;},
	_getAccts:				function() {return this._fields._accts;},

	/**
	 * Compare an ngCore version number to the ngCore binary version that is currently running. The
	 * return value indicates whether the current ngCore binary is older than, identical to, or
	 * newer than the specified version.
	 * @example
	 * // Check whether the current ngCore binary version is later than 1.3.2.
	 * var compare = Core.Capabilities.compareBinaryVersion("1.3.2");
	 * if (compare > 0) {
	 *     console.log("The current binary version is more recent than 1.3.2.");
	 * }
	 * @param {String} v The ngCore version number to compare against the current binary.
	 * @returns {Number} A negative number if the specified version is older than the current
	 *		binary; a positive number if the specified version is newer than the current binary;
	 *		or <code>0</code> if the two versions are equal.
	 * @since 1.8
	 */
	compareBinaryVersion: function(v) {
		var version = (arguments.length == 1 && typeof v == "string")
			? packStringVersion(v)
			: packVersion.apply(null, arguments);
		// Compare to version. Will be positive if binary version is newer, zero if equal, negative if binary is older
		return this._binaryVersion - version;
	},

	/**
	 * Check whether the current ngCore binary meets a minimum version number.
	 * @example
	 * // Check whether the current ngCore binary version is 1.8 or greater.
	 * if (Core.Capabilities.meetsBinaryVersion("1.8")) {
	 *     console.log("The current binary version is 1.8 or greater.");
	 * }
	 * @param {String} v The ngCore version number to compare against the current binary.
	 * @returns {Boolean} Set to <code>true</code> if the specified version is equal to or
	 *		greater than the version of the current ngCore binary.
	 * @since 1.8
	 */
	meetsBinaryVersion: function(v)
	{
		return this.compareBinaryVersion(v) >= 0;
	},
	
	/**
	 * Return the object stored in configuration.json for your game.
	 * @returns {Object} The JSON.parsed object represented in your configuration.json file.
	 * @status
	 * @since 1.0
	 */
	getConfigs:			function() {return this._configuration;},

	/**
	 * Return the SDK version number from the <code>Capabilities</code> of this device.
	 * @returns {String} The version of the SDK on the device.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getSDKVersion:           function() { return this._fields.version; },

	/**
	 * Return the build date for the currently installed SDK. The build date is in the format <i>YYYYMMDD</i>.
	 * @returns {String} The build date for the SDK on the device.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getSDKBuildDate:           function() { return this._fields.buildDate; },
	
	/**
	 * Return the build hash of the currently installed SDK.
	 * @returns {String} The build hash for the SDK on the device.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getSDKBuildHash:           function() { return this._fields.buildHash; },

	/**
	 * Return the version of ngCore that is currently running.
	 * @returns {String} The version of ngCore that is running.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.1.5
	 */
	getBinaryVersion:           function() { return this._fields.binaryVersion; },
	
	/**
	 * Return the version of ngCore's host application.
	 * @returns {String} The version of the host application.
	 * @status Android
	 * @since 1.7
	 */
	getApplicationVersion:           function() { return this._fields.applicationVersion; },

	/**
	 * Return the version code of ngCore's host application.
	 * @returns {String} The version code of the host application.
	 * @type String
	 * @status Android
	 * @since 1.8
	 */
	getApplicationVersionCode:       function() { return this._fields.applicationVersionCode; },

	/**
	 * Return the build date for the currently running ngCore binary. The build date is in the format <i>YYYYMMDD</i>.
	 * @returns {String} The build date for the ngCore binary.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.1.5
	 */
	getBinaryBuildDate:           function() { return this._fields.binaryBuildDate; },

	/**
	 * Return the build hash of the currently running ngCore binary.
	 * @returns {String} The build hash for the ngCore binary.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.1.5
	 */
	getBinaryBuildHash:           function() { return this._fields.binaryBuildHash; },
	
	/**
	 * Return the device ID. 
	 * @returns {String} The device ID for the device running the application.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getUniqueId:           function() { return this._fields.uniqueId; },

	/**
	 * Return the lifetime constant value of the device.<br /><br />
	 * <b>Note:</b> Currently only available on Android.
	 * @returns {String} <code>Settings.Secure.ANDROID_ID</code>: A 64-bit number as a hex string randomly generated on first boot of the device if platform is Android. Mac address if platform is iOS.
	 * <b>Note:</b> This value only changes when the device is reset.
	 * @status iOS, Android
	 * @since 1.0
	 */
	getLifetimeName: function() { return this._fields.lifetimeName; },
	
	/**
	 * Return the device name.
	 * @returns {String} The device name for the device running the application.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getDeviceName:         function() { return this._fields.deviceName; },
	
	/**
	 * Return the operating system.
	 * @returns {String} The operating system of the device running the application.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getPlatformOS:         function() { return this._fields.platformOs; },
	
	/**
	 * Return the operating system version number.
	 * @returns {String} The version number of the operating system running on the device.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getPlatformOSVersion:  function() { return this._fields.platformOsVersion; },
	
	/**
	 * Return the device hardware type.
	 * @returns {String} The type of device hardware running the application.
	 * @status iOS, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getPlatformHW:         function() { return this._fields.platformHw; },
	
	/**
	 * Return the total amount of installed memory.
	 * @returns {Number} The amount of installed memory on the device running the application.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getPhysicalMem:        function() { return this._fields.physicalMemory; },
	
	/**
	 * Return the total number of installed CPUs.
	 * @returns {Number} The number of CPUs installed on the device running the application.
	 * @status iOS, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getPhysicalCpus:       function() { return this._fields.physicalCpus; },
	
	/**
	 * Return the number of active CPUs.
	 * @returns {Number} The number of active CPUs on the device running the application.
	 * @status iOS, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getActiveCpus:         function() { return this._fields.activeCpus; },
	
	/**
	 * Return the installed user language. 
	 * @returns {String} The installed user language on the device running the application.
	 * Expressed as a canonicalized IETF BCP 47 language identifier.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getLanguage:         function() { return this._fields.language; },

	_getBoot: function() { return this._fields.boot; },
	_getBootServer: function() { return this._fields.bootServer; },

	getBootDir: function () { return this._fields.bootDir; },
	getGameDir: function () { return this._fields.gameDir; },
	getProductName: function () { return this._fields.prodName; },
	_getReferrer: function() { return this._fields.referrer; },

	/**
	 * Return the URL for the content of this application.
	 * @returns {String} The URL to content for this application.
	 * @status Flash
	 * @since 1.0
	 */
	getContentUrl:			function() {return this._fields.contentUrl;},

	/**
	 * Return the name of the root application. Root application refers to the application that launches when the user taps the application icon.
	 * @returns {String} The directory name for the root application.
	 * @status Flash
	 * @since 1.0
	 */
	getBootGame:         function() { return this._fields.bootgame; },

	/**
	 * Return the starting server for an application.
	 * @returns {String} The start server.
	 * @status
	 * @since 1.0
	 */
	getStartingServer:         function() { return this._fields.startingServer; },

	/**
	 * Return the name of the application bundled with the binary of this build.
	 * @returns {String} The name of the bundled game.
	 * @status
	 * @since 1.0
	 */
	getBundleGame:         function() { return this._fields.bundleGame; },

	/**
	 * Return the server bundled with the binary of this build.
	 * @returns {String} The bundle server.
	 * @status
	 * @since 1.0
	 */
	getBundleServer:         function() { return this._fields.bundleServer; },

	/**
	 * Return the bundle identifier for the binary of this build.
	 * @returns {String} The bundle identifier.
	 * @status
	 * @since 1.0
	 */
	getBundleIdentifier:         function() { return this._fields.bundleIdentifier; },
	
	/**
	 * Return the directory name of the currently running application.
	 * @returns {String} The current folder name for the application.
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	getGame:         function() { return this._fields.game; },

	/**
	 * Return the server from which an application was downloaded.
	 * @returns {String} The download server.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getServer:         function() { return this._fields.server; },

	/**
	 * Return the full URL for the current application.
	 * @returns {String} The URL from which a application is downloaded.
	 * @status Flash
	 * @since 1.0
	 */
	getUrl:         function() { return this._fields.url; },

	/**
	 * Return the logical screen width for this device.
	 * @returns {Number} The current screen width of the device.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getScreenWidth:        function() { return this._fields.screenWidth; },
	
	/**
	 * Return the logical screen height for this device.
	 * @returns {Number} The current screen height of the device.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getScreenHeight:       function() { return this._fields.screenHeight; },
	
	/**
	 * Return a reasonable factor for scaling logical coordinates to the current display.
	 * @returns {Number} Logically scaled screen units for the device.
	 * @status
	 * @since 1.0
	 */
	getScreenUnits:        function() { return this._fields.screenUnits; },
	
	/**
	 * Return the number of physical pixels associated with one unit of logical space.
	 * @returns {Number} The total number of pixels that equal one screen unit.
	 * @status
	 * @since 1.0
	 */
	getScreenPixelUnits:       function() { return this._fields.screenPixelUnits; },
	
	/**
	 * Return the maximum number of supported textures.
	 * @returns {Number} The maximum number of supported textures per coordinate (<i>x</i>,<i>y</i>).
	 * @status Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getMaxTextureSize:     function() { return this._fields.maxTextureSize; },
	
	/**
	 * Return the maximum number of supported texture units.
	 * @returns {Number} The maximum number of supported texture units per coordinate (<i>x</i>,<i>y</i>).
	 * @status Test, iOSTested, AndroidTested
	 * @since 1.0
	 */
	getMaxTextureUnits:    function() { return this._fields.maxTextureUnits; },
	
	/**
	 * Deprecated method for retrieving information about OpenGL extensions.
	 * @deprecated Replaced by {@link UI.GLView#getGLExtensions}.
	 * @returns {String[]} A list of supported extensions.
	 * @since 1.0
	 */
	getOglExtensions:      function()
	{
		if (this._fields.oglExtensions)
			return this._fields.oglExtensions;

		// This table should stay in sync with:
		// https://spreadsheets.google.com/a/ngmoco.com/spreadsheet/ccc?key=0AinqDSqLOjJtdDMwNGk0eDgtRFdvQ2N0eWRUcGlsc0E&hl=en_US&authkey=CMWLyoAC
		switch (this._fields.deviceName)
		{
			case "Droid":                // Motorola Droid
			case "DROID2":               // Motorola Droid 2
			case "DROIDX":               // Motorola Droid X
			case "SGH-T959":             // Samsung Galaxy S 19000 8GB
			case "SGH-T959V":            // Samsung Galaxy S 4G
			case "SAMSUNG-SGH-I997":     // Samsung Galaxy S2
			case "SAMSUNG-SGH-I897":     // Samsung Captivate
			case "Nexus S":              // Google Nexus S
				return ["GL_IMG_texture_compression_pvrtc"];
			case "HTC Desire":           // HTC Desire GSM
			case "PC36100":              // HTC Evo 4G
			case "ADR6300":              // HTC Droid Incredible
			case "001HT":                // HTC Desire HD
			case "Nexus One":            // Google Nexus One
			case "HTC Glacier":          // HTC myTouch 4G
				return ["GL_AMD_compressed_ATC_texture"];
			default:
				return [];
		}
	},

	/**
	 * Return the directory path to the temp directory for this device.
	 * @returns {String} The directory path to the temp directory on the device.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getTmpDir:           function() { return this._fields.tmpDir; },

	/**
	 * Check the <code>Capabilities</code> of this device for an accelerometer.
	 * @returns {Boolean} Returns <code>true</code> when the device running the application contains an accelerometer.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getHasAccel:           function() { return this._fields.hasAccel; },
	
	/**
	 * Check the <code>Capabilities</code> of this device for a gyroscope.
	 * @returns {Boolean} Returns <code>true</code> when the device running the application contains an gyroscope.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getHasGyro:            function() { return this._fields.hasGyro; },
	
	/**
	 * Check the <code>Capabilities</code> of this device for touchscreen input support.
	 * @returns {Boolean} Returns <code>true</code> when the device running the application supports touchscreen input.
	 * @status iOS, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getHasTouch:           function() { return this._fields.hasTouch; },
	
	/**
	 * Check the <code>Capabilities</code> of this device for multi-touch input support.
	 * @returns {Boolean} Returns <code>true</code> when the device running the application supports multi-touch input.
	 * @status iOS, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getHasMultiTouch:      function() { return this._fields.hasMultiTouch; },
	
	/**
	 * Check the <code>Capabilities</code> of this device for a GPS unit.
	 * @returns {Boolean} Returns <code>true</code> when the device running the application contains a GPS unit.
	 * @status Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getHasGps:             function() { return this._fields.hasGps; },
	
	/**
	 * Check the <code>Capabilities</code> of this device for a magnetic compass.
	 * @returns {Boolean} Returns <code>true</code> when the device running the application contains a magnetic compass.
	 * @status Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getHasCompass:         function() { return this._fields.hasCompass; },
	
	/**
	 * Check the <code>Capabilities</code> of this device for a hardware keyboard.
	 * @returns {Boolean} Returns <code>true</code> when the device running the application contains a hardware keyboard.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getHasHwKeyboard:      function() { return this._fields.hasHwKeyboard; },
	
	/**
	 * Check the <code>Capabilities</code> of this device for a <b>Back</b> button.
	 * @returns {Boolean} Returns <code>true</code> when the device running the application contains a <b>Back</b> button.
	 * @status Flash, Test, FlashTested
	 * @since 1.0
	 */
	getHasBackButton:      function() { return this._fields.hasBackButton; },

	/**
	 * Check the <code>Capabilities</code> of this device for a camera.
	 * @returns {Boolean} Returns <code>true</code> when the device running the application contains a camera.
	 * @status Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getHasCamera:          function() { return this._fields.hasCamera; },
	
	/**
	 * Check the <code>Capabilities</code> of this device for access to a wide area network (WAN).
	 * @returns {Boolean} Returns <code>true</code> when the device running the application has access to a WAN.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getHasWwan:            function() { return this._fields.hasWwan; },

	/**
	 * Check the <code>Capabilities</code> of this device for access to a Wi-Fi network.
	 * @returns {Boolean} Returns <code>true</code> when the device running the application has access to Wi-Fi.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getHasWifi:            function() { return this._fields.hasWifi; },

	/**
	 * Return the name of the mobile phone carrier this device was using at program startup.
	 * @returns {String} Returns the name of the mobile phone carrier, or an empty string if no carrier 
	 * was used (for example, if the device is not connected to a carrier or does not include
	 * hardware for mobile phone service).
	 * @status
	 * @since 1.0
	 */
	getCarrier:            function() { return this._fields.carrier; },

	/**
	 * Return the URL used to launch this application.
	 * @returns {String} The URL for launching this application. If the application is not launched from a URL, returns an empty string.
	 * @status Flash, Test, FlashTested
	 * @since 1.0
	 */
	getIntentUrl:            function() { return this._fields.intentUrl; },
	
	/**
	 * Return the Action used to launch this application.
	 * @returns {String} The action for launching this application. If the application is not launched from an action, returns undefined.
	 * @private
	 * @status
	 * @since 1.6
	 */
	getIntentAction:            function() { return this._fields.intentAction; },
	
	/**
	 * Return the height of the system status bar.
	 * @returns {Number} The status bar height rounded to the nearest integer (in pixels).
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 * @status Android
	* @since 1.0
	 */
     getStatusBarHeight:            function() { return this._fields.statusBarHeight; },
	
	/**
	 * Return the device locale.
	 * @returns {String} The regional location of a device.
	 * The <code>locale</code> string is a combination of ISO 639-1 and ISO 3166-1. For example, <code>en_US</code>, <code>ja_JP</code>.
	 * @status Flash
	 * @since 1.0
	 */
	getLocale: function() { return this._fields.locale; },

	/**
	 * Return a list of installed fonts on this device.
	 * @returns {String[]} An array of font names installed on the system or addressable by name.
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	getAvailableFonts: function()
	{
		return this._deserializedFonts || (this._deserializedFonts = JSON.parse(this._fields.availableFonts));
	},
	
	/** @private */
	getAutorotateDisabled: function()
	{
		return this._fields.autorotateDisabled || false;
	},
	
	/** @private */
	getInstallReferrer: function() { return this._fields.installReferrer; },
	
	/**
	 * Return the social server used for this application.
	 * @returns {String} The social server URL. For example, partner.plusplus.com.
	 * @status
	 * @since 1.0
	 */	
	getSocialServer: function()
	{
		return this.socialServer;
	},

	/**
	 * Return the name of the Mobage distribution first installed on the device.
	 * @returns {String} The name of the distribution.
	 * @private
	 */
	getDistributionName: function() 
	{
		return this._fields.distributionName;
	},

	/**
	 * Return the name of the Mobage distribution currently installed on the device.
	 * @returns {String} The name of the distribution.
	 * @private
	 */
	getBinaryDistributionName: function() 
	{
		return this._fields.binaryDistributionName;
	},

	/**
	 * @private
	 */	
	getSourceAppID: function()
	{
		return this._fields.sourceAppID;
	},

	/**
	 * @private
	 * @status Android
	 */	
	getAppSignatures: function()
	{
		return this._fields.appSignatures;
	},
	
	/**
	 * Return the release version of this application, as specified in the
	 * <code>configuration.json</code> file's <code>releaseVersion</code> property.
	 * @returns {String} The version identifier.
	 * @status
	 * @since 1.7
	 */
	getAppReleaseVersion: function()
	{
		return this._releaseVersion;
	},

	/**
	 * Return the ISO country code of the SIM card that the device is using.
	 * @returns {String} The ISO country code of the SIM card that the device is using.
	 * @since 1.7
	 */
	getSimCountryCode: function()
	{
		return this._fields.simCountryCode;
	},

	/**
	 * Return the ISO country code of the mobile phone network that the device is using.
	 * @returns {String} The ISO country code of the mobile phone network that the device is using.
	 * @since 1.7
	 */
	getNetworkCountryCode: function()
	{
		return this._fields.networkCountryCode;
	},

	/**
	 * Returns true of the app is disaggregated
	 * @returns {bool}
	 * @since 1.6
	 * @private
	 */
	getIsDisaggregated: function() { return this._fields.isDisaggregated; },
	
    /**
     * Returns true of the app should send the log to the timing performance server
     * @returns {bool}
     * @private
     */
    _getLogToFile: function() { return this._fields.logToFile; },

	/**
	 * Check whether a UDP socket can be created using the <code>{@link Network.Socket}</code>
	 * class.
	 * @returns {Boolean} Returns <code>true</code> if UDP sockets are supported on the current
	 *		device and binary.
	 * @since 1.7
	 */
	getUdpAvailable: function()
	{
		if(this.getPlatformOS() == 'Android' || this.getPlatformOS() == 'iPhone OS') {
			if(this.compareBinaryVersion(1, 6, 5) >= 0) {
				return true;
			}
		}
		return false;
	},

	/**
	 * Check whether an unencrypted TCP socket can be created using the 
	 * <code>{@link Network.Socket}</code> class.
	 * @returns {Boolean} Returns <code>true</code> if unencrypted TCP sockets are supported on the
	 *		current device and binary.
	 * @since 1.7
	 */
	getTcpAvailable: function()
	{
		if(this.getPlatformOS() == 'Android' || this.getPlatformOS() == 'iPhone OS') {
			if(this.compareBinaryVersion(1, 6, 5) >= 0) {
				return true;
			}
		}
		return false;
	},

	/**
	 * Check whether a TCP socket with SSL encryption can be created using the
	 * <code>{@link Network.Socket}</code> class.
	 * @returns {Boolean} Returns <code>true</code> if SSL-encrypted TCP sockets are supported on
	 *		the current device and binary.
	 * @since 1.7
	 */
	getSslAvailable: function()
	{
		if(this.getPlatformOS() == 'Android' || this.getPlatformOS() == 'iPhone OS') {
			if(this.compareBinaryVersion(1, 6, 5) >= 0) {
				return true;
			}
		}
		return false;
	},
	
	_getPendingNotification: function () {
		var pending = this._fields.pendingNotification;
		this._fields.pendingNotification = null;
		if (pending) {
			return JSON.parse(pending);
		}
		return null;
	},

	/** @private */
	_init: function(dict)
	{
		// parse the dict
		var ifields = [];
		NgParseCommandDictionary(dict, 2, this._fields, ifields);

		try {
			// Change server based on URL passed in
			var items = /(https?:\/\/.+?)\/(.*)/.exec(this._fields.url);
			this._fields.server = items[1];
			this._fields.game  = items[2];
		}
		catch (e)
		{
			NgLogException(e);
		}

		// KJ this is necessary because an empty string passed becomes undefined
		if (!this._fields.intentUrl)
			this._fields.intentUrl = "";

		if (this._fields.oglExtensions)
		try
		{
			this._fields.oglExtensions = JSON.parse(this._fields.oglExtensions);
		}
		catch (e)
		{
			NgLogE("Unable to parse OGL Extensions! " + this._fields.oglExtensions);
			NgLogException(e);
		}

		if (this._fields._accts)
		try
		{
			this._fields._accts = JSON.parse(this._fields._accts);
		}
		catch (e)
		{
			NgLogE("Unable to parse Accounts! " + this._fields._accts);
			NgLogException(e);
		}

		try
		{
			this._configuration = JSON.parse(this._fields.configJSON);
			this._fields.contentUrl = this._configuration.contentUrl;
			this.socialServer = this._configuration.socialServer;
			this._releaseVersion = this._configuration.releaseVersion;
		}
		catch (e)
		{
			NgLogE("Unable to parse config!! (" + this._fields.configJSON + ")");
			NgLogException(e);
		}

		try {
			var jsVersion = packStringVersion((this.getSDKVersion() || "1.0").match(/[\.\d]+$/)[0]);
			Proc._setCoreJSVersionSendGen(jsVersion);
			this._binaryVersion = packStringVersion((this.getBinaryVersion() || "1.0").match(/[\.\d]+$/)[0]);
			this._effectiveVersion = Math.min(this._binaryVersion, jsVersion);
		}
		catch (e) {
			NgLogE("Unable to parse version strings!");
			NgLogException(e);
		}

		console.log( "dict : JS version : " + this.getSDKVersion() );
		console.log( "dict : JS build date : " + this.getSDKBuildDate() );
		console.log( "dict : JS build hash : " + this.getSDKBuildHash() );

		console.log("dict : contentUrl : " + this._fields.contentUrl);
		console.log("dict : socialServer : " + this.socialServer);
		console.log("dict : releaseVersion : " + this._releaseVersion);
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 301,
	// Method create = -1
	
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
					NgLogE("Unknown instance method id " + cmdId + " in Capabilities._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Capabilities._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[301] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Proc.appendToCommandString( 0x12dffff, [ +__objectRegistryId ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
