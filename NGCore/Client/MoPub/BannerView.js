var BannerViewInternal = require('./Core/BannerViewInternal').BannerViewInternal;
var Base = require('./Core/Base').Base;
var Utils = require('./Core/Utils').Utils;

var BannerView = exports.BannerView = Base.subclass(
/** @lends MoPub.BannerView.prototype */
{
	classname: 'BannerView',

	/**
	* @class
	* The <code>BannerView</code> class constructs objects to house MoPub banner ads
	* and provide callbacks when ad events occur. For interstitial ads, use the {@link 
	* MoPub.Interstitial} class.<br /><br />
	* <b>Note:</b> Unlike other UI.View subclasses, a <code>BannerView</code> will automatically resize
	* based on device screen density, so it should not be positioned or resized using
	* <code>setFrame()</code>. Instead, to position a <code>BannerView</code>, use
	* <code>setAdOrigin(x, y)</code>, where (x, y) represents the desired frame origin on
	* screen. The banner size is set upon instantiation, by passing one of the 
	* {@link MoPub.BannerView#Size} enumeration values to the <code>BannerView</code> constructor.
	* The banner size should not be changed after instantiation.
	* 
	* @constructs The default constructor.
	* @param {$super} $super This parameter is a reference to the base class implementation and is 
	* stripped out during execution. Do not supply it.
	* @param bannerSize One of the supplied sizing constants for MoPub banners.
	* @augments UI.View
	* @since 1.4.1
	*/
	initialize: function($super, bannerSize) {
		$super({
			width: Utils.dp(bannerSize.width),
			height: Utils.dp(bannerSize.height)
		});
		
		this.internal = new BannerViewInternal(this);
		this.refreshTimer = null;
		this.refreshEnabled = true;
		this.previousRefreshEnabled = true;
	},
	
	/**
	* Enumeration for banner sizes.
	* @fieldOf MoPub.BannerView.prototype
	*/
	Size: {
		/**
		* 320 x 50 (Rectangle) Size
		* @fieldOf MoPub.BannerView.prototype
		* @constant
		*/
		Banner_320x50: {width: 320, height: 50},
		/**
		* 300 x 250 (Medium Rect) Size
		* @fieldOf MoPub.BannerView.prototype
		* @constant
		*/
		Banner_300x250: {width: 300, height: 250},
		/**
		* 728 x 90 (Leaderboard) Size
		* @fieldOf MoPub.BannerView.prototype
		* @constant
		*/
		Banner_728x90: {width: 728, height: 90}
	},
	
	/**
	* Load and display a banner ad in the given <code>BannerView</code>.
	* @since 1.4.1
	*/
	loadAd: function() {
		this.internal.fetchAd();
	},
	
	/** @private */
	scheduleRefreshTimer: function() {
		var self = this;
		
		if (!this.refreshEnabled || this.internal.refreshTimeMillis <= 0) {
			return;
		}
		
		Utils.mpLog('BannerView scheduleRefreshTimer: refreshTimeMillis: %s',
			this.internal.refreshTimeMillis);
		
		this.clearRefreshTimer();
		this.refreshTimer = setTimeout(function() {
			self.loadAd();
		}, this.internal.refreshTimeMillis);
	},

	/** @private */
	clearRefreshTimer: function() {
		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
			this.refreshTimer = null;
			Utils.mpLog('BannerView clearRefreshTimer: refresh timer cleared');
		}
	},
	
	/**
	* Disable the automatic refreshing of this banner ad.
	* @see MoPub.BannerView#resumeRefresh
	* @since 1.4.1
	*/
	pauseRefresh: function() {
		this.refreshEnabled = false;
		this.clearRefreshTimer();
		Utils.mpLog('BannerView pauseRefresh: refresh paused');
	},
	
	/**
	* Resume the automatic refreshing of this banner ad. Note that autorefresh is always disabled when
	* the banner ad is hidden.
	* @see MoPub.BannerView#pauseRefresh
	* @since 1.4.1
	*/
	resumeRefresh: function() {
		this.refreshEnabled = this.getVisible();
		this.scheduleRefreshTimer();
		Utils.mpLog('BannerView resumeRefresh: refresh resumed');
	},
	
	/** 
	* Set the visibility for this banner ad.
	* @param {$super} $super This parameter is a reference to the base class implementation and is
	* stripped out during execution. Do not supply it.
	* @param {Boolean} makeVisible Set as true to make this BannerView visible.
	* @since 1.4.1
	*/
	setVisible: function($super, makeVisible) {
		$super(makeVisible);
		if (makeVisible) {
			this.refreshEnabled = this.previousRefreshEnabled;
			this.scheduleRefreshTimer();
		}
		else {
			this.previousRefreshEnabled = this.refreshEnabled;
			this.clearRefreshTimer();
		}
	},
	
	/**
	* Set the position of this banner ad.
	* @param {Number} x x-component (in pixels) of the ad's origin
	* @param {Number} y y-component (in pixels) of the ad's origin
	* @since 1.4.1
	*/
	setAdOrigin: function(x, y) {
		this.setFrame(x, y, this.size.width, this.size.height);
	},
	
	/**
	* Set a function to call when the banner ad has successfully loaded.
	*
	* @example
	* bannerView.setOnAdSuccess(function() {
	*   console.log('bannerView: onAdSuccess');
	* });
	*
	* @param {Function} callback The function to call.
	* @see MoPub.BannerView#getOnAdSuccess
	* @since 1.4.1
	*/
	setOnAdSuccess: function(callback) {
		this.internal.onAdSuccess = callback;
	},
	
	/**
	* Retrieve the function to call when the banner ad has successfully loaded.
	* @returns {Function} The current callback function.
	* @see MoPub.BannerView#setOnAdSuccess
	* @since 1.4.1
	*/
	getOnAdSuccess: function() {
		return this.internal.onAdSuccess;
	},
	
	/**
	* Set a function to call when the ad server has determined there is no banner ad available.
	*
	* @example
	* bannerView.setOnAdFailure(function() {
	*   console.log('bannerView: onAdFailure');
	* });
	*
	* @param {Function} callback The function to call.
	* @see MoPub.BannerView#getOnAdFailure
	* @since 1.4.1
	*/
	setOnAdFailure: function(callback) {
		this.internal.onAdFailure = callback;
	},
	
	/**
	* Retrieve the function to call when the ad server has determined there is no banner ad available.
	* @returns {Function} The current callback function.
	* @see MoPub.BannerView#setOnAdFailure
	* @since 1.4.1
	*/
	getOnAdFailure: function() {
		return this.internal.onAdFailure;
	},
	
	/**
	* Set a function to call when the banner ad has been clicked, resulting in the display of the
	* modal ad browser. This may be used to notify the application that it should pause its normal
	* operations.
	*
	* @example
	* bannerView.setOnAdClicked(function() {
	*   console.log('bannerView: onAdClicked');
	* });
	*
	* @param {Function} callback The function to call.
	* @see MoPub.BannerView#getOnAdClicked
	* @since 1.4.1
	*/
	setOnAdClicked: function(callback) {
		this.internal.onAdClicked = callback;
	},
	
	/**
	* Retrieve the function to call when the banner ad has been clicked, resulting in the display of
	* the modal ad browser.
	*
	* @example
	* bannerView.setOnAdClicked(function() {
	*   console.log('bannerView: onAdClicked');
	* })
	*
	* @returns {Function} The current callback function.
	* @see MoPub.BannerView#setOnAdClicked
	* @since 1.4.1
	*/
	getOnAdClicked: function() {
		return this.internal.onAdClicked;
	},
	
	/**
	* Set a function to call when the banner ad's modal browser has been dismissed. This may be used
	* to notify the application that it should resume its normal operations.
	*
	* @example
	* bannerView.setOnAdModalDismissed(function() {
	*   console.log('bannerView: onAdModalDismissed');
	* });
	*
	* @param {Function} callback The function to call.
	* @see MoPub.BannerView#getOnAdModalDismissed
	* @since 1.4.1
	*/
	setOnAdModalDismissed: function(callback) {
		this.internal.onAdModalDismissed = callback;
	},
	
	/**
	* Retrieve the function to call when the banner ad's modal browser has been dismissed.
	* @returns {Function} The current callback function.
	* @see MoPub.BannerView#setOnAdModalDismissed
	* @since 1.4.1
	*/
	getOnAdModalDismissed: function() {
		return this.internal.onAdModalDismissed;
	},
	
	/**
	* Destroy this instance and release resources on the backend.
	* @param {$super} $super This parameter is a reference to the base class implementation and is 
	* stripped out during execution. Do not supply it.
	* @since 1.4.1
	*/
	destroy: function($super) {
		this.clearRefreshTimer();
		this.internal.destroy();
		$super();
	}
	
	// Hardcode the following super methods for jsdoc
	
	// setKeywords
	/**
	* Set the targeting keywords that will be passed to the MoPub servers as part of an ad request. 
	* The keywords should be passed in as a comma-delimited string of key-value pairs.
	* @name MoPub.BannerView#setKeywords
	* @function
	*
	* @example
	* bannerView.setKeywords('keyword1:value1,keyword2:value2');
	*
	* @param {String} keywords Comma-delimited string of key-value pairs.
	* @see MoPub.BannerView#getKeywords
	*/
	
	// getKeywords
	/**
	* Retrieve the targeting keywords that will be passed to the MoPub servers as part of an ad 
	* request.
	* @name MoPub.BannerView#getKeywords
	* @function
	* @returns {String} Comma-delimited string of key-value pairs.
	* @see MoPub.BannerView#setKeywords
	*/
	
	// setLocation
	/**
	* Set a latitude/longitude location that will be passed to the MoPub servers as part of an ad 
	* request.
	* @name MoPub.BannerView#setLocation
	* @function
	*
	* @example
	* bannerView.setLocation(new Core.Point(37.782929, -122.393281));
	*
	* @param {Core.Point} location Location, as a latitude/longitude point.
	* @see MoPub.BannerView#getLocation
	*/
	
	// getLocation
	/**
	* Retrieve the previously-set latitude/longitude location that will be passed to the MoPub servers
	* as part of an ad request. If a location has not been set previously, this method will return
	* <code>null</code>.
	* @name MoPub.BannerView#getLocation
	* @function
	* @returns {Core.Point} Location, as a latitude/longitude point.
	* @see MoPub.BannerView#setLocation
	*/
	
	// setAdUnitId
	/**
	* Set the ad unit ID. This value can be found from the MoPub dashboard.
	* @name MoPub.BannerView#setAdUnitId
	* @function
	*
	* @example
	* bannerView.setAdUnitId('agltb3B1Yi1pbmNyDAsSBFNpdGUYkaoMDA');
	*
	* @param {String} adUnitId MoPub ad unit ID for this ad.
	* @see MoPub.BannerView#getAdUnitId
	*/
	
	// getAdUnitId
	/**
	* Retrieve the ad unit ID.
	* @name MoPub.BannerView#getAdUnitId
	* @function
	* @returns {String} MoPub ad unit ID for this ad.
	* @see MoPub.BannerView#setAdUnitId
	*/
});
