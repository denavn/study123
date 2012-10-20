//
//  Mobclix.ViewController.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../Core').Core;
var UI = require('../UI').UI;
var MMView = require('./Core/MMView').MMView;
var $mc = require('./Core/Utils').Utils;

var ViewController = exports.ViewController = MMView.subclass(
/** @lends Mobclix.ViewController.prototype */
{
	__className: "Mobclix.ViewController",
	_isPresented: false,
	initialize: function($super) {
		$super();
		
		this.setBackgroundColor("00");
	},
	
	presentViewController: function(animated) {
		animated = animated || false;

		var Window = require('../UI/Window').Window;
		var screenSize = {width: Window.getWidth(), height: Window.getHeight()};
		
		var startFullScreenFrame = [0, screenSize.height, screenSize.width, screenSize.height];
		var finalFullScreenFrame = [0, 0, screenSize.width, screenSize.height];
		this.setFrame(startFullScreenFrame);
		
		this.viewWillAppear(animated);
		Window.document.addChild(this);
		var self = this;
		
		if(animated) {
			UI.animate(function() {
				self.setFrame(finalFullScreenFrame);
			}, 300, function() {
				self.viewDidAppear(true);
			});
		} else {
			this.setFrame(finalFullScreenFrame);
			this.viewDidAppear(false);
		}
	},
	
	dismissViewController: function(animated) {
		$mc.log("animated: ", animated);
		animated = animated || false;
		this.viewWillDisappear(animated);
		var self = this;

		var Window = require('../UI/Window').Window;
		if(animated) {
			UI.animate(function() {
				self.setFrame([0, Window.getHeight(), Window.getWidth(), Window.getHeight()]);
			}, 300, function() {
				self.removeFromParent();
				self.viewDidDisappear(true);
			});
		} else {
			this.removeFromParent();
			this.viewDidDisappear(false);
		}
	},
	
	isPresented: function() {
		return this._isPresented;
	},

	viewWillAppear: function(animated) {
		this.retain();
		this._isPresented = true;
	},
	
	viewDidAppear: function(animated) {
	},
	
	viewWillDisappear: function(animated) {
		this._isPresented = false;
	},
	
	viewDidDisappear: function(animated) {
		this.release();
	},
	
	destroy: function($super) {
		$super();
	}
});
