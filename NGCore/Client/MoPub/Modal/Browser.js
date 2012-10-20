var UI = require('../../UI').UI;
var View = require('../../UI/View').View;
var WebView = require('../../UI/WebView').WebView;

var Utils = require('../Core/Utils').Utils;
var ViewController = require('./ViewController').ViewController;

var Browser = exports.Browser = ViewController.subclass({
	classname: 'Browser',

	initialize: function($super) {
		$super();
		
		this._initializeWebView();
		this._initializeNavigationBar();
		this._initializeBackButtonListener(0xffffffff);
	},
	
	_initializeWebView: function() {
		this.webView = new WebView();
		this.webView.setBackgroundColor('FF00');
		this.addChild(this.webView);
	},
	
	_initializeNavigationBar: function() {
		var self = this;
		var isIOS = Utils.isIOS();
		var p = {
			barGradient: isIOS ? 
				["FF00 0.0", "FFD8DEE6 0.01", "FFB0BCCD 0.02", "FF879AB3 0.5", "FF8094AE 0.5", "FF6D83A1 1.0"] :
				["FF7A 0.0", "FFF9 0.01", "FFE6 0.02", "FFCE 1.0"],
			barOuterLine: isIOS ? "FF2D3034 1.0" : "FF00 1.0",
			barInnerLine: isIOS ? "FFD8DEE6 1.0" : "FF00 1.0",	
			normalTextColor: isIOS ? "FF" : "FF85",
			normalTextShadow: isIOS ? "FF485564 1.0 {0,-1}" : "FF88 1.0 {0,-1}", 
			pressedTextColor: isIOS ? "FF66" : "FF",
			btnNormalTextColor: isIOS ? "FF" : "FF00",
			btnNormalGradient: isIOS ? ["FF7A9DE9 0.0", "FF376FE0 0.5", "FF2260DD 0.5", "FF2362DD 1.0"] :
				["FFF5 0.0", "FFCE 1.0"],
			btnNormalOuterLine: isIOS ? "FF1C49B4 1.0" : "FFAE 1.0", 
			btnNormalOuterShadow: isIOS ? "FF9BAABF 0.0 {0,-1}" : "FF88 1.0 {0,-1}",
			btnNormalInnerShadow: isIOS ? "FF 0.0 {0,0}" : "FF 0.0 {0,1}",
			btnPressedTextColor: isIOS ? "FF" : "FF",
			btnPressedGradient: isIOS ? ["FF7C87A4 0.0", "FF3A4E78 0.5", "FF253C6A 0.5", "FF263E6C 1.0"] :
				["FF7A 0.0", "FF91 1.0"],
			btnPressedOuterLine: isIOS ? "FF1D3051 1.0" : "FFAD 1.0",
			btnPressedOuterShadow: isIOS ? "FF9BAABF 0.0 {0,-1}" : "FF88 1.0 {0,-1}",
			btnPressedInnerShadow: isIOS ? "FF 0.0 {0,0}" : "FF9C 1.0 {0,1}"
		};
		
		// Navigation Toolbar
		this.navigationBar = new View();
		this.navigationBar.setGradient({
			gradient: p.barGradient
		}, UI.State.Normal);
		this.addChild(this.navigationBar);
		
		// Close Button
		var radius = Utils.dp(3);
		var corners = [radius, radius, radius, radius].join(' ');
		
		this.closeButton = new UI.Button({
			text: 'Close',
			textColor: p.btnNormalTextColor,
			textFont: UI.FontStyle.Bold,
			textGravity: UI.ViewGeometry.Gravity.Center,
			textShadow: p.normalTextShadow,
			textSize: 14
		});
		this.closeButton.setTextColor(p.btnPressedTextColor, UI.State.Pressed);
		this.closeButton.setGradient({
			corners: corners,
			gradient: p.btnNormalGradient,
			innerShadow: p.btnNormalInnerShadow,
			outerLine: p.btnNormalOuterLine
		});
		this.closeButton.setGradient({
			corners: corners,
			gradient: p.btnPressedGradient,
			innerShadow: p.btnPressedInnerShadow,
			outerLine: p.btnPressedOuterLine
		}, UI.State.Pressed);
		this.closeButton.setOnClick(function() {
			self.dismiss();
		});
		this.navigationBar.addChild(this.closeButton);
		
		
		// Back Arrow
		this.backArrow = new UI.Button({
			text: isIOS ? '<' : '◀',
			textColor: p.normalTextColor,
			textFont: UI.FontStyle.Bold,
			textGravity: UI.ViewGeometry.Gravity.Center,
			textShadow: p.normalTextShadow,
			textSize: 24
		});
		this.backArrow.setTextColor(p.pressedTextColor, UI.State.Pressed);
		this.backArrow.setOnClick(function() {
			self.webView.goBack();
		});
		this.navigationBar.addChild(this.backArrow);
		
		// Forward Arrow
		this.forwardArrow = new UI.Button({
			text: isIOS ? '>' : '▶',
			textColor: p.normalTextColor,
			textFont: UI.FontStyle.Bold,
			textGravity: UI.ViewGeometry.Gravity.Center,
			textShadow: p.normalTextShadow,
			textSize: 24
		});
		this.forwardArrow.setTextColor(p.pressedTextColor, UI.State.Pressed);
		this.forwardArrow.setOnClick(function() {
			self.webView.goForward();
		});
		this.navigationBar.addChild(this.forwardArrow);
		
		// Loading Indicator
		this.loadSpinner = new UI.Spinner();
		this.navigationBar.addChild(this.loadSpinner);
		
		// WebView Callbacks
		this.webView.setOnExternalLink(function(event) {
			self.dismiss();
		});
		
		this.webView.setOnPageevent(function(event) {
			self._updateNavigationButtons();
		});
		
		this.webView.setOnStartload(function(event) {
			self._updateNavigationButtons();
			self.loadSpinner.setVisible(true);
		});

		this.webView.setOnPageload(function(event) {
			self._updateNavigationButtons();
			self.loadSpinner.setVisible(false);
		});

		this.webView.setOnError(function(event) {
			self._updateNavigationButtons();
			self.loadSpinner.setVisible(false);
		});
		
		this.webView.setOnLoad(function(event) {
			self._updateNavigationButtons();
		});
	},
	
	_updateNavigationButtons: function() {
		var canGoForward = this.webView.canGoForward();
		this.forwardArrow.setAlpha(canGoForward ? 1.0 : 0.4);
		this.forwardArrow.setState(canGoForward ? UI.State.Normal : UI.State.Disabled);
		
		var canGoBack = this.webView.canGoBack();
		this.backArrow.setAlpha(canGoBack ? 1.0 : 0.4);
		this.backArrow.setState(canGoBack ? UI.State.Normal : UI.State.Disabled);
	},
	
	loadUrl: function(url) {
		this.webView.loadUrl(url);
	},
	
	layoutSubviews: function() {
		var w = this.screenSize.width;
		var h = this.screenSize.height;
		
		var navigationBarHeight = Utils.dp(48);
		var arrowHeight = Utils.dp(34);
		var arrowWidth = Utils.dp(34);
		var arrowY = Math.round((navigationBarHeight - arrowHeight) / 2);
		var spinnerSide = Utils.dp(30);
		var spinnerY = Math.round((navigationBarHeight - spinnerSide) / 2);
		var closeWidth = Utils.dp(56);
		var closeHeight = Utils.dp(32);
		var closeY = Math.round((navigationBarHeight - closeHeight) / 2);
		var paddingX = Math.round((w - 2 * arrowWidth - spinnerSide - closeWidth) / 5);

		this.webView.setFrame(0, 0, w, h - navigationBarHeight);
		this.navigationBar.setFrame(0, h - navigationBarHeight, w, navigationBarHeight);
		
		this.backArrow.setFrame(paddingX, arrowY, arrowWidth, arrowHeight);
		this.forwardArrow.setFrame(arrowWidth + 2 * paddingX, arrowY, arrowWidth, arrowHeight);
		this.loadSpinner.setFrame(2 * arrowWidth + 3 * paddingX, spinnerY, spinnerSide, spinnerSide);
		this.closeButton.setFrame(w - closeWidth - paddingX, closeY, closeWidth, closeHeight);
	},
	
	_destroyWebView: function() {
		this.webView.setOnExternalLink(function(event) {});
		this.webView.setOnPageevent(function(event) {});
		this.webView.setOnStartload(function(event) {});
		this.webView.setOnPageload(function(event) {});
		this.webView.setOnError(function(event) {});
		this.webView.setOnLoad(function(event) {});
		
		this.webView.removeFromParent();
		this.webView.destroy();
	},
	
	_destroyNavigationBar: function() {
		// Destroy navigationBar components
		this.closeButton.removeFromParent();
		this.closeButton.destroy();
		
		this.backArrow.removeFromParent();
		this.backArrow.destroy();
		
		this.forwardArrow.removeFromParent();
		this.forwardArrow.destroy();
		
		this.loadSpinner.removeFromParent();
		this.loadSpinner.destroy();
		
		// Destroy navigationBar
		this.navigationBar.removeFromParent();
		this.navigationBar.destroy();
	},
	
	destroy: function($super) {
		this._destroyWebView();
		this._destroyNavigationBar();
		this.removeFromParent();
		
		$super();
	}
});
