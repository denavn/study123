//
//  Mobclix.Browser.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../Core').Core;
var Device = require('../Device').Device;
var UI = require('../UI').UI;
var ViewController = require('./ViewController').ViewController;
var Controller = require('./Core/Controller').Controller;
var MMView = require('./Core/MMView').MMView;
var MMWebView = require('./Core/MMWebView').MMWebView;
var Config = require('./Core/Config').Config;
var $mc = require('./Core/Utils').Utils;

var ProxyListener = Core.MessageListener.subclass({
	onUpdate: function() {}
});

var Browser = exports.Browser = ViewController.subclass(
/** @lends Mobclix.Browser.prototype */
{
	__className: "Mobclix.Browser",
	webView: null,
	onDidFinish: null,
    browserType: null,
	topBar: null,
	bottomBar: null,
	bottomBorders: [null, null],
	prevArrow: null,
	nextArrow: null,
	doneButton: null,
	proxyListener: null,
    keyListener: null,
	
    // Null unless this is a fullscreen ad
    creativeView: null,
    
	Type: {
		Toolbar: 1,
		Navigation: 2,
		Full: 3,
		Minimal: 4
	},
	
	initialize: function($super, browserType, creativeView) {
		$super();
		
		var self = this;
		var types = this.Type;
        this.creativeView = creativeView;

        // Register register to close browser when app loses focus if not a fullscreen ad.
        if (creativeView == null) {
            this.proxyListener = new ProxyListener();
            Device.LifecycleEmitter.addListener(this.proxyListener, function(event) {
                if(event == Device.LifecycleEmitter.Event.Suspend) {
                    if(self.isPresented()) {
                        self.dismissViewController();
                    }
                }
            });
        }
        
        this.keyListener = new ProxyListener();
        Device.KeyEmitter.addListener(this.keyListener, function(event) {
            if(event.code === Device.KeyEmitter.Keycode.back) {
                if(self.isPresented()) {
                    self.dismissViewController();
                    return true;
                }
            }
        }, 0xffffffff);

		var browserType = browserType || this.Type.Toolbar;
		this.browserType = browserType;
        
		// Web View
		this.webView = new MMWebView();
		this.addChild(this.webView);
		
		// Bottom Bar
		(function() {
			if(browserType != types.Toolbar && browserType != types.Navigation && browserType != types.Full) return;
			
			self.bottomBar = new MMView();
			self.bottomBar.setGradient({
				gradient: [ "ffb0bccd 0.0", "ff879ab3 0.5", "ff8094ae 0.5", "ff6d83a1 1.0" ]
			});
			self.addChild(self.bottomBar);
			
			self.doneButton = new UI.Button({
				'text': 'Close',
				'textColor': 'ff',
				'textShadow': "8000 1.0 {0,1}",
				'textSize': 13,
				'textFont': UI.FontStyle.Bold,
				'textGravity': UI.ViewGeometry.Gravity.Center,
				'frame': [0, 0, 60, 30]
			});
			
			var corners = $mc.dip(4);
			corners = [corners, corners, corners, corners].join(' ');
			
			self.doneButton.setNormalGradient({
				corners: corners,
				outerLine: "ff2952b8 1",
				gradient: [ "ff7b9eea 0.0", "ff376fe0 0.5", "ff2260dd 0.5", "ff2463de 1.0" ]
			});
			self.doneButton.setHighlightedGradient({
				corners: corners,
				outerLine: "ff1b2c4e 1",
				gradient: [ "ff7d88a5 0.0", "ff3a4e77 0.5", "ff253c6a 0.5", "ff273e6d 1.0" ]
			});
			
			self.doneButton.setOnClick(function() {
				self.dismissViewController(true);
			});

			self.bottomBar.addChild(self.doneButton);

			var arrowProps = {
				'text': '◀',
				'textColor': 'ff',
				'textShadow': "8000 1.0 {0,1}",
				'textSize': 16,
				'textFont': UI.FontStyle.Bold,
				'textGravity': UI.ViewGeometry.Gravity.Center
			};
			
			if(Controller.isAndroid()) {
				arrowProps.textSize = 32;
			}
			
			self.prevArrow = new UI.Button(arrowProps);
			self.prevArrow.setOnClick(function() { self.webView.goBack(); });
			self.prevArrow.setTextColor('ffa8d4ff', UI.State.Pressed);
			self.bottomBar.addChild(self.prevArrow);

			arrowProps.text = '▶';
			self.nextArrow = new UI.Button(arrowProps);
			self.nextArrow.setTextColor('ffa8d4ff', UI.State.Pressed);
			self.nextArrow.setOnClick(function() { self.webView.goForward(); });
			self.bottomBar.addChild(self.nextArrow);
			
			self.bottomBorders[0] = new MMView();
			self.bottomBorders[0].setBackgroundColor('ff2d3034');
			self.bottomBar.addChild(self.bottomBorders[0]);
			
			self.bottomBorders[1] = new MMView();
			self.bottomBorders[1].setBackgroundColor('ffd8dee6');
			self.bottomBar.addChild(self.bottomBorders[1]);
			
			self.loadingIndicator = new UI.Spinner({
				'frame': [0, 0, 30, 30]
			});
			self.bottomBar.addChild(self.loadingIndicator);
			
			// Setup WebView listenres to control the bar items
            // Only for non-fullscreen creatives. Fullscreen listeners are set below.
            if (self.creativeView == null) {
                self.webView.setOnPageevent(function(event) {
                    self.updateArrows();
                });

                self.webView.setOnStartload(function(event) {
                    self.updateArrows();
                    self.loadingIndicator.setVisible(true);
                });

                self.webView.setOnPageload(function(event) {
                    self.updateArrows();
                    self.loadingIndicator.setVisible(false);
                });

                self.webView.setOnError(function(event) {
                    self.updateArrows();
                    self.loadingIndicator.setVisible(false);
                });

                self.webView.setOnLoad(function(event) {
                    self.updateArrows();
                });
            }
		})();

		// Widget close
		(function() {
			if(browserType != types.Minimal) return;

			var cornerSize = $mc.dip(14);
			var backFontSize = 18;
		
			if(Controller.isAndroid()) {
				backFontSize = 20;
			}

			var back = new UI.Button({
				'text': '✖',
				'textColor': 'ff',
				'textSize': backFontSize,
				'textFont': UI.FontStyle.Bold,
				'textGravity': UI.ViewGeometry.Gravity.Center,
				'textInsets': [1, 0, 0, 1],
				'frame': [$mc.dip(10), $mc.dip(10), $mc.dip(32), $mc.dip(32)]
			});

			back.setGradient({
				corners: [cornerSize, cornerSize, cornerSize, cornerSize].join(' '),
				outerLine: "ff 2",
				gradient: [ "00 0.0", "00 1.0" ]
			}, UI.State.Normal);
		
			back.setGradient({
				corners: [cornerSize, cornerSize, cornerSize, cornerSize].join(' '),
				outerLine: "ff 2",
				gradient: [ "00 0.0", "00 1.0" ]
			}, UI.State.Pressed);
		
			back.onclick = function() {
				self.dismissViewController(true);
			};
		
			self.addChild(back);
		})();
        
        if (creativeView != null) {
            this.webView.setOnPageevent(function(event) {
                self.onPageEvent(event);
            });
            
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
        }
	},
	
    updateArrows: function() {
        var canGoForward = this.webView.canGoForward();
        this.nextArrow.setAlpha(canGoForward ? 1.0 : 0.6);
        this.nextArrow.setState(canGoForward ? UI.State.Normal : UI.State.Disabled);

        var canGoBack = this.webView.canGoBack();
        this.prevArrow.setAlpha(canGoBack ? 1.0 : 0.6);
        this.prevArrow.setState(canGoBack ? UI.State.Normal : UI.State.Disabled);
    },
    
	viewWillAppear: function($super, animated) {
		$super(animated);
		this.layoutSubviews();
	},
	
	setFrame: function() {
		UI.View.prototype.setFrame.apply(this, arguments);
		this.layoutSubviews();
	},
	
	layoutSubviews: function() {
		var bounds = this.getBounds();
		var webViewFrame = this.getBounds();
		
		if(this.bottomBar) {
			var barHeight = $mc.dip(44);
			this.bottomBar.setFrame(0, bounds[3] - barHeight, bounds[2], barHeight);
			webViewFrame[3] -= barHeight;

			var loadingFrame = [0,0,25,25];
			loadingFrame[0] = Math.floor((bounds[2] - loadingFrame[2]) / 2);
			loadingFrame[1] = Math.floor((barHeight - loadingFrame[3]) / 2);
			this.loadingIndicator.setFrame(loadingFrame);
		
			var donePadding = $mc.dip(6);
			
			var doneFrame = this.doneButton.getFrame();
			doneFrame[2] = $mc.dip(54);
			doneFrame[3] = $mc.dip(29);
			doneFrame[0] = bounds[2] - doneFrame[2] - donePadding;
			doneFrame[1] = Math.floor((barHeight - doneFrame[3]) / 2);
			this.doneButton.setFrame(doneFrame);
			
			var doneOuterWidth = doneFrame[2] + $mc.dip(6);
			
			var arrowFrame = [0,0,0,0];
			arrowFrame[0] = doneOuterWidth;
			arrowFrame[1] = 0;
			arrowFrame[2] = Math.floor((bounds[2] - (doneOuterWidth * 2)) / 3);
			arrowFrame[3] = barHeight;
			this.prevArrow.setFrame(arrowFrame);

			arrowFrame[0] = bounds[2] - arrowFrame[2] - doneOuterWidth;
			this.nextArrow.setFrame(arrowFrame);
			
			var borderFrame = [0, 0, bounds[2], $mc.dip(1)];
			this.bottomBorders[0].setFrame(borderFrame);
			
			borderFrame[1] = $mc.dip(1);
			this.bottomBorders[1].setFrame(borderFrame);
		}
		
		this.webView.setFrame(webViewFrame);
	},
	
	dismissViewController: function($super, animated) {
		if(typeof this.onDidFinish == 'function') {
			this.onDidFinish();
		}
		$super(animated);
	},
	
	loadUrl: function(url) {
		this.webView.loadUrl(url);
	},
    
    loadWithCreative: function(cacheLocation) {
		this.webView.loadDocument(cacheLocation);
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
    
    onShouldLoad: function(event) {
        if (this.creativeView.loaded && !this.creativeView.touched) {
            try {
                this.creativeView.adView.currentCreative.getEvents().triggerEvent("touch");
            } catch(e) { }
        }
        this.creativeView.touched = true;
		return true;
	},
	
	onPageEvent: function(event) {
		$mc.log("WebView webgame Page Event: ", JSON.stringify(event));
        var method = event.eventStream.split("?")[0];
        if (method == "setUserAgent") {
            var userAgent = this.getParameterByName(event.eventStream, "ua") || null;
            Controller.setUserAgent(userAgent);
        }
        if(this.browserType == this.Type.Toolbar || this.browserType == this.Type.Navigation || this.browserType == this.Type.Full)
            this.updateArrows();
	},

	onStartLoad: function(event) {
		$mc.log("WebView webgame Page Start Load: ", JSON.stringify(event));
        if(this.browserType == this.Type.Toolbar || this.browserType == this.Type.Navigation || this.browserType == this.Type.Full) {
            this.updateArrows();
            this.loadingIndicator.setVisible(true);
        }
	},

	onPageLoad: function(event) {
		$mc.log("WebView webgame Page Load: ", JSON.stringify(event));
		if (!this.creativeView.loaded) {
			this.creativeView.loaded = true;
			this.creativeView.adView.creativeViewFinishedLoading(this.creativeView, this.creativeView.currentCreative);
            try {
                this.webView.invoke("var uaUrl = \"ngcore://setUserAgent?ua=\" + escape(navigator.userAgent); window.location=uaUrl;");
            } catch (err) {}
		}
        if(this.browserType == this.Type.Toolbar || this.browserType == this.Type.Navigation || this.browserType == this.Type.Full) {
            this.updateArrows();
            this.loadingIndicator.setVisible(false);
        }
	},

	onError: function(event) {
		$mc.log("WebView webgame Error: ", JSON.stringify(event));
        if(this.browserType == this.Type.Toolbar || this.browserType == this.Type.Navigation || this.browserType == this.Type.Full) {
            this.updateArrows();
            this.loadingIndicator.setVisible(false);
        }
	},
    
	destroy: function($super) {
		if(this.bottomBar) {
			this.prevArrow.removeFromParent();
			this.nextArrow.removeFromParent();
			this.doneButton.removeFromParent();
			this.loadingIndicator.removeFromParent();
			this.bottomBorders[0].removeFromParent();
			this.bottomBorders[1].removeFromParent();
			
			try { this.prevArrow.destroy(); } catch (e) { }
			try { this.nextArrow.destroy(); } catch (e) { }
			try { this.doneButton.destroy(); } catch (e) { }
			try { this.loadingIndicator.destroy(); } catch (e) { }
			try { this.bottomBorders[0].destroy(); } catch (e) { }
			try { this.bottomBorders[1].destroy(); } catch (e) { }

			this.removeChild(this.bottomBar);
			this.bottomBar.release();
			this.bottomBar = null;
		}
		
		this.removeChild(this.webView);
		this.webView.release();
        try {
            Device.NetworkEmitter.removeListener(this.proxyListener);
        } catch (e) {}
        try {
            Device.KeyEmitter.removeListener(this.keyListener);
        } catch (e) {}

		$super();
	}
});
