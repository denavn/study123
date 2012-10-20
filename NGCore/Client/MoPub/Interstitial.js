var Base = require('./Core/Base').Base;
var InterstitialInternal = require('./Core/InterstitialInternal').InterstitialInternal;
var UI = {
	Window: require('../UI/Window').Window
};

var Interstitial = exports.Interstitial = Base.subclass(
/** @lends MoPub.Interstitial.prototype */
{
	classname: 'Interstitial',
	
	/**
	* @class
	* The <code>Interstitial</code> class constructs objects to house MoPub 
	* interstitial ads and provide callbacks when ad events occur. For banner ads, use the {@link 
	* MoPub.BannerView} class.
	* @constructs The default constructor.
	* @param {$super} $super This parameter is a reference to the base class implementation and is 
	* stripped out during execution. Do not supply it.
	* @augments UI.View
	* @since 1.4.1
	*/
	initialize: function($super) {
		$super({
			width: UI.Window.getWidth(),
			height: UI.Window.getHeight()
		});
		
		this.internal = new InterstitialInternal(this);
	},
	
	/**
	* Load an interstitial ad without showing it. Once loaded, the interstitial can be presented
	* with <code>showAd()</code>.
	* @see MoPub.Interstitial#showAd
	* @see MoPub.Interstitial#isReady
	* @since 1.4.1
	*/
	loadAd: function() {
		this.internal.fetchAd();
	},
	
	/**
	* Show the interstitial ad. The ad must have already been loaded by <code>loadAd()</code>; 
	* otherwise, nothing will happen. The ad's loading status can be determined by calling <code>
	* isReady()</code>.<br /><br />
	* If the application has any orientation listeners that trigger
	* <code>setInterfaceOrientation()</code>, these listeners should be disabled prior to calling
	* <code>showAd()</code>. This allows the interstitial ad to manage its own orientation without
	* having to account for changes in the application's orientation. The <code>
	* setOnInterstitialDidDismiss</code> callback should then be used to reinstate the listeners
	* upon the ad's dismissal.<br /><br />
	* Additionally, if there are any MoPub <code>BannerView</code>s on-screen, their automatic refresh
	* should be paused until the interstitial has been dismissed. This ensures that the <code>
	* BannerView</code> does not load any new ads while it is covered by the interstitial.
	*
	* @example
	* // Before showing an interstitial, remove our orientation listener and pause banner refreshes.
	* if (interstitial.isReady()) {
	*   Device.OrientationEmitter.removeListener(this.myListener);
	*   bannerView.pauseRefresh();
	*   interstitial.showAd();
	* }
	* 
	* ...
	* 
	* // After dismissing the interstitial, reinstate the orientation listener and unpause banner 
	* // refreshes.
	* var self = this;
	* interstitial.setOnInterstitialDidDismiss(function() {
	*   Device.OrientationEmitter.addListener(self.myListener, self.myListenerFunction);
	*   bannerView.resumeRefresh();
	* });
	*
	* @see MoPub.Interstitial#loadAd
	* @see MoPub.Interstitial#isReady
	* @since 1.4.1
	*/
	showAd: function() {
		if (this.isReady()) {
			this.internal.presentViewController();
		}
	},
	
	/**
	* Retrieve the interstitial ad's loading status.
	* @ returns {Boolean} Returns <code>true</code> if the interstitial has been successfully loaded 
	* and is ready to be displayed. Returns <code>false</code> in all other cases.
	* @see MoPub.Interstitial#loadAd
	* @see MoPub.Interstitial#showAd
	* @since 1.4.1
	*/
	isReady: function() {
		return this.internal.isReady;
	},
	
	/** @private */
	isVisible: function() {
		return this.internal.isVisible();
	},
	
	/**
	* Set a function to call when the interstitial ad has been clicked.
	*
	* @example
	* interstitial.setOnInterstitialClicked(function() {
	*   console.log('interstitial: onInterstitialClicked');
	* });
	*
	* @param {Function} callback The function to call.
	* @see MoPub.Interstitial#getOnInterstitialClicked
	* @since 1.4.1
	*/
	setOnInterstitialClicked: function(callback) {
		this.internal.onInterstitialClicked = callback;
	},
	
	/**
	* Retrieve the function to call when the interstitial ad has been clicked.
	* @returns {Function} The current callback function.
	* @see MoPub.Interstitial#setOnInterstitialClicked
	* @since 1.4.1
	*/
	getOnInterstitialClicked: function() {
		return this.internal.onInterstitialClicked;
	},
	
	/**
	* Set a function to call when the interstitial ad has successfully loaded.
	*
	* @example
	* interstitial.setOnInterstitialSuccess(function() {
	*   console.log('interstitial: onInterstitialSuccess');
	* });
	*
	* @param {Function} callback The function to call.
	* @see MoPub.Interstitial#getOnInterstitialSuccess
	* @since 1.4.1
	*/
	setOnInterstitialSuccess: function(callback) {
		this.internal.onInterstitialSuccess = callback;
	},
	
	/**
	* Retrieve the function to call when the interstitial ad has successfully loaded.
	* @returns {Function} The current callback function.
	* @see MoPub.Interstitial#setOnInterstitialSuccess
	* @since 1.4.1
	*/
	getOnInterstitialSuccess: function() {
		return this.internal.onInterstitialSuccess;
	},
	
	/**
	* Set a function to call when the interstitial ad has failed to load.
	*
	* @example
	* interstitial.setOnInterstitialFailure(function() {
	*   console.log('interstitial: onInterstitialFailure');
	* });
	*
	* @param {Function} callback The function to call.
	* @see MoPub.Interstitial#getOnInterstitialFailure
	* @since 1.4.1
	*/
	setOnInterstitialFailure: function(callback) {
		this.internal.onInterstitialFailure = callback;
	},
	
	/**
	* Retrieve the function to call when the interstitial ad has failed to load.
	* @returns {Function} The current callback function.
	* @see MoPub.Interstitial#setOnInterstitialFailure
	* @since 1.4.1
	*/
	getOnInterstitialFailure: function() {
		return this.internal.onInterstitialFailure;
	},
	
	/**
	* Set a function to call when the interstitial is about to be presented (thus taking over the
	* screen). This may be used to notify the application that it should pause its normal operations.
	*
	* @example
	* interstitial.setOnInterstitialWillPresent(function() {
	*   console.log('interstitial: onInterstitialWillPresent');
	* });
	*
	* @param {Function} callback The function to call.
	* @see MoPub.Interstitial#getOnInterstitialWillPresent
	* @since 1.4.1
	*/
	setOnInterstitialWillPresent: function(callback) {
		this.internal.onInterstitialWillPresent = callback;
	},
	
	/**
	* Retrieve the function to call when the interstitial is about to be presented (thus taking over 
	* the screen).
	* @returns {Function} The current callback function.
	* @see MoPub.Interstitial#setOnInterstitialWillPresent
	* @since 1.4.1
	*/
	getOnInterstitialWillPresent: function() {
		return this.internal.onInterstitialWillPresent;
	},
	
	/**
	* Set a function to call when the interstitial has been dismissed from the screen. This may be
	* used to notify the application that it should resume its normal operations.
	*
	* @example
	* interstitial.setOnInterstitialDidDismiss(function() {
	*   console.log('interstitial: onInterstitialDidDismiss');
	* });
	*
	* @param {Function} callback The function to call.
	* @see MoPub.Interstitial#getOnInterstitialDidDismiss
	* @since 1.4.1
	*/
	setOnInterstitialDidDismiss: function(callback) {
		this.internal.onInterstitialDidDismiss = callback;
	},

	/**
	* Retrieve the function to call when the interstitial has been dismissed from the screen.
	* @returns {Function} The current callback function.
	* @see MoPub.Interstitial#setOnInterstitialDidDismiss
	* @since 1.4.1
	*/
	getOnInterstitialDidDismiss: function() {
		return this.internal.onInterstitialDidDismiss;
	},
	
	/**
	* Destroy this instance and release resources on the backend.
	* @param {$super} $super This parameter is a reference to the base class implementation and is 
	* stripped out during execution. Do not supply it.
	* @since 1.4.1
	*/
	destroy: function($super) {
		this.internal.destroy();
		$super();
	}
	
	// Hardcode the following super methods for jsdoc
	
	// setKeywords
	/**
	* Set the targeting keywords that will be passed to the MoPub servers as part of an ad request. 
	* The keywords should be passed in as a comma-delimited string of key-value pairs.
	* @name MoPub.Interstitial#setKeywords
	* @function
	*
	* @example
	* interstitial.setKeywords('keyword1:value1,keyword2:value2');
	*
	* @param {String} keywords Comma-delimited string of key-value pairs.
	* @see MoPub.Interstitial#getKeywords
	*/
	
	// getKeywords
	/**
	* Retrieve the targeting keywords that will be passed to the MoPub servers as part of an ad 
	* request.
	* @name MoPub.Interstitial#getKeywords
	* @function
	* @returns {String} Comma-delimited string of key-value pairs.
	* @see MoPub.Interstitial#setKeywords
	*/
	
	// setLocation
	/**
	* Set a latitude/longitude location that will be passed to the MoPub servers as part of an ad 
	* request.
	* @name MoPub.Interstitial#setLocation
	* @function
	*
	* @example
	* interstitial.setLocation(new Core.Point(37.782929, -122.393281));
	*
	* @param {Core.Point} location Location, as a latitude/longitude point.
	* @see MoPub.Interstitial#getLocation
	*/
	
	// getLocation
	/**
	* Retrieve the previously-set latitude/longitude location that will be passed to the MoPub servers
	* as part of an ad request. If a location has not been set previously, this method will return
	* <code>null</code>.
	* @name MoPub.Interstitial#getLocation
	* @function
	* @returns {Core.Point} Location, as a latitude/longitude point.
	* @see MoPub.Interstitial#setLocation
	*/
	
	// setAdUnitId
	/**
	* Set the ad unit ID. This value can be found from the MoPub dashboard.
	* @name MoPub.Interstitial#setAdUnitId
	* @function
	*
	* @example
	* interstitial.setAdUnitId('agltb3B1Yi1pbmNyDAsSBFNpdGUYkaoMDA');
	*
	* @param {String} adUnitId MoPub ad unit ID for this ad.
	* @see MoPub.Interstitial#getAdUnitId
	*/
	
	// getAdUnitId
	/**
	* Retrieve the ad unit ID.
	* @name MoPub.Interstitial#getAdUnitId
	* @function
	* @returns {String} MoPub ad unit ID for this ad.
	* @see MoPub.Interstitial#setAdUnitId
	*/
});
