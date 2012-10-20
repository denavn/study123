var Core = require('../../Core').Core;
var Device = require('../../Device').Device;
var UI = require('../../UI').UI;
var View = require('../../UI/View').View;

var Utils = require('../Core/Utils').Utils;
var ViewControllerRegistry = require('../Core/ViewControllerRegistry').ViewControllerRegistry;

var ViewController = exports.ViewController = View.subclass({
	classname: 'ViewController',
	
	$getUniqueIdentifier: function() {
		if (this.identifier === undefined) {
			this.identifier = 0;
		}
		return this.identifier++;
	},

	initialize: function($super) {
		$super();

		var self = this;
		this.identifier = ViewController.getUniqueIdentifier();
		
		this.applicationPriorOrientation = Device.OrientationEmitter.getInterfaceOrientation();
		this.lockedOrientation = null;
		this.visible = false;
		
		this.screenSize = {width: UI.Window.getWidth(), height: UI.Window.getHeight()};
		this._updateFramesForScreenSize(this.screenSize);
		
		this.setBackgroundColor('ff000000');

		this.onWillAppear = function() {};
		this.onDidAppear = function() {};
		this.onWillDisappear = function() {};
		this.onDidDisappear = function() {};
		
		this.isPresenting = false;
		
		this._initializeLayoutListener();
		this._initializeBackButtonListener();
	},

	_initializeLayoutListener: function() {},
	
	_initializeBackButtonListener: function(priority) {
		priority = priority || 0;
		var self = this;
		this.backListener = Utils.createGenericListener();
		Device.KeyEmitter.addListener(this.backListener, function(keyEvent) {
			if (keyEvent.code === Device.KeyEmitter.Keycode.back && self.isVisible()) {
				self.dismiss();
				return true;
			}
		}, priority);
	},

	_updateFramesForScreenSize: function(size) {
		this.startFrame = [0, size.height, size.width, size.height];
		this.finalFrame = [0, 0, size.width, size.height];
	},

	present: function() {
		var self = this;
		
		this.onPresenting = true;
		this.onWillAppear();

		this.applicationPriorOrientation = Device.OrientationEmitter.getInterfaceOrientation();
		
		this.setFrame(self.startFrame);
		this.layoutSubviews();
		
		UI.Window.document.addChild(self);

		UI.animate(function() {
			self.setFrame(self.finalFrame);
		}, 400, function() {
			self.visible = true;
			ViewControllerRegistry.add(self);
			self.onDidAppear();
		});

		this.isPresenting = false;
	},

	dismiss: function() {
		var self = this;
		
		this.onWillDisappear();

		UI.animate(function() {
			self.setFrame(self.startFrame);
		}, 400, function() {
			self.visible = false;
			ViewControllerRegistry.remove(self);
			self.removeFromParent();
			self.onDidDisappear();
		});
	},

	isVisible: function() {
		return this.visible;
	},
	
	layoutSubviews: function($super) {
		$super();
	},
	
	setLockedOrientation: function(lockedOrientation) {
		if (lockedOrientation === Device.OrientationEmitter.Orientation.Portrait ||
			lockedOrientation === Device.OrientationEmitter.Orientation.LandscapeLeft) {
			this.lockedOrientation = lockedOrientation;
		} else {
			this.lockedOrientation = null;
		}
	},

	setOnWillAppear: function(callback) {
		this.onWillAppear = callback;
	},

	setOnDidAppear: function(callback) {
		this.onDidAppear = callback;
	},
	
	setOnWillDisappear: function(callback) {
		this.onWillDisappear = callback;
	},
	
	setOnDidDisappear: function(callback) {
		this.onDidDisappear = callback;
	},
	
	destroy: function($super) {
		Device.KeyEmitter.removeListener(this.backListener);
		$super();
	}
});
