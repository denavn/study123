//
//  Mobclix.AdViewInternal.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../Core').Core;
var UI = require('../UI').UI;
var MMView = require('./Core/MMView').MMView;

var Config = require('./Core/Config').Config;
var $mc = require('./Core/Utils').Utils;
var Controller = require('./Core/Controller').Controller;
var HTTPRequest = require('./Core/HTTPRequest').HTTPRequest;
var MMArray = require('./Core/MMArray').MMArray;

var Browser = require('./Browser').Browser;

var Creative = require('./Creative').Creative;

var WebCreativeView = require('./CreativeView/Web').Web;
var FullScreenCreativeView = require('./CreativeView/FullScreen').FullScreen;

var Social = require('../Social').Social;

var FullScreenAdSize = exports.FullScreenAdSize = {
	width: 999,
	height: 999
};

var AdViewInternal = exports.AdViewInternal = MMView.subclass(
/** @lends Mobclix.AdViewInternal.prototype */
{
	__className: "Mobclix.AdViewInternal",

	/**
	 * Enumeration for error codes.
	 * @name Mobclix.AdView.Error
	 * @namespace
	 * @public
	 */
	Error: {
		/** 
		 * Unknown error occured
		 * @name Mobclix.AdView.Error#Unknown
		 */
		Unknown: 0,

		/** 
		 * There was an error on the Mobclix Server
		 * @name Mobclix.AdView.Error#ServerError
		 */
		ServerError: -500,
		
		/** 
		 * Ads are currently unavailable
		 * @name Mobclix.AdView.Error#ServerError
		 */
		Unavailable: -503,

		/** 
		 * Connection error occured
		 * @name Mobclix.AdView.Error#Connection
		 */
		Connection: -7777777,

		/** 
		 * An ad was requested without calling {@link Mobclix#startWithApplicationId}
		 * @name Mobclix.AdView.Error#NotStarted
		 */
		NotStarted: -8888888,
		
		/** 
		 * The requested unit side has been remotely disabled
		 * @name Mobclix.AdView.Error#Disabled
		 */
		Disabled: -9999999
	},
	
	_listener: null,
	_ordinalNumber: 0,
	_inTestMode: false,
	_size: {
		width: 320,
		height: 50
	},
	
	_shouldGetAdAfterConfig: false,
	_autoDisplayNextAdRequest: false,
	_hasPrefetchedAd: false,
	_wasPaused: false,
	_pausedSelf: false,
	_isLoading: false,
	_refreshTimeout: null,
	_shouldAutoplay: false,
	_lastAutoplayTime: 0,
	_hasFinishedStarting: false,
	_shouldGetAdAfterFinishedStarting: false,
	_originOfRegistration: null,
    _distributionName: null,
    
	/**
	 * @class AdViewInternal 
	 * @constructs The default constructor. 
	 * @param $super This parameter is stripped out during execution. Do not supply it.
	 * @private
	 */
	initialize: function($super) {
		$super();
		var self = this;
        
        this._setAdSpace();
        
		this.setFrame([0, 0, $mc.dip(this._size.width), $mc.dip(this._size.height)]);
		this._listener = new Core.MessageListener();
		Config.addListener(this._listener, function() { self._configUpdated(); });
		Controller.addListener(this._listener, function() { self._finishStarting(); });
		var creatives = new MMArray();
		this.currentCreatives = creatives;
		creatives.release();
		
		if(Controller.hasBeenStarted()) {
			this._finishStarting();
		}
	},
	
    _setAdSpace: function() {
        var self = this;
        try {
            var session = Social.US.Session.getCurrentSession();
            var user = session.user();
            user.getOriginOfRegistration(function(error, originOfRegistration) {
                if(!originOfRegistration) {
                    var errorCode = error.errorCode;
                    var errorDesc = error.description;
                } else {
                    self._originOfRegistration = originOfRegistration.replace(/[aeiou_-]/g,"");
                }
            });
            
        } catch(e) {
            $mc.log("Error getting the OoR.", e);
        }
        try {
            var dist = Core.Capabilities.getDistributionName();
            this._distributionName = dist.replace(/[aeiou_-]/g,"");
        } catch(e) {
            $mc.log("Error getting the Distribution Name.", e);
        }
    },
    
	/**
	 * Called after {@link Mobclix.Config} is finished updating.
	 * @private
	 */
	_configUpdated: function() {
		$mc.log("config finished updating");
		if(this._shouldGetAdAfterConfig) {
			this._shouldGetAdAfterConfig = false;
			this.getAd();
		}
	},
	
	_finishStarting: function() {
		if(this._hasFinishedStarting) return;
		this._hasFinishedStarting = true;
	
		if(this._shouldGetAdAfterFinishedStarting) {
			this._shouldGetAdAfterFinishedStarting = false;
			this.getAd();
		}
	},
	
	_handleMobclixNotStarting: function() {
		if(this._hasFinishedStarting) return;
		this._shouldGetAdAfterFinishedStarting = false;

		this.failWithError(this.Error.NotStarted, "No application id found.  Please be sure to start Mobclix prior to requesting ads.");
	},
	
	// ====
	// Autorefreshing methods
	// ====
	
	/**
	 * Clears the refresh timeout
	 * @private
	 */
	clearRefreshTimeout: function() {
		if(this._refreshTimeout) {
			clearTimeout(this._refreshTimeout);
			this._refreshTimeout = null;
		}
	},
	
	/**
	 * Schedule the next get ad
	 * @private
	 */
	scheduleNextGetAd: function() {
		this._wasPaused = false;
		this._pausedSelf = false;
		var refreshTime = this._getRefreshTime();
		$mc.log("scheduleNextGetAd:", refreshTime);

		if(refreshTime > 0) {
			var self = this;
			this.clearRefreshTimeout();
			this._refreshTimeout = setTimeout(function() { $mc.log("Requesting ad!"); self.getAd(); }, refreshTime);
		}
	},
	
	/**
	 * Schedule the next get ad from an internal error
	 * This behaves identical to {@link Mobclix.AdViewInternal#scheduleNextGetAd} except it doesn't change internal state variables
	 * @private
	 */
	scheduleNextGetAdFromError: function() {
		$mc.log("scheduleNextGetAdFromError");
		var refreshTime = this._getRefreshTime();
		if(refreshTime > 0) {
			var self = this;
			this.clearRefreshTimeout();
			this._refreshTimeout = setTimeout(function() { self.getAd(); }, refreshTime);
		}
	},
	
	/**
	 * Cancel any scheduled get ads
	 * @private
	 */
	cancelScheduledGetAd: function() {
		$mc.log("cancelScheduledGetAd");
		this._wasPaused = true;
		this._pausedSelf = false;
		clearTimeout(this._refreshTimeout);
	},

	/**
	 * Returns the refresh time in milliseconds
	 * @private
	 */
	_getRefreshTime: function() {
		var refreshTime = 0;
		
		try {
			refreshTime = parseInt(this.refreshTime, 10);
		} catch(e) {
			refreshTime = 0;
		}

		if(refreshTime == 0 || isNaN(refreshTime)) {
			return Config.refreshInteveralForAdUnit(this._size) * 1000;
		} else {
			return refreshTime * 1000;
		}
	},
	
	/**
	 * Determines whether next ad should be scheduled
	 * @private
	 */
	shouldScheduleGetAd: function() {
        if (this._size.width == 999)
            return false;
		return !this._wasPaused || this._pausedSelf;
	},

	// ====
	// Request Lifecycle
	// ====

	/**
	 * Requests a new ad from the server
	 * If ad refreshes are paused, this will also call resumeAdAutoRefresh
	 *
	 * This should only be called when you want to manually refresh an ad.
	 * @private
	 */
	getAd: function() {
		this._getAd(null, true);
	},
	
	/**
	 * Request an ad to be displayed in the future
	 * A subsequent call to {@link Mobclix.AdViewInternal#displayAd} must be called when the ad is
	 * displayed to fire off any events that need to be triggered when displayed.
	 * @private
	 */
	prefetchAd: function() {
		if(this._hasPrefetchedAd) return;
		
		this.cancelScheduledGetAd();
		this._wasPaused = false;
		this._getAd(null, false);
	},
	
	/**
	 * Internal called from other methods such as {@link #getAd} and {@link #prefetchAd}
	 * 
	 * Requests an ad from the servers (if possible)
	 * @param	{object}	params	Additional parameters to pass back to the server, this must be a single dimensional key-value object
	 * @param 	{bool}		shouldAutoDisplay	Flag to indicate whether or not this request should display itself when it's finished
	 * @private
	 */
	_getAd: function(params, shouldAutoDisplay) {
		var self = this;
		
		// If we have an ad prefetched, we should display it, not get another ad
		if(this.hasPrefetchedAd) {
			this.displayAd();
			return;
		}

		// Set autodisplay toggle
		this._autoDisplayNextAdRequest = shouldAutoDisplay;
		
		// We can't request ads until Mobclix has finished starting
		if(!this._hasFinishedStarting) {
			$mc.log("Mobclix hasn't been started yet..");
			this._shouldGetAdAfterFinishedStarting = true;
			setTimeout(function() {
				self._handleMobclixNotStarting();
			}, 10000);
			return;
		}

		// If config is updating, we wait
		if(Config.isUpdating()) {
			$mc.log("RC Updating blocked adview..");
			this._shouldGetAdAfterConfig = true;
			return;
		}
		
		// If we're already waiting, we wait
		if(this._isLoading) {
			this.scheduleNextGetAdFromError();
			return;
		}
		
		// If we've already taken over the screen, we wait
		if(Controller.inModal) {
			this.scheduleNextGetAdFromError();
			return;
		}

		// If we're disabled, we don't load
		if(!Config.isAdUnitEnabled(this._size)) {
			$mc.log("Ad unit is not enabled..");
			this.failWithError(this.Error.Disabled, "This ad unit size has been remotely disabled in the developer dashboard.");
			return;
		}
		
		// Build parameters
		params = params || {};
		params = typeof params == 'object' ? params : {};

		// Determine autoplay
		this._shouldAutoplay = Config.isAutoPlayEnabled(this._size);
		if(typeof this.canAutoplay == 'function') {
			this._shouldAutoplay = this.canAutoplay(this) ? true : false;
		}
		
		// Determine RMRUI
		var richMediaRequiresUserInteraction = Config.richMediaRequiresUserInteraction(this._size);
		if(typeof this.richMediaRequiresUserInteraction == 'function') {
			richMediaRequiresUserInteraction = this.richMediaRequiresUserInteraction(this) ? true : false;
		}

		// Set ordinal
		var ordinalNumber;
		if(this._size == FullScreenAdSize) {
			ordinalNumber = __fullscreenOrdinalNumber++;
		} else {
			ordinalNumber = this._ordinalNumber++;
		}
		
		// Cancel any scheduled ads
		var wasWasPaused = this._wasPaused;
		this.cancelScheduledGetAd();

		if(!wasWasPaused && this._getRefreshTime() > 0) {
			// cancelScheduledGetAd sets wasPaused to TRUE and pausedSelf to FALSE
			this._pausedSelf = true;
		}

		// ---------------------------
		// Ad Feed ID Parameters
		// ---------------------------

		// Application ID
		params.i = Controller.getApplicationId();

		// Platform Name
		params.p = Controller.isAndroid() ? 'android' : (Controller.isIPad() ? 'ipad' : 'iphone');

		// Unit Size
		if(this._size.width == 999) {
			params.s = "fullscreen";
		} else {
			params.s = this._size.width + "x" + this._size.height;
		}

		// ---------------------------
		// Ad View State ID Parameters
		// ---------------------------

		// Should Autoplay
		params.ap = this._shouldAutoplay;

		// Rich Media requires user interaction
		params.rm = richMediaRequiresUserInteraction;

		// Ordinal Number
		params.o = ordinalNumber;

		// Ad Space
		var adSpace = "";
        if (this._originOfRegistration != null) {
            adSpace += this._originOfRegistration;
        }
        
        if (this._distributionName != null) {
            adSpace += this._distributionName;
        }
        
        this.adSpaceName = adSpace;
		if(adSpace && adSpace.length > 0) {
			if(adSpace.length > 32) {
				adSpace = adSpace.substr(0,32);
			}

			params.as = adSpace;
		}

		// Test Mode (Only if enabled)
		if(this._inTestMode) params.t = 1;

		// ---------------------------
		// Hardware Environment
		// ---------------------------

		// UDID
		params.u = Core.Capabilities.getUniqueId();

		// Connection Type
		params.ct = Controller.getNetworkState();

		// Device Model
		params.dm = Core.Capabilities.getDeviceName();

		// Hardware Device Model
		params.hwdm = Core.Capabilities.getPlatformHW();

        // User Agent
        if (Controller.getUserAgent() != null)
            params.ua = Controller.getUserAgent();

		// ---------------------------
		// Software Environment
		// ---------------------------	

		// Application Version
		// params.av = "1.0"; // TODO

		// SDK Version
		params.v = Config.getVersion();

		// OS Version
		params.sv = Core.Capabilities.getPlatformOSVersion();
		
		// Runtime
		params.rt = 'mobage';
		params.rtv = Core.Capabilities.getSDKVersion();
		

		// ---------------------------
		// Location
		// ---------------------------

		var location = null;
		if((location = Controller.getLocation())) {
			queryString.ll = location;
			location = null;
		}

		// ---------------------------
		// Additional Parameters
		// These would be passed in from a previous request that failed
		// ---------------------------

		if(typeof this.requestKeywords == 'function') {
			params.k = this.requestKeywords(this);
			if(!params.k) delete(params.k);
			else params.k = params.k.toString();
		}
		
		if(typeof this.requestQuery == 'function') {
			params.q = this.requestQuery(this);
			if(!params.q) delete(params.q);
			else params.q = params.q.toString();
		}
		
		// Set the request ad url if the delegate responds
		if(typeof this.requestAdUrl == 'function') {
			params.adurl = this.requestAdUrl(this);
			if(!params.adurl) delete(params.adurl);
			else params.adurl = params.adurl.toString();
		}

		var request = new HTTPRequest;
		request.start({
			url: Config.getAdvertisingURL(),
			data: params,
			type: "get",
            userAgent: Controller.getUserAgent(),
			success: function(request, response) {
				if(request.getStatusCode() == 200) {
					self.adRequestFinished(request, response);
				} else {
					self.requestFailed(request, null);
				}
			},
			error: function(request, error) {
				self.requestFailed(request, error);
			}
		});
		request.release();
	},
	
	/**
	 * Handles an ad request that suceeded with a status code of 200
	 * Attempts to parse the response for creatives and load an ad,
	 * If failed to load, it will {@link Mobclix.AdViewInternal#requestFailed}
	 * 
	 * @see Mobclix.AdViewInternal#requestFailed
	 * @see Mobclix.AdViewInternal#loadAd
	 * @private
	 */
	adRequestFinished: function(request, response) {
		this._isLoading = false;
		
		$mc.log("Request finished, response: " + request.getResponseText());

		var newCreatives = new MMArray();
		try {
			for(var index in response.creatives) {
				try {
					var creative = Creative.Create({creative: response.creatives[index]});
					newCreatives.push(creative);
					creative.release();
				} catch(e2) {
					$mc.log("Error while building creative model: ", e2);
				}
			}
		} catch(e) {
			$mc.log("Error while building creative models: ", e);
		}
		
		$mc.log("setting currentcreatives");
		
		this.currentCreatives = newCreatives;

		$mc.log("release newcreatives");
		newCreatives.release();

		if(!this.currentCreatives || this.currentCreatives.length < 1) {
			this.requestFailed(request, "Failed to parse creative");
		} else {
			this.loadCreative(this.currentCreatives.get(0));
		}
	},
	
	/**
	 * Handles a failed ad request
	 * @see Mobclix.AdViewInternal#failWithError
	 * @private
	 */
	requestFailed: function(request, error) {
		$mc.log("Request failed -- error: ", error, "status code: ", request.request.status);

		if(request.request.status == 500) {
			this.failWithError(this.Error.Server, error);
		} else if(request.request.status == 0) {
			this.failWithError(this.Error.Connection, error);
		} else {
			this.failWithError(this.Error.Unknown, error);
		}
        
        if (this._size.width == 999) {
            this._canRequestNextAd = true;
        }
	},
	
	// ====
	// Creative Display Lifecycle
	// ====
	
	/**
	 * Loads the provided creative into the related CreativeView Type
	 * @param	{Object}	creative	Creative model to be loaded, must be an instance of {@link Mobclix.Creative.Base}
	 * @private
	 */
	loadCreative: function(creative) {
		$mc.log("Loading creative: " + creative);
		this.currentCreative = creative;
		
        if(this._size.width == 999) {
            $mc.log("Creating FullScreen Creative View");
            var creativeView = new FullScreenCreativeView();
            this.nextCreativeView = creativeView;
            creativeView.release();
            
            this.nextCreativeView.adView = this;
            this.nextCreativeView.loadWithCreative(this.currentCreative);
        } else {
            var creativeView = new WebCreativeView();
            this.nextCreativeView = creativeView;
            creativeView.release();
            
            var x = 0;
            
            var frame = this.getBounds();
            frame[0] = frame[2] * -2;
            frame[1] = frame[3] * -2;
            
            this.nextCreativeView.setFrame(frame);
            this.nextCreativeView.adView = this;
            this.addChild(this.nextCreativeView);
            this.nextCreativeView.loadWithCreative(this.currentCreative);
        }
	},

	/**
	 * Callback for instances of {@link Mobclix.Creative.Base} to indicate they're finished loading and ready to be displayed
	 * 
	 * @param	{object}	creativeView	Instance of {@link Mobclix.CreativeView.Base}
	 * @param	{object}	creative		Instance of {@link Mobclix.Creative.Base}
	 * @return	{bool}	If false, the creativeView/creative is no longer the current creative being loaded and should immediately halt it's lifecycle
	 * @private
	 */
	creativeViewFinishedLoading: function(creativeView, creative) {
		if(creative != this.currentCreative) {
			$mc.log("Creative load finished, but wasn't current creative: ", creative);
			creativeView.removeFromParent();
			return false;
		}

		// Notify the delegate
		this._wasPaused = false;
		if(typeof this.onFinishLoad == 'function') {
			this.onFinishLoad(this);
		}

		// Auto display ad
		if(this._autoDisplayNextAdRequest)
            this.displayAd();
        else
			this._hasPrefetchedAd = true;
		
		// Schedule the next ad
		if(this.shouldScheduleGetAd()) this.scheduleNextGetAd();

		return true;
	},

	/**
	 * Callback for instances of {@link Mobclix.Creative.Base} to indicate they've failed to load
	 * 
	 * @param	{object}	creativeView	Instance of {@link Mobclix.CreativeView.Base}
	 * @param	{object}	creative		Instance of {@link Mobclix.Creative.Base}
	 * @param	{object}	error	Underlying error
	 * @return	{boolean}	Flag indicating whether or not the provided creativeView/creative is still the current creative being loaded
	 * @private
	 */
	creativeViewFailedToLoad: function(creativeView, creative, error) {
        $mc.log("creativeViewFailedToLoad: ", creativeView);
        $mc.log("creativeViewFailedToLoad: ", creative);
        $mc.log("creativeViewFailedToLoad: ", error);
		var returnValue = true;
		
		if(creative != this.currentCreative) {
			$mc.log("Creative load failed, but wasn't current creative: ", creative);
			returnValue = false;
		} else {
			this.nextCreativeView = null;

			var creativeIndex = this.currentCreatives.indexOf(creative);

			if(creativeIndex + 1 < this.currentCreatives.length) {
				this.loadCreative(this.currentCreatives.get(creativeIndex + 1));
				returnValue = false;
			} else {
				if(creative.requestParameters && creative.requestParameters.length > 0) {
					this._getAd(creative.requestParameters, this._autoDisplayNextAdRequest);
					returnValue = false;
				} else {
					this.failWithError(this.Error.Unknown, error);
					returnValue = true;
				}
			}
		}

		creativeView.removeFromParent(); // We remove at the end, because it deallocs on remove
		return returnValue;
	},
	
	/**
	 * Displays the next creative view and triggers any actions/events asssociated with it
	 * @private
	 */
	displayAd: function() {
        if (this.nextCreativeView == null)
            return;
    
		var creativeView = this.nextCreativeView;
		var self = this;
        
        // Remove any old creative views, but leave current creative views
        $mc.each(this.getChildren(), function(view) {
            if(view == creativeView) return;
            $mc.log("Removing: " + view);
            self.queueReusableCreativeView(view);
            view.removeFromParent();
        });
    
        // Add new creativeview if it's not already in the stack.
        // This shouldn't ever happen, but we better be sure.
        if(!creativeView.getParent() || creativeView.getParent() != this) {
            this.addChild(creativeView);
        }
            

        if (this._size.width == 999) {
            creativeView.display();
            
            if(typeof this.onPresentAd == 'function') {
                this.onPresentAd(this);
            }
                
            // Update current reference
            this.currentCreativeView = creativeView;
        } else {
            
            // Place a temporary view over the view, or else the first ad on
            // Android won't load.
            if (Controller.isAndroid()) {
                var tempView = new MMView();
                this.addChild(tempView);
                tempView.removeFromParent();
            }

            // Bring view on screen
            creativeView.setFrame(this.getBounds());

            // Update current reference
            this.currentCreativeView = creativeView;

            // Autoplay if asked to
            var action = this.currentCreative.getAction();
            if(action && action.shouldAutoplay() && this._shouldAutoplay) {
                this._lastAutoplayTime = new Date();
                this.openActionURL(self.currentCreative, action.getUrl());
            }
        
        }

        // Notify tracking URLs
        try { this.currentCreative.getEvents().triggerEvent("show"); } catch(e) { }
        this.currentCreativeView.creativeHasBeenDisplayed();
            
		this.nextCreativeView = null;
		this._hasPrefetchedAd = false;
		this._shouldAutoplay = false;
	},
	
	/**
	 * Attempts to queue a resueable creative view
	 * @param	{object}	creativeView	Instance of {@link Mobclix.CreativeView.Base}
	 * @private
	 */
	queueReusableCreativeView: function(creativeView) {
		// TODO
	},
	
	/**
	 * Handles errors when loading an ad and notifies any listeners
	 * @private
	 */
	failWithError: function(code, error) {
		this._isLoading = false;

		if(typeof this.onFailedToLoad == 'function') {
			this.onFailedToLoad(this, code, error);
		}

		if(this.shouldScheduleGetAd()) this.scheduleNextGetAd();
	},
	
	// ====
	// Actions
	// ====

	/**
	 * Determines whether or not a creative can touch through
	 * 
	 * @param	{object}	creative		Instance of {@link Mobclix.Creative.Base}
	 * 
	 * @return	{boolean}	Whether or not the creative can touch through
	 * @private
	 */
	shouldTouchThrough: function(creative) {
		return !Controller.inModal;
	},

	/**
	 * Tells the ad view a creative will touch through
	 * Any touch through events will be fired at this point
	 * 
	 * @param	{object}	creative		Instance of {@link Mobclix.Creative.Base}
	 * @private
	 */
	willTouchThrough: function(creative) {
		Controller.inModal = true;
		this.cancelScheduledGetAd();

		if(typeof this.onWillTouchThrough == 'function') {
			this.onWillTouchThrough(this);
		}
	},
	
	/**
	 * Tells the ad view a creative did touch through
	 * Any did touch through events will be fired at this point
	 * 
	 * @param	{object}	creative		Instance of {@link Mobclix.Creative.Base}
	 * @private
	 */
	didTouchThrough: function(creative) {
		Controller.inModal = false;

		if(typeof this.onDidTouchThrough == 'function') {
			this.onDidTouchThrough(this);
		}

		if(this.shouldScheduleGetAd()) this.scheduleNextGetAd();
	},
	
	/**
	 * Convenience method to handle opening a full screen action URL.
	 * This method will automatically handle any events
	 * that need to be triggered when handling full screen takeovers
	 * 
	 * @param	{object}	creative		Instance of {@link Mobclix.Creative.Base}
	 * @param	{string}	url		Action URL to open in a full screen browser
	 * 
	 * @return	{boolean}	Whether or not the action url was able to open
	 * @private
	 */
	openActionURL: function(creative, url) {
		if(!this.shouldTouchThrough()) {
			$mc.log("Already in modal, can't open url");
			return false;
		}

		var self = this;
		
		this.willTouchThrough();
		$mc.log("Opening action URL:", url);
		
		var browserType = null;
		
		try {
			browserType = creative.getBrowserType();
		} catch (e) {
			browserType = Browser.Type.Toolbar;
		}
		
		var browser = new Browser(browserType);
		browser.onDidFinish = function() {
			self.didTouchThrough(creative);
		};
		
		browser.loadUrl(url);
		browser.presentViewController(true);
		browser.release();
		browser = null;
	},
	
	// ====
	// Memory Management
	// ====
	
	/** @private */
	destroy: function($super) {
		Config.removeListener(this._listener);
		this._listener.destroy();
		
		this.currentCreatives = null;
		this.currentCreative = null;
		this.nextCreativeView = null;
		this.adSpaceName = null;
		this._size = null;
		
		$mc.log(" ---- ADVIEW DESTROY ---- ");
		$super();
	}
});

// Properties
(function() {
	AdViewInternal.addProperty('currentCreatives', true);
	AdViewInternal.addProperty('currentCreative', true);
	AdViewInternal.addProperty('nextCreativeView', true);
	AdViewInternal.addProperty('adSpaceName', false);
	AdViewInternal.addProperty('requestAdUrl', false);
	AdViewInternal.addProperty('refreshTime', false, 0);
})();

// MobclixAdView Events
(function() {
	/**
	 * @name Mobclix.AdView#setOnFinishLoad
	 * @description Set a function to call when the <code>finishLoad</code> event occurs.
	 * @param {Function} eventCallback The new callback function, the signature for the callback is equivalent
	 * to:<br /><br />
	 * <pre>function(adView)</pre><br />
	 * The <code>adView</code> parameter is the instance of the MobclixAdView that loaded.
	 * <br /><br /><b>Note:</b> This event is disabled if the value of this parameter is not a function.<br />
	 * @see Mobclix.AdView#getOnFinishLoad
	 * @function
	 */
	/**
	 * @name Mobclix.AdView#getOnFinishLoad
	 * @description Retrieve the function to call when the <code>finishLoad</code> event occurs.
	 * @return {Function} The current callback function.
	 * @see Mobclix.AdView#setOnFinishLoad
	 * @function
	 */
    /**
	 * @name Mobclix.FullScreenAdView#setOnFinishLoad
	 * @description Set a function to call when the <code>finishLoad</code> event occurs.
	 * @param {Function} eventCallback The new callback function, the signature for the callback is equivalent
	 * to:<br /><br />
	 * <pre>function(adView)</pre><br />
	 * The <code>adView</code> parameter is the instance of the MobclixAdView that loaded.
	 * <br /><br /><b>Note:</b> This event is disabled if the value of this parameter is not a function.<br />
	 * @see Mobclix.FullScreenAdView#getOnFinishLoad
	 * @function
	 */
	/**
	 * @name Mobclix.FullScreenAdView#getOnFinishLoad
	 * @description Retrieve the function to call when the <code>finishLoad</code> event occurs.
	 * @return {Function} The current callback function.
	 * @see Mobclix.FullScreenAdView#setOnFinishLoad
	 * @function
	 */
	AdViewInternal.addProperty('onFinishLoad', false);

	/**
	 * @name Mobclix.AdView#setOnFailedToLoad
	 * @description Set a function to call when the <code>failedToLoad</code> event occurs.
	 * @param {Function} eventCallback The new callback function, the signature for the callback is equivalent
	 * to:<br /><br />
	 * <pre>function(adView, code, error)</pre><br />
	 * The <code>adView</code> parameter is the instance of the MobclixAdView that loaded.
	 * The <code>code</code> parameter is the error code matching {@link Mobclix.AdView#Error}.
	 * The <code>error</code> parameter is a string describing the error.
	 * <br /><br /><b>Note:</b> This event is disabled if the value of this parameter is not a function.<br />
	 * @see Mobclix.AdView#getOnFailedToLoad
	 * @function
	 */

	/**
	 * @name Mobclix.AdView#getOnFailedToLoad
	 * @description Retrieve the function to call when the <code>failedToLoad</code> event occurs.
	 * @return {Function} The current callback function.
	 * @see Mobclix.AdView#setOnFailedToLoad
	 * @function
	 */
    
    	/**
	 * @name Mobclix.FullScreenAdView#setOnFailedToLoad
	 * @description Set a function to call when the <code>failedToLoad</code> event occurs.
	 * @param {Function} eventCallback The new callback function, the signature for the callback is equivalent
	 * to:<br /><br />
	 * <pre>function(adView, code, error)</pre><br />
	 * The <code>adView</code> parameter is the instance of the MobclixAdView that loaded.
	 * The <code>code</code> parameter is the error code matching {@link Mobclix.AdView#Error}.
	 * The <code>error</code> parameter is a string describing the error.
	 * <br /><br /><b>Note:</b> This event is disabled if the value of this parameter is not a function.<br />
	 * @see Mobclix.FullScreenAdView#getOnFailedToLoad
	 * @function
	 */

	/**
	 * @name Mobclix.FullScreenAdView#getOnFailedToLoad
	 * @description Retrieve the function to call when the <code>failedToLoad</code> event occurs.
	 * @return {Function} The current callback function.
	 * @see Mobclix.FullScreenAdView#setOnFailedToLoad
	 * @function
	 */
	AdViewInternal.addProperty('onFailedToLoad', false);

	/**
	 * @name Mobclix.AdView#setOnCanAutoplay
	 * @description Set a function for the ad view to call to determine if an ad can autoplay.
	 * This will override the default setting used on the developer dashboard.
	 * <br /><br />
	 * Autoplay ads are similar to interstitial ads and will automatically
	 * open a website, video, or any other kind of modal action supported by the SDK.
	 * <br /><br />
	 * If this method isn't implemented, the settings provided on the Dashboard are used.
	 * @param {Function} callback The new callback function, the signature for the callback is equivalent
	 * to:<br /><br />
	 * <pre>function(adView)</pre><br />
	 * The <code>adView</code> parameter is the instance of the MobclixAdView that loaded.
	 * This function most return boolean value indicating whether or not ads can autoplay.
	 * <br /><br /><b>Note:</b> This event is disabled if the value of this parameter is not a function.<br />
	 * @see Mobclix.AdView#getOnCanAutoplay
	 * @function
	 */
	/**
	 * @name Mobclix.AdView#getOnCanAutoplay
	 * @description Retrieve the function to call when the ad view needs to determine if it can autoplay ads.
	 * @return {Function} The current callback function.
	 * @see Mobclix.AdView#setOnCanAutoplay
	 * @function
	 */
	AdViewInternal.addProperty('onCanAutoplay', false);


	/**
	 * @name Mobclix.AdView#setOnWillTouchThrough
	 * @description Set a function for the ad view to call when the user touches through.  When this happens, the ad view will take over the screen experience, so in the case of a game it should be paused.
	 * @param {Function} callback The new callback function, the signature for the callback is equivalent
	 * to:<br /><br />
	 * <pre>function(adView)</pre><br />
	 * The <code>adView</code> parameter is the instance of the MobclixAdView that loaded.
	 * This function most return boolean value indicating whether or not ads can autoplay.
	 * <br /><br /><b>Note:</b> This event is disabled if the value of this parameter is not a function.<br />
	 * @see Mobclix.AdView#getOnWillTouchThrough
	 * @function
	 */
	/**
	 * @name Mobclix.AdView#getOnWillTouchThrough
	 * @description Retrieve the function to call when the user touches through.
	 * @return {Function} The current callback function.
	 * @see Mobclix.AdView#setOnWillTouchThrough
	 * @function
	 */
	AdViewInternal.addProperty('onWillTouchThrough', false);

	/**
	 * @name Mobclix.AdView#setOnDidTouchThrough
	 * @description Set a function for the ad view to call when the user touch through is finished.  When this happens, the ad view is no longer taking over the screen experience, so in the case of a game, game play can be resumed.
	 * @param {Function} callback The new callback function, the signature for the callback is equivalent
	 * to:<br /><br />
	 * <pre>function(adView)</pre><br />
	 * The <code>adView</code> parameter is the instance of the MobclixAdView that loaded.
	 * This function most return boolean value indicating whether or not ads can autoplay.
	 * <br /><br /><b>Note:</b> This event is disabled if the value of this parameter is not a function.<br />
	 * @see Mobclix.AdView#getOnDidTouchThrough
	 * @function
	 */
	/**
	 * @name Mobclix.AdView#getOnDidTouchThrough
	 * @description Retrieve the function to call when the user touches through.
	 * @return {Function} The current callback function.
	 * @see Mobclix.AdView#setOnDidTouchThrough
	 * @function
	 */
	AdViewInternal.addProperty('onDidTouchThrough', false);

	/**
	 * @name Mobclix.FullScreenAdView#setOnPresentAd
	 * @description Set a function to call when the <code>presentAd</code> event occurs.
	 * @param {Function} eventCallback The new callback function, the signature for the callback is equivalent
	 * to:<br /><br />
	 * <pre>function(adView)</pre><br />
	 * The <code>adView</code> parameter is the instance of the MobclixAdView that loaded.
	 * <br /><br /><b>Note:</b> This event is disabled if the value of this parameter is not a function.<br />
	 * @see Mobclix.FullScreenAdView#getOnPresentAd
	 * @function
	 */

	/**
	 * @name Mobclix.FullScreenAdView#getOnPresentAd
	 * @description Retrieve the function to call when the <code>presentAd</code> event occurs.
	 * @return {Function} The current callback function.
	 * @see Mobclix.FullScreenAdView#setOnPresentAd
	 * @function
	 */
	AdViewInternal.addProperty('onPresentAd', false);
    
    /**
	 * @name Mobclix.FullScreenAdView#setOnDismissAd
	 * @description Set a function to call when the <code>dismissAd</code> event occurs.
	 * @param {Function} eventCallback The new callback function, the signature for the callback is equivalent
	 * to:<br /><br />
	 * <pre>function(adView)</pre><br />
	 * The <code>adView</code> parameter is the instance of the MobclixAdView that loaded.
	 * <br /><br /><b>Note:</b> This event is disabled if the value of this parameter is not a function.<br />
	 * @see Mobclix.FullScreenAdView#getOnDismissAd
	 * @function
	 */

	/**
	 * @name Mobclix.FullScreenAdView#getOnDismissAd
	 * @description Retrieve the function to call when the <code>dismissAd</code> event occurs.
	 * @return {Function} The current callback function.
	 * @see Mobclix.FullScreenAdView#setOnDismissAd
	 * @function
	 */
	AdViewInternal.addProperty('onDismissAd', false);

	/**
	 * @name Mobclix.AdView#setRichMediaRequiresUserInteraction
	 * @description Set a function for the ad view to call when determining if rich media requires user interaction:<br />
	 * Rich Media features include access to the following:<br />
	 * <ul>
	 *	<li>LED Flash</li>
	 *	<li>Vibrate</li>
	 *	<li>Sound</li>
	 * </ul>
	 * To allow these features to work automatically, this callback should return false.
	 * <br /></br />
	 * Applications that vibrate or play sound, should return true.
	 * <br /></br />
	 * If this callback isn't implemented, the settings provided on the Dashboard are used.
	 * @param {Function} callback The new callback function, the signature for the callback is equivalent
	 * to:<br /><br />
	 * <pre>function(adView)</pre><br />
	 * The <code>adView</code> parameter is the instance of the MobclixAdView that loaded.
	 * This function most return boolean value indicating whether or not ads can autoplay.
	 * @see Mobclix.AdView#getRichMediaRequiresUserInteraction
	 * @function
	 */
	/**
	 * @name Mobclix.AdView#getRichMediaRequiresUserInteraction
	 * @description Retrieve the function to call when determining if rich media requires user interaction.
	 * @return {Function} The current callback function.
	 * @see Mobclix.AdView#setRichMediaRequiresUserInteraction
	 * @function
	 */
	AdViewInternal.addProperty('richMediaRequiresUserInteraction', false);
	
	/**
	 * @name Mobclix.AdView#setRequestKeywords
	 * @description Set a function for the ad view to call to get the request keywords.
	 * @param {Function} callback The new callback function, the signature for the callback is equivalent
	 * to:<br /><br />
	 * <pre>function(adView)</pre><br />
	 * The <code>adView</code> parameter is the instance of the MobclixAdView that loaded.
	 * This function most return boolean value indicating whether or not ads can autoplay.
	 * @see Mobclix.AdView#getRequestKeywords
	 * @function
	 */
	/**
	 * @name Mobclix.AdView#getRequestKeywords
	 * @description Retrieve the function to call to get the request keywords.
	 * @return {Function} The current callback function.
	 * @see Mobclix.AdView#setRequestKeywords
	 * @function
	 */
	AdViewInternal.addProperty('requestKeywords', false);
	
	/**
	 * @name Mobclix.AdView#setRequestQuery
	 * @description Set a function for the ad view to call to get the request query.
	 * @param {Function} callback The new callback function, the signature for the callback is equivalent
	 * to:<br /><br />
	 * <pre>function(adView)</pre><br />
	 * The <code>adView</code> parameter is the instance of the MobclixAdView that loaded.
	 * This function most return boolean value indicating whether or not ads can autoplay.
	 * @see Mobclix.AdView#getRequestQuery
	 * @function
	 */
	/**
	 * @name Mobclix.AdView#getRequestQuery
	 * @description Retrieve the function to call to get the request query.
	 * @return {Function} The current callback function.
	 * @see Mobclix.AdView#setRequestQuery
	 * @function
	 */
	AdViewInternal.addProperty('requestQuery', false);
})();

