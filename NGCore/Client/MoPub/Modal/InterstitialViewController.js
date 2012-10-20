var Device = require('../../Device').Device;

var ChainedLayoutEmitter = require('../Core/ChainedLayoutEmitter').ChainedLayoutEmitter;
var Utils = require('../Core/Utils').Utils;
var ViewController = require('./ViewController').ViewController;
var ViewControllerRegistry = require('../Core/ViewControllerRegistry').ViewControllerRegistry;
var UI = require('../../UI').UI;

var InterstitialViewController = exports.InterstitialViewController = ViewController.subclass({
	initialize: function($super) {
		$super();
		
		this.setLockedOrientation(Device.OrientationEmitter.Orientation.Portrait);
		this._initializeBackButtonListener(0xffffffff);
		this._initializeCloseButton();
		this.webView = null;
		this.browser = null;
	},
	
	_initializeLayoutListener: function() {
		var self = this;

		this.chainedLayoutListener = Utils.createGenericListener();
		ChainedLayoutEmitter.addListener(this.chainedLayoutListener, function(event) {
			self.screenSize.width = event.screenWidth;
			self.screenSize.height = event.screenHeight;
			self._updateFramesForScreenSize(self.screenSize);
			
			if (self.isPresenting) {
				self.setFrame(self.startFrame);
				self.layoutSubviews();
				UI.Window.document.addChild(self);

				UI.animate(function() {
					self.setFrame(self.finalFrame);
				}, 400, function() {
					self.onDidAppear();
				});
				self.visible = true;
				ViewControllerRegistry.add(self);
				self.isPresenting = false;
			}
		});
	},
	
	present: function() {
		if (!ViewControllerRegistry.canShowInterstitial()) {
			console.log('Error. Will not present interstitial over currently existing viewControllers.');
			return false;
		}
		
		this.onWillAppear();

		this.isPresenting = true;
		
		this.applicationPriorOrientation = Device.OrientationEmitter.getInterfaceOrientation();
		
		// Expected Behavior (for valid device orientations)
		if (Utils.isValidOrientation(this.applicationPriorOrientation)) {
			if (this.lockedOrientation === this.applicationPriorOrientation) {
				ChainedLayoutEmitter.chain({
					orientation: this.lockedOrientation,
					screenWidth: UI.Window.getWidth(),
					screenHeight: UI.Window.getHeight()
				});
			}
			else {
				Device.OrientationEmitter.setInterfaceOrientation(this.lockedOrientation);
			}
		}
		
		// Hacky Behavior (when device orientation = 6)
		else {
			if ((UI.Window.getWidth() < UI.Window.getHeight() &&
				this.lockedOrientation === Device.OrientationEmitter.Orientation.LandscapeLeft) ||
				(UI.Window.getWidth() > UI.Window.getHeight() &&
				this.lockedOrientation === Device.OrientationEmitter.Orientation.Portrait)) {
				
				Device.OrientationEmitter.setInterfaceOrientation(this.lockedOrientation);
			}
			else {
				ChainedLayoutEmitter.chain({
					orientation: this.lockedOrientation,
					screenWidth: UI.Window.getWidth(),
					screenHeight: UI.Window.getHeight()
				});
			}
		}
	},

	setOnDidDisappear: function($super, callback) {
		var self = this;
		
		var onDidDisappear = function() {
			callback();
			
			Device.OrientationEmitter.setInterfaceOrientation(self.applicationPriorOrientation);
			Device.OrientationEmitter.emit({
				type: Device.OrientationEmitter.OrientationType.Device,
				orientation: Device.OrientationEmitter.getDeviceOrientation()
			});
		};
		
		$super(onDidDisappear);
	},
	
	_initializeCloseButton: function() {
		var self = this;
		
		var radius = Utils.dp(10);
		var corners = [radius, radius, radius, radius].join(' ');
		var closePadding = Utils.dp(10);
		var closeSide = Utils.dp(40);
		this.closeButton = new UI.Button({
			text: 'x',
			textColor: 'ff000000',
			textGravity: UI.ViewGeometry.Gravity.Center,
			textShadow: 'ff11 2.0 {0, -2}',
			textSize: 26
		});
		this.closeButton.setTextColor('FF88', UI.State.Pressed);
		
		this.closeButton.setGradient({
			corners: corners,
			gradient: ['ffff0000 0.0', 'ffb80000 1.0'],
			outerLine: 'ff00 1.0'
		});
		this.closeButton.setGradient({
			corners: corners,
			gradient: ['ffff9999 0.0', 'ffb89999 1.0'],
			outerLine: 'ff00 1.0'
		}, UI.State.Pressed);
		
		this.closeButton.setOnClick(function() {
			self.dismiss();
		});
		this.closeButton.setFrame(closePadding, closePadding, closeSide, closeSide);
	},
	
	destroy: function($super) {
		this.closeButton.removeFromParent();
		ChainedLayoutEmitter.removeListener(this.chainedLayoutListener);
		$super();
	},
	
	setWebView: function(webView) {
		if (this.webView) {
			this.closeButton.removeFromParent();
			this.webView.removeFromParent();
		}
		this.webView = webView;
		this.addChild(webView);
		this.addChild(this.closeButton);
	},
	
	setBrowser: function(browser) {
		if (this.browser) this.browser.removeFromParent();
		this.browser = browser;
		this.addChild(browser);
	},
	
	showBrowserForUrl: function(url) {
		this.browser.loadUrl(url);
		this.browser.screenSize = this.screenSize;
		this.browser._updateFramesForScreenSize(this.browser.screenSize);
		this.browser.present();
	},
	
	layoutSubviews: function() {
		this.webView.setFrame(0, 0, this.startFrame[2], this.startFrame[3]);
	}
});
