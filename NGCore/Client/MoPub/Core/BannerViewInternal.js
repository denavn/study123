var Core = require('../../Core').Core;
var Device = require('../../Device').Device;
var FileSystem = require('../../Storage').Storage.FileSystem;
var UI = require('../../UI').UI;

var BannerBrowser = require('../Modal/BannerBrowser').BannerBrowser;
var URLConnection = require('./URLConnection').URLConnection;
var Utils = require('./Utils').Utils;

var BannerViewInternal = exports.BannerViewInternal = Core.Class.subclass({
	classname: 'BannerViewInternal',
	
	initialize: function(delegate) {
		var self = this;
		
		this.delegate = delegate || null;

		this.isLoading = false;
		this.cacheLocation = 'current_mopub_ad.html';
		this.userAgent = '';

		this.hostname = 'http://ads.mopub.com/m/ad';
		this.hashedUdid = null;

		this._initializeWebView();
		this._initializeCallbacks();
		this._initializeHeaderData();
		
		Device.LocationEmitter.setProperties(Device.LocationEmitter.Accuracy.HIGH,
			Device.LocationEmitter.Elements.Latitude | Device.LocationEmitter.Elements.Longitude);
	},
	
	_initializeWebView: function() {
		this.webView = new UI.WebView();
		this.webView.setFrame(0, 0, this.delegate.size.width, this.delegate.size.height);
		this.webView.setOnError(this.bind(this._webViewOnError));
		this.webView.setOnPageload(this.bind(this._webViewOnPageload));
		this.webView.setOnShouldload(this.bind(this._webViewOnShouldload));
	},

	_initializeCallbacks: function() {
		this.onAdClicked = function() {};
		this.onAdSuccess = function() {};
		this.onAdFailure = function() {};
		this.onAdModalDismissed = function() {};
	},
	
	_initializeHeaderData: function() {
		this.adType = '';
		this.networkType = '';
		this.redirectURL = '';
		this.clickthroughURL = '';
		this.failURL = '';
		this.impressionURL = '';
		this.refreshTimeMillis = -1;
		this.lockedOrientation = '';
	},
	
	destroy: function() {
		this.delegate = null;
	
		this.webView.removeFromParent();
		this.webView.destroy();
	},
	
	fetchAd: function(url) {
		var self = this;
		
		this.userAgent = Utils.getUserAgent();
		if (!this.userAgent) {
			Utils.mpLog('fetchAd: userAgent is not ready, trying again in 500ms.');
			setTimeout(function() { self.fetchAd(url); }, 500);
			return;
		}
		
		if (this.isLoading) {
			Utils.mpLog('Ad (', this.delegate.adUnitId, ') is already loading.');
			return;
		}
		
		this.isLoading = true;
		
		// If no URL is passed in, default to the _adRequestURL().
		url = url || this._adRequestURL();
		if (url) {
			this.isLoading = true;
			this._startURLConnection(url);
		}
	},
	
	_adRequestURL: function() {
		var requestUrl = this.hostname + '?';
		
		var adUnitIdParam = this._getAdUnitIdQueryParameter();
		if (!adUnitIdParam) {
			Utils.mpLog('Could not make an ad request due to empty or invalid ad unit ID!');
			return null;
		}
		requestUrl += '&' + adUnitIdParam;
		
		var otherRequestParams = [
			this._getVersionQueryParameter(),
			this._getHashedUdidQueryParameter(),
			this._getKeywordQueryParameter(),
			this._getLocationQueryParameter(),
			this._getTimezoneQueryParameter(),
			this._getScreenDensityQueryParameter(),
			this._getUserAgentQueryParameter(),
			this._getOrientationQueryParameter()
		];
		
		requestUrl += '&' + otherRequestParams.join('&');
		
		Utils.mpLog('adRequestURL: final URL is %s', requestUrl);
		return requestUrl;
	},
	
	_getAdUnitIdQueryParameter: function() {
		return (this.delegate.adUnitId) ? 'id=' + this.delegate.adUnitId : null;
	},
	
	_getVersionQueryParameter: function() {
		return 'v=7';
	},
	
	_getHashedUdidQueryParameter: function() {
		if (!this.hashedUdid) {
			var udid = Core.Capabilities.getUniqueId();
			this.hashedUdid = udid ? Core.SHA1.hex_sha1(udid) : '';
			Utils.mpLog('adRequestURL: udid is %s, hashed is %s', udid, this.hashedUdid);
		}
		return 'udid=sha:' + this.hashedUdid;
	},
	
	_getKeywordQueryParameter: function() {
		Utils.mpLog('adRequestURL: keywords are %s', this.delegate.keywords);
		return (this.delegate.keywords) ? 'q=' + encodeURIComponent(this.delegate.keywords) : 'q=';
	},
	
	_getLocationQueryParameter: function() {
		var tempLocation = null, latitude = null, longitude = null;

		if (this.delegate.location) { // First, try using the developer-specified location.
			latitude = this.delegate.location.getX();
			longitude = this.delegate.location.getY();
		} else if (Device.LocationEmitter.getLastLocation()) { // Otherwise, use the device location
			tempLocation = Device.LocationEmitter.getLastLocation();
			latitude = tempLocation.getPosition().getX();
			longitude = tempLocation.getPosition().getY();
		}
		
		Utils.mpLog('adRequestURL: location is %s, %s', latitude, longitude);
		return (latitude && longitude) ? 'll=' + encodeURIComponent(latitude + ',' + longitude) : 'll=';
	},
	
	_getTimezoneQueryParameter: function() {
		var timezone = Utils.getTimezone();
		Utils.mpLog('adRequestURL: timezone is %s', timezone);
		return 'z=' + encodeURIComponent(timezone);
	},
	
	_getScreenDensityQueryParameter: function() {
		var screenUnits = Core.Capabilities.getScreenUnits();
		return Utils.isIOS() ? 'sc=' + screenUnits : 'sc_a=' + screenUnits;
	},
	
	_getUserAgentQueryParameter: function() {
		Utils.mpLog('adRequestURL: userAgent is %s', this.userAgent);
		return 'ua=' + encodeURIComponent(this.userAgent);
	},
	
	_getOrientationQueryParameter: function() {
		var orientation = Device.OrientationEmitter.getInterfaceOrientation();
		
		if (Utils.orientationIsPortrait(orientation)) {
			return 'o=p';
		} else if (Utils.orientationIsLandscape(orientation)) {
			return 'o=l';
		} else {
			return 'o=u';
		}
	},
	
	_startURLConnection: function(url) {
		var self = this;
		
		var connection = new URLConnection();
		connection.setURL(url);
		connection.setOptions({'User-Agent': this.userAgent});
		
		connection.setOnSuccess(function(XHR, response) {
			var success = self.tryParsingResponseHeaders(XHR);
			if (success) {
				self._setWebViewContent(response);
				self._displayAd();
			} else {
				self._handleMoPubFailLoad();
			}
		});
		
		connection.setOnFailure(function(XHR, statusCode) {
			Utils.mpLog('Ad fetch for ad unit %s failed with status %d.', self.delegate.adUnitId,
				statusCode);
			self.isLoading = false;
			self._scheduleRetry(60000);
		});
		
		connection.start();
	},
	
	_scheduleRetry: function(milliseconds) {
		Utils.mpLog('Retrying in ' + milliseconds + 'ms.');
		this.refreshTimeMillis = milliseconds;
		this.delegate.scheduleRefreshTimer();
	},
	
	tryParsingResponseHeaders: function(XHR) {
		if (!XHR) {
			Utils.mpLog('tryParsingResponseHeaders: can\'t parse headers without a URLConnection.');
			return false;
		}
		
		this.adType = XHR.getResponseHeader('X-Adtype') || '';
		this.networkType = XHR.getResponseHeader('X-Networktype') || '';
		this.redirectURL = XHR.getResponseHeader('X-Launchpage') || '';
		this.clickthroughURL = XHR.getResponseHeader('X-Clickthrough') || '';
		this.failURL = XHR.getResponseHeader('X-Failurl') || '';
		this.impressionURL = XHR.getResponseHeader('X-Imptracker') || '';
		
		this.lockedOrientation = null;
		var orientationHeader = XHR.getResponseHeader('X-Orientation');
		if (orientationHeader === 'p') {
			this.lockedOrientation = Device.OrientationEmitter.Orientation.Portrait;
		} else if (orientationHeader === 'l') {
			this.lockedOrientation = Device.OrientationEmitter.Orientation.LandscapeLeft;
		}
		
		// Factor of 1000, because server gives us refresh time in seconds.
		this.refreshTimeMillis = 1000 * parseInt(XHR.getResponseHeader('X-Refreshtime'), 10) || -1;
	
		// Native ad types are not supported, so any adType other than 'html' represents failure.
		return (this.adType === 'html');
	},
	
	_setWebViewContent: function(content) {
		// Write content to a file, and then load the file into the WebView.
		FileSystem.writeFile(this.cacheLocation, content);
		this.webView.loadDocument(this.cacheLocation);
	},

	_displayAd: function() {
		this.delegate.addChild(this.webView);
	},
	
	_webViewOnError: function(event) {
		Utils.mpLog('ad webViewOnError: ', JSON.stringify(event));
	},
	
	_webViewOnPageload: function(event) {
		FileSystem.deleteFile(this.cacheLocation);
	},
	
	_webViewOnShouldload: function(event) {
		var url = event.url;
		var mopubHost = Utils.parseURLForMoPubHost(url);
		if (mopubHost === 'finishLoad') this._handleMoPubFinishLoad();
		else if (mopubHost === 'failLoad') this._handleMoPubFailLoad();
		else if (event.navigation === 'click') this._handleAdClick(url);
	},
	
	_handleMoPubFinishLoad: function() {
		this.isLoading = false;
		this.onAdSuccess();
		this.delegate.scheduleRefreshTimer();
	},
	
	_handleMoPubFailLoad: function() {
		this.isLoading = false;
		
		if (this.failURL) {
			Utils.mpLog('Ad failed to load, now trying %s.', this.failURL);
			this.fetchAd(this.failURL);
		} else {
			this.onAdFailure();
			Utils.mpLog('Ad failed to load, but no more failover URLs. Scheduling refresh timer.');
			this.delegate.scheduleRefreshTimer();
		}
	},
	
	_handleAdClick: function(url) {
		this.onAdClicked();
		url = this.clickthroughURL + '&r=' + encodeURIComponent(url);
		this._showBrowserForUrl(url);
	},
	
	_showBrowserForUrl: function(url) {
		var self = this;
		
		this.browser = new BannerBrowser();
		
		this.browser.setOnWillAppear(function() {
			self.delegate.pauseRefresh();
		});
	
		this.browser.setOnDidDisappear(function() {
			self.delegate.resumeRefresh();
			self.onAdModalDismissed();
			self.browser.destroy();
		});
		
		this.browser.loadUrl(url);
		this.browser.present();
	}
});
