//
//  Mobclix.Core.Config.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../../Core').Core;
var Network = require('../../Network').Network;
var Storage = require('../../Storage').Storage;
var KeyValueCache = require('../../Storage/KeyValue').KeyValueCache;

var $mc = require('./Utils').Utils;
// var Controller = require('./Controller').Controller;
var HTTPRequest = require('./HTTPRequest').HTTPRequest;

exports.Config = Core.Class.singleton({
	version: "0.99",
	
	configURL: "http://data.mobclix.com/post/config",
	advertisingURL: "http://ads.mobclix.com/",
	
	config: {},
	emitter: null,
	_isUpdating: false,
	_hasConfigFailed: false,
	_idleTimeoutInterval: 0.0,
	
	initialize: function() {
		this.emitter = new Core.MessageEmitter();
	},
	
	updateConfiguration: function(controller) {
		if(this.isUpdating()) return;
		else this._setUpdating(true);

		this._updateConfiguration(controller);
	},
	
	_updateConfiguration: function(controller) {
		var sessionTracking = controller.sessionTracking;
		
		if(controller.getNetworkState() == "none") {
			$mc.log("network state none");
			this.isUpdating(false);
			sessionTracking.offlineSessionCount++;
			sessionTracking.saveSessionTrackingData();
			this._hasConfigFailed = true;
			this.emitter.emit(this);
			return;
		}

		var self = this;

		// Load cached first
		try {
			Storage.FileSystem.readFile("MobclixConfig-" + controller.applicationId, false, function(error, value) {
				try {
					value = eval("("+value+")");
				} catch(e) { }

				if(value && typeof value == 'object' && value.length > 0) {
					self.config = value;
				}
			});
            
            var kv = new Storage.KeyValue();
            kv.registerForKey("mobclix");
            kv.getItem("userAgent", {}, function(param1, value, key) {
                controller.setUserAgent(value, true);
                kv.destroy();
            });
		} catch(e) { }

		// Request fresh config
		var queryString = {
			a: controller.applicationId,
			p: controller.isAndroid() ? 'android' : (controller.isIPad() ? 'ipad' : 'iphone'),
			m: this.version,
			// v: "1.0", // TODO
			d: Core.Capabilities.getUniqueId(),
			dm: Core.Capabilities.getDeviceName(),
			// dv: "", // TODO
			hwdm: Core.Capabilities.getPlatformHW(),
			g: controller.getNetworkState(),
			off: sessionTracking.offlineSessionCount,
			st: sessionTracking.lastSessionLength,
			it: sessionTracking.idleSessionTime,
			rt: 'mobage',
			rtv: Core.Capabilities.getSDKVersion()
		};

		$mc.log("sessionTracking.offlineSessionCount:", sessionTracking.offlineSessionCount);
		$mc.log("sessionTracking.lastSessionLength:", sessionTracking.lastSessionLength);
		$mc.log("sessionTracking.idleSessionTime:", sessionTracking.idleSessionTime);
		
		// Location
		var location = null;
		if((location = controller.getLocation())) {
			queryString.ll = location;
			location = null;
		}
		
		var newKey = controller.applicationId + "-new";
		KeyValueCache.local.getItem(newKey, {}, function(error, value) {
			// Determine if new
			if((error && error.length > 0) || value !== "false") {
				$mc.log("Detected new user");
				queryString['new'] = true;
				KeyValueCache.local.setItem(newKey, "false", {});
			}

			// Start request
			var request = new HTTPRequest;
			request.start({
				url: self.getConfigURL(),
				data: queryString,
				type: "get",
				success: function(request, response) {
					if(request.getStatusCode() == 200) {
						if(typeof response == 'string') {
							// Temp fix until the headers are updated on remote config
							response = eval("("+response+")");
						}

						self.finishedUpdating(response, controller);
					} else {
						self.failedToUpdate("Unknown error", controller);
					}
				},
				error: function(request, error) {
					self.failedToUpdate(error, controller);
				}
			});
			request.release();
		}, true);
	},
	
	finishedUpdating: function(response, controller) {
		this._setUpdating(false);
		this._hasConfigFailed = false;
		this.config = typeof response == 'object' ? response : {};
		controller.sessionTracking.idleSessionTime = 0;
		controller.sessionTracking.lastSessionLength = 0;
		controller.sessionTracking.offlineSessionCount = 0;
		controller.sessionTracking.saveSessionTrackingData();
		
		try {
			Storage.FileSystem.writeFile("MobclixConfig-" + controller.applicationId, JSON.stringify(this.config));
		} catch(e) { }
		
		this.emitter.emit(this);
	},
	
	failedToUpdate: function(error, controller) {
		$mc.log("Config Request failed, error: ", error);
		this._hasConfigFailed = true;
		this._setUpdating(false);
		controller.sessionTracking.offlineSessionCount++;
		controller.sessionTracking.saveSessionTrackingData();
		this.emitter.emit(this);
	},
	
	hasConfigFailed: function() {
		return this._hasConfigFailed;
	},
	
	addListener: function(listener, func) {
		this.emitter.addListener(listener, func);
	},
	
	removeListener: function(listener) {
		this.emitter.removeListener(listener);
	},
	
	getVersion: function() {
		return this.version;
	},
	
	_setUpdating: function(b) {
		this._isUpdating = b;
	},
	
	isUpdating: function() {
		return this._isUpdating;
	},
	
	getIdleTimeoutInterval: function() {
		try {
			return this.config.idle_timeout || this._idleTimeoutInterval;
		} catch (e) {
			return this._idleTimeoutInterval;
		}
	},
	
	getConfigURL: function() {
		try {
			return this.config.urls.config || this.configURL;
		} catch (e) {
			return this.configURL;
		}
	},
	
	getAdvertisingURL: function() {
		try {
			return this.config.urls.ads || this.advertisingURL;
		} catch (e) {
			return this.advertisingURL;
		}
	},
	
	getAnalyticsURL: function() {
		try {
			return this.config.urls.analytics || this.analyticsURL;
		} catch (e) {
			return this.analyticsURL;
		}
	},
	
	getNativeURLs: function() {
		var nativeURLs = null;
		
		try {
			nativeURLs = this.config.native_urls;
			if(!nativeURLs instanceof Array) {
				nativeURLs = null;
			}
		} catch(e) {
			nativeURLs = null;
		}
		
		if(!nativeURLs || nativeURLs.length == 0) {
			nativeURLs = [
							"itunes.apple.com",
							"phobos.apple.com",
							"maps.google.com",
							"youtube.com",
							"mailto:"
						];
		}
		
		return nativeURLs;
	},
	
	isAdUnitEnabled: function(size) {
		var props = this._propertiesForAdUnit(size);
		return $mc.parseBool(props.autoplay_interval) || true;
	},
	
	isAutoPlayEnabled: function(size) {
		var props = this._propertiesForAdUnit(size);
		return $mc.parseBool(props.autoplay) || false;
	},
	
	richMediaRequiresUserInteraction: function(size) {
		var props = this._propertiesForAdUnit(size);
		return $mc.parseBool(props.rm_require_user) || true;
	},
	
	refreshInteveralForAdUnit: function(size) {
		var props = this._propertiesForAdUnit(size);
		return parseInt(props.autoplay_interval, 10) || 30;
	},
	
	autoplayTimeoutInteveralForAdUnit: function(size) {
		var props = this._propertiesForAdUnit(size);
		return parseInt(props.autoplay_interval, 10) || size.height == 250 ? 0 : 120;
	},
	
	_propertiesForAdUnit: function(size) {
		var props = null;
		
		if(size.width == 999) {
			size = "fullscreen";
		} else {
			size = size.width  + "x" + size.height;
		}

		try {
			if(this.config.ad_units) $mc.each(this.config.ad_units, function(unit, key) {
				if(unit.size == size) {
					props = unit;
					return false;
				}
			});
		} catch(e) { }

		return props || {};
	},
	
	destroy: function() {
		this.version = null;
		this.configURL = null;
		this.advertisingURL = null;
		this.analyticsURL = null;
		this.config = null;
		this.emitter = null;
	}
});
