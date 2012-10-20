//
//  Mobclix.CreativeView.Web.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../../Core').Core;
var Controller = require('../Core/Controller').Controller;
var UI = require('../../UI').UI;
var Device = require('../../Device').Device;
var Storage = require('../../Storage').Storage;
var Base = require('./Base').Base;
var MMWebView = require('../Core/MMWebView').MMWebView;
var RMWebView = require('./WebView').WebView;
var Browser = require('../Browser').Browser;
var $mc = require('../Core/Utils').Utils;

var ProxyListener = Core.MessageListener.subclass({
	onUpdate: function() {}
});

exports.Web = Base.subclass(
/** @lends Mobclix.CreativeView.Web.prototype */
{
	__className: "Mobclix.CreativeView.Web",
	webView: null,
	cacheLocation: null,
	loaded: false,
    touched: false,
	fs: null,
	useRichMedia: false,
	
	/**
	 * @class Web CreativeView class for display {@link Mobclix.Creative.Web} creatives
	 * @constructs The default constructor. 
	 * @param $super This parameter is stripped out during execution. Do not supply it.
	 * @extends Mobclix.Creative.Base
	 * @private
	 */
	initialize: function($super) {
		$super();

		if(this.useRichMedia) {
			this.webView = new RMWebView();
			this.webView.parentCreative = this;
		} else {
			this.webView = new MMWebView();
		}
		
		this.addChild(this.webView);
		this.fs = Storage.FileSystem;
		
		var self = this;
		
        this.webView.setScrollable(false);
        
		if(this.useRichMedia) {
			this.webView.setOnPageevent(this.webView.onPageEvent);
		} else {
            this.webView.setOnPageevent(function(event) {
                self.onPageEvent(event);
            });
        }
		
		this.webView.setOnStartload(function(event) {
			self.onStartLoad(event);
		});

		this.webView.setOnShouldload(function(event) {
			return self.onShouldLoad(event);
		});

		this.webView.setOnPageload(function(event) {
			self.onPageLoad(event);
		});
		
		this.webView.setOnError(function(event) {
			self.onError(event);
		});
		
		this.proxyListener = new ProxyListener();
		$mc.log("Adding life cycle listener");
		Device.LifecycleEmitter.addListener(this.proxyListener, function(event) {
			$mc.log("life cycle changed!");
			if(event == Device.LifecycleEmitter.Event.Terminate) {
				self.fs.deleteFile(this.cacheLocation);
				self.fs = null;
				self.cacheLocation = null;
			}
		});
		$mc.log("Added life cycle listener");
	},
	
	getParameterByName: function(url, name, d) {
		name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
		var regexS = "[\\?&]"+name+"=([^&#]*)";
		var regex = new RegExp( regexS );
		var results = regex.exec( url );
		if( results == null )
			return d;
		else
			return decodeURIComponent(results[1].replace(/\+/g, " "));
	},
	
	/**
	 * Resize the internal webview if our bounds change
	 * 
	 * NOTE: Couldn't find any "autoresizing" options like iOS
	 * has, this should be replaced with that if found.
	 * @since 1.1.5
	 */
	setFrame: function() {
		UI.View.prototype.setFrame.apply(this, arguments);
		var frame = this.getFrame();
		this.webView.setFrame(0, 0, frame[2], frame[3]);
	},

	/**
	 * Tells AdView what kind of view this is
	 * and when to reuse it
	 * @since 1.1.5
	 */
	reuseIdentifier: function() {
		return "web";
	},
	
	/**
	 * Should prepare the current creative view to be reused
	 * Only called if canBeReused returns true
	 * @since 1.1.5
	 */
	prepareForReuse: function() {
		this.webView.loadUrl("about:blank");
		this.fs.deleteFile(this.cacheLocation);
		this.cacheLocation = null;
        this.loaded = false;
        this.touched = false;
	},
	
	/**
	 * Whether or not the current creative view can be reused
	 * Reuseable creative views are encouraged to lower memory and cpu usage
	 * @since 1.1.5
	 */
	canBeReused: function() {
		return true;
	},
	
	/**
	 * Load the current creative
	 * @since 1.1.5
	 */
	loadWithCreative: function($super, creative) {
		$super(creative);
		
		var ts = parseInt((new Date()).getTime(), 10);
		this.cacheLocation = "MobclixTempCreative-"+ts+".html";
		
		$mc.log("Loading HTML: ", this.currentCreative.html);
		
		this.fs.writeFile(this.cacheLocation, this.currentCreative.html);
		this.webView.loadDocument(this.cacheLocation);
	},
	
	onShouldLoad: function(event) {
        if(this.loaded && !this.touched) {
            try {
                this.adView.currentCreative.getEvents().triggerEvent("touch");
            } catch(e) { }
        }
        this.touched = true;
		if(!this.useRichMedia) {
			this.adView.openActionURL(this.currentCreative, event.url);
			return false;
		}
		
		var shouldOpenInNewWindow = this.getParameterByName(event.url, "shouldOpenInNewWindow", null);
		
		if ((this.webView.expanded || this.webView.fullscreen) &&
				shouldOpenInNewWindow != "yes") {
			return true;
		} else if (shouldOpenInNewWindow == "no") {
			return true;
		}
		
		// If not an expanded or fullscreen ad, check if another modal is open
		if (!this.webView.expanded && !this.webView.fullscreen) {
			if(!this.adView.shouldTouchThrough()) {
				$mc.log("Already in modal, can't open:", url);
				return false;
			}
			this.adView.willTouchThrough();
		}
		
		var browser = new Browser();
		
		var self = this;
		browser.onDidFinish = function() {
			// If not an expanded or fullscreen ad, reset touchThrough status
			if (!self.webView.expanded && !self.webView.fullscreen)
				self.adView.didTouchThrough(self);
			self.webView.adDidReturnFromHidden();
			self.webView.resumeListeners();
		};
		this.webView.adWillBecomeHidden();
		this.webView.pauseListeners();
	
		browser.loadUrl(event.url);
		browser.presentViewController(true);
		browser.release();
		browser = null;

		return false;
	},
	
	onPageEvent: function(event) {
		$mc.log("WebView webgame Page Event: ", JSON.stringify(event));
        var method = event.eventStream.split("?")[0];
        if (method == "setUserAgent") {
            var userAgent = this.getParameterByName(event.eventStream, "ua") || null;
            Controller.setUserAgent(userAgent);
        }
	},

	onStartLoad: function(event) {
		$mc.log("WebView webgame Page Start Load: ", JSON.stringify(event));
	},

	onPageLoad: function(event) {
		$mc.log("WebView webgame Page Load: ", JSON.stringify(event));
		if (!this.loaded) {
			this.adView.creativeViewFinishedLoading(this, this.currentCreative);
			this.loaded = true;
            try {
                this.webView.invoke("var uaUrl = \"ngcore://setUserAgent?ua=\" + escape(navigator.userAgent); window.location=uaUrl;");
            } catch (err) {}
		}
	},

	onError: function(event) {
		$mc.log("WebView webgame Error: ", JSON.stringify(event));
	},
	
	/**
	 * Stop all loading of the creative
	 * @since 1.1.5
	 */
	stopLoading: function() {
		this.webView.stopLoading();
	},
	
	/**
	 * Called after a creative has been displayed, any post-display 
	 * events or actions that need to be triggered, should be triggered here
	 * @since 1.1.5
	 */
	creativeHasBeenDisplayed: function() {
		
	},
	
	/**
	 * Clean up
	 * @since 1.1.5
	 */
	destroy: function($super) {
		$mc.log('Web - destroy - adView_frame: ');
		this.webView.removeFromParent();
		
		try {
			this.webView.release();
			this.webView = null;
		} catch (e) {
			$mc.log("Exception while destroying WebView: ", e);
		}
			
		try {
			this.fs.deleteFile(this.cacheLocation);
			this.fs = null;
			this.cacheLocation = null;
		} catch (e) {
			$mc.log("Exception while destroying CreativeView.Web: ", e);
		}
		
		this.proxyListener = null;
		
		$super();
	}
});
