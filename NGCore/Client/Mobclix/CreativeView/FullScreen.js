//
//  Mobclix.CreativeView.FullScreen.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../../Core').Core;
var Controller = require('../Core/Controller').Controller;
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

exports.FullScreen = Base.subclass(
/** @lends Mobclix.CreativeView.FullScreen.prototype */
{
	__className: "Mobclix.CreativeView.FullScreen",
	browser: null,
	cacheLocation: null,
	fs: null,
	useRichMedia: false,
	loaded: false,
    touched: false,
    
	/**
	 * @class Web CreativeView class for display {@link Mobclix.Creative.Web} creatives
	 * @constructs The default constructor. 
	 * @param $super This parameter is stripped out during execution. Do not supply it.
	 * @extends Mobclix.Creative.Base
	 * @private
	 */
	initialize: function($super) {
		$super();

        $mc.log("Initializing the FullScreen CreativeView");
        
		var self = this;
        
        
		
        
        $mc.log("Initializing the FileSystem");
		this.fs = Storage.FileSystem;
		
        $mc.log("Setting up poxylistener");
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
	
	/**
	 * Resize the internal webview if our bounds change
	 * 
	 * NOTE: Couldn't find any "autoresizing" options like iOS
	 * has, this should be replaced with that if found.
	 *
	setFrame: function() {
		UI.View.prototype.setFrame.apply(this, arguments);
		var frame = this.getFrame();
		this.webView.setFrame(0, 0, frame[2], frame[3]);
	},*/

	/**
	 * Tells AdView what kind of view this is
	 * and when to reuse it
	 * @since 1.3.1b
	 */
	reuseIdentifier: function() {
		return "fullscreen";
	},
	
	/**
	 * Should prepare the current creative view to be reused
	 * Only called if canBeReused returns true
	 * @since 1.3.1b
	 */
	prepareForReuse: function() {
		//this.webView.loadUrl("about:blank");
		this.fs.deleteFile(this.cacheLocation);
		this.cacheLocation = null;
        this.loaded = false;
        this.touched = false;
	},
	
	/**
	 * Whether or not the current creative view can be reused
	 * Reuseable creative views are encouraged to lower memory and cpu usage
	 * @since 1.3.1b
	 */
	canBeReused: function() {
		return true;
	},
	
	/**
	 * Load the current creative
	 * @since 1.3.1b
	 */
	loadWithCreative: function($super, creative) {
		$super(creative);
		
		var ts = parseInt((new Date()).getTime(), 10);
		this.cacheLocation = "MobclixTempCreative-"+ts+".html";
		
		$mc.log("Loading HTML: ", this.currentCreative.html);
		
        var browserType = Browser.Type.Toolbar;
        if (this.currentCreative.html.search(/<meta[^>]*MobclixUseWidgetStyle/i) != -1)
            browserType = Browser.Type.Minimal;
        if (this.currentCreative.html.search(/<meta[^>]*MobileAdsUseWidgetStyle/i) != -1)
            browserType = Browser.Type.Minimal;
        
        var self = this;
        
        $mc.log("Creating browser");
		this.browser = new Browser(browserType, this);
        
        // Set the frame here to prevent iOS scaling issues.
		var Window = require('../../UI/Window').Window;
        var screenSize = {width: Window.getWidth(), height: NWindow.getHeight()};
		var startFullScreenFrame = [0, screenSize.height, screenSize.width, screenSize.height];
        this.browser.setFrame(startFullScreenFrame);
        
        this.browser.onDidFinish = function() {
            try {
                if(typeof self.adView.onDismissAd == 'function') {
                    self.adView.onDismissAd(self.adView);
                }
            } catch (err) {}
            try {
                self.adView._canRequestNextAd = true;
            } catch (err) {}
        };
        
		this.fs.writeFile(this.cacheLocation, this.currentCreative.html);
		this.browser.loadWithCreative(this.cacheLocation);
	},
	
	/**
	 * Stop all loading of the creative
	 * @since 1.3.1b
	 */
	stopLoading: function() {
		//this.webView.stopLoading();
	},
	
    display: function() {
        this.browser.presentViewController(true);
		this.browser.release();
		this.browser = null;
    },
    
	/**
	 * Called after a creative has been displayed, any post-display 
	 * events or actions that need to be triggered, should be triggered here
	 * @since 1.3.1b
	 */
	creativeHasBeenDisplayed: function() {
		
	},
	
	/**
	 * Clean up
	 * @since 1.3.1b
	 */
	destroy: function($super) {
		$mc.log('Web - destroy - fullscreen creativeview: ');
		
		try {
			this.browser.release();
            this.browser = null;
		} catch (e) {
			$mc.log("Exception while destroying Browser: ", e);
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
