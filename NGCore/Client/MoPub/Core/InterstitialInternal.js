var BannerViewInternal = require('./BannerViewInternal').BannerViewInternal;
var Browser = require('../Modal/Browser').Browser;
var InterstitialViewController =
	require('../Modal/InterstitialViewController').InterstitialViewController;
var Utils = require('./Utils').Utils;


var InterstitialInternal = exports.InterstitialInternal = BannerViewInternal.subclass({
	classname: 'InterstitialInternal',
	
	initialize: function($super, delegate) {
		$super(delegate);
		this.isReady = false;
		this._initializeInterstitialViewController();
	},
	
	_initializeCallbacks: function() {
		this.onInterstitialClicked = function() {};
		this.onInterstitialSuccess = function() {};
		this.onInterstitialFailure = function() {};
		this.onInterstitialWillPresent = function() {};
		this.onInterstitialDidDismiss = function() {};
	},
	
	_initializeInterstitialViewController: function() {
		var self = this;
		
		this.interstitialViewController = new InterstitialViewController();
		this.interstitialViewController.setOnWillAppear(function() {
			self.onInterstitialWillPresent();
		});
		this.interstitialViewController.setOnDidDisappear(function() {
			self.onInterstitialDidDismiss();
		});
	},

	destroy: function($super) {
		this.isReady = false;
		this.interstitialViewController.destroy();
		$super();
	},
	
	fetchAd: function($super, url) {
		this.isReady = false;
		$super(url);
	},
	
	presentViewController: function() {
		this.interstitialViewController.present();
	},
	
	isVisible: function() {
		return this.interstitialViewController.isVisible();
	},
	
	_handleMoPubFinishLoad: function() {
		this.isLoading = false;
		this.isReady = true;
		this.onInterstitialSuccess();
		this.interstitialViewController.setLockedOrientation(this.lockedOrientation);
	},
	
	_handleMoPubFailLoad: function() {
		if (this.failURL) {
			Utils.mpLog('Interstitial failed to load, now trying %s.', this.failURL);
			this.fetchAd(this.failURL);
		}
		else {
			Utils.mpLog('Interstitial failed to load, but no more failover URLs.');
			this.isLoading = false;
			this.onInterstitialFailure();
		}
	},

	_handleAdClick: function(url) {
		this.onInterstitialClicked();
		url = this.clickthroughURL + '&r=' + encodeURIComponent(url);
		this._showBrowserForUrl(url);
	},
	
	_showBrowserForUrl: function(url) {
		var self = this;
		
		this.browser = new Browser();

		this.browser.setOnWillAppear(function() {
			self.interstitialViewController.visible = false;
			self.browser.layoutSubviews();
		});
		
		this.browser.setOnDidDisappear(function() {
			self.interstitialViewController.visible = true;
			self.browser.destroy();
		});
		
		this.browser.setLockedOrientation(this.lockedOrientation);
		this.interstitialViewController.setBrowser(this.browser);
		this.interstitialViewController.showBrowserForUrl(url);
	},
	
	_displayAd: function() {
		this.webView.setBackgroundColor('FF000000');
		this.interstitialViewController.setWebView(this.webView);
	}
});
