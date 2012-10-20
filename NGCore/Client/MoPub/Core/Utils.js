var Core = require('../../Core').Core;
var Device = require('../../Device').Device;
var UI = require('../../UI').UI;

var Utils = exports.Utils = Core.Class.singleton({
	classname: 'Utils',
	
	initialize: function() {
		this._mpLogEnabled = false;
		this._initializeUserAgent();
		this._initializeTimezone();
	},
	
	_initializeUserAgent: function() {
		this._userAgent = '';
		
		var self = this;
		var tempWebView = new UI.WebView();
		
		tempWebView.setOnPageevent(function(event) {
			self._userAgent = event.eventStream.replace(/\%20/gi, ' ');
		});
		
		tempWebView.setOnPageload(function(event) {
			tempWebView.destroy();
		});
		
		// This "invoke" call causes setOnPageevent(event) to be fired. We can then retrieve the user
		// agent via event.eventStream.
		tempWebView.invoke('var url = "ngcore://" + navigator.userAgent; window.location = url;');
	},
	
	_initializeTimezone: function() {
		var timezone = new Date().getTimezoneOffset() / 60 * -1 * 100;
		this._timezone = (timezone > 0) ? '+' + timezone : '' + timezone;
	},
	
	createGenericListener: function() {
		var GenericListener = Core.MessageListener.subclass({
			onUpdate: function() {}
		});
		return new GenericListener();
	},
	
	dp: function(pixels) {
		return Math.round(Core.Capabilities.getScreenUnits() * pixels);
	},
	
	isIOS: function() {
		if (typeof this._isIOS !== 'undefined') {
			return this._isIOS;
		}
		
		var re = /iphone|ipad|ios|ipod/i;
		this._isIOS = re.test(Core.Capabilities.getPlatformOS());
		return this._isIOS;
	},
	
	isValidOrientation: function(orientation) {
		for (var key in Device.OrientationEmitter.Orientation) {
			if (Device.OrientationEmitter.Orientation.hasOwnProperty(key)) {
				if (orientation === Device.OrientationEmitter.Orientation[key]) {
					return true;
				}
			}
		}
		return false;
	},
	
	parseURLForMoPubHost: function(url) {
		var re = new RegExp('mopub://(finishLoad|failLoad)');
		var result = re.exec(url);
		return (result && result[1]) ? result[1] : null;
	},
	
	mpLog: function() {
		if (!this._mpLogEnabled) {
			return;
		}
		
		var args = Array.prototype.slice.call(arguments, 0);
		if (args.length > 0) {
			args[0] = 'MoPub: ' + args[0];
		}
		console.log.apply(console, args);
	},
	
	setMpLogEnabled: function(enabled) {
		this._mpLogEnabled = enabled;
	},
	
	orientationIsPortrait: function(orientation) {
		return (orientation === Device.OrientationEmitter.Orientation.Portrait ||
			orientation === Device.OrientationEmitter.Orientation.PortraitUpsideDown);
	},
	
	orientationIsLandscape: function(orientation) {
		return (orientation === Device.OrientationEmitter.Orientation.LandscapeLeft ||
			orientation === Device.OrientationEmitter.Orientation.LandscapeRight);
	},
	
	orientationIsFaceUpOrDown: function(orientation) {
		return (orientation === Device.OrientationEmitter.Orientation.FaceUp ||
			orientation === Device.OrientationEmitter.Orientation.FaceDown);
	},
	
	getUserAgent: function() {
		return this._userAgent;
	},
	
	getTimezone: function() {
		return this._timezone;
	}
});
