//
//  Mobclix.Core.Controller.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../../Core').Core;
var Device = require('../../Device').Device;
var Storage = require('../../Storage').Storage;
var Session = require('./Session').Session;
var SessionTracking = require('./SessionTracking').SessionTracking;
var Config = require('./Config').Config;
var $mc = require('./Utils').Utils;

var ProxyListener = Core.MessageListener.subclass({
	onUpdate: function() {}
});

exports.Controller = Core.Class.singleton({
	applicationId: null,
    userAgent: null,
	networkEmitter: null,
	proxyListener: null,
	_isAppActive: true,
	sessionTracking: null,
	inModal: false,
	emitter: null,
	_hasBeenStarted: false,
	
	initialize: function() {
		this.proxyListener = new ProxyListener();
		var self = this;
		
		this.emitter = new Core.MessageEmitter();
		
		Device.NetworkEmitter.addListener(this.proxyListener, function() { });
		Device.LifecycleEmitter.addListener(this.proxyListener, function(event) {
			if(event == Device.LifecycleEmitter.Event.Suspend) {
				self.willGoInactive();
			} else if(event == Device.LifecycleEmitter.Event.Resume) {
				self.didBecomeActive();
			} else if(event == Device.LifecycleEmitter.Event.Terminate) {
				self.willTerminate();
			}
		});
	},
	
	hasBeenStarted: function() {
		return this._hasBeenStarted;
	},
	
	startWithApplicationId: function(id) {
		$mc.log("Starting with app id: " + id);

		var oldAppId = this.applicationId;
		var self = this;
		this.applicationId = id;

		if(!oldAppId || oldAppId != id) {
			Session.renewIdentifier();
			
			if(this.sessionTracking) this.sessionTracking.destroy();
			this.sessionTracking = new SessionTracking(this);
		}
		
		this._hasBeenStarted = true;
		
		Config.updateConfiguration(this);
		setTimeout(function() {
			self.emitter.emit(self);
		}, 1);
	},
	
	addListener: function(listener, func) {
		this.emitter.addListener(listener, func);
	},
	
	removeListener: function(listener) {
		this.emitter.removeListener(listener);
	},

	willTerminate: function() {
		this._isAppActive = false;
		if(this.sessionTracking) this.sessionTracking.willTerminate();
		$mc.log("App Lifecycle: willTerminate");
	},
	
	didBecomeActive: function() {
		this._isAppActive = true;
		if(this.sessionTracking) this.sessionTracking.didBecomeActive();
		$mc.log("App Lifecycle: didBecomeActive");
	},
	
	willGoInactive: function() {
		this._isAppActive = false;
		if(this.sessionTracking) this.sessionTracking.willGoInactive();
		$mc.log("App Lifecycle: willGoInactive");
	},
	
	isApplicationActive: function() {
		return this._isAppActive;
	},
	
	isAndroid: function() {
		return Core.Capabilities.getPlatformOS().match(/android/i);
	},
	
	isIOS: function() {
		return Core.Capabilities.getPlatformOS().match(/iphone|ipad|ios|ipod/i);
	},
	
	isIPad: function() {
		return Core.Capabilities.getPlatformOS().match(/ipad/i);
	},
		
	getNetworkState: function() {
		return "wifi";
		/* Skip unused code
		// This is broken
		switch (Device.NetworkEmitter.getLastStatus()) {
			case Device.NetworkEmitter.Status.Cellular:
				return "wifi";
			case Device.NetworkEmitter.Status.Wifi:
				return "carrier";
			default:
				return "none";
		}
		*/
	},
	
	getLocation: function() {
		if(Device.LocationEmitter.getListenerCount() > 0) {
			var lastLocation = Device.LocationEmitter.getLastLocation();
			if(lastLocation && lastLocation.position) {
				return lastLocation.position.getX() + "," + lastLocation.position.getY();
			}
		}

		return null;
	},
	
	getApplicationId: function() {
		return this.applicationId;
	},
    
    setUserAgent: function(ua, fromCache) {
        if (this.userAgent == null && fromCache) {
            $mc.log("Loading user agent from cache: ", ua);
            this.userAgent = ua;
            return;
        } else if (this.userAgent == null ||
                ua != this.userAgent) {
            $mc.log("Saving new user agent to cache: ", ua);
            this.userAgent = ua;
            var kv = new Storage.KeyValue();
            kv.registerForKey("mobclix");
            kv.setItem("userAgent", ua, {}, function(param1, value, key) {
                kv.destroy();
            });
            return;
        }
        $mc.log("Ignoring matching user agent: ", ua);
    },
    
    getUserAgent: function(ua) {
        return this.userAgent;
    },
	
	destroy: function() {
		this.applicationId = null;
		if(this.sessionTracking) this.sessionTracking.destroy();
		this.sessionTracking = null;
		Device.NetworkEmitter.removeListener(this.proxyListener);
		this.emitter = null;
	}
});
