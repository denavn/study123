//
//  Mobclix.Core.SessionTracking.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../../Core').Core;
var Storage = require('../../Storage').Storage;
var Config = require('./Config').Config;
var $mc = require('./Utils').Utils;
var Session = require('./Session').Session;

exports.SessionTracking = Core.Class.subclass({
	offlineSessionCount: 0,
	sessionStartDate: null,
	sessionWentIdleDate: null,
	sessionEndDate: null,
	idleSessionTime: 0.0,
	lastSessionLength: 0.0,
	dataFile: null,
	firstRun: false,
	
	initialize: function($super, controller) {
		if($super) $super();

		this.dataFile = "MobclixSessionTracking-" + controller.getApplicationId() + ".json";
		
		this.offlineSessionCount = 0;
		this.lastSessionLength = 0.0;
		this.idleSessionTime = 0.0;
		this.firstRun = true;
		
		var self = this;

		this.loadSessionTrackingData(function() {
			if(self.lastSessionLength == 0 && self.sessionWentIdleDate) {
				self.sessionEndDate = self.sessionWentIdleDate;
				self.lastSessionLength = (self.sessionEndDate.getTime() - self.sessionStartDate.getTime()) / 1000;
			}

			self.startNewSession();
		});
	},
	
	startNewSession: function() {
		this.sessionStartDate = new Date();
		this.sessionWentIdleDate = null;
		this.sessionEndDate = null;
	},

	// Application State Tracking

	didBecomeActive: function() {
		if(!this.sessionWentIdleDate) return; // First launch.

		var now = new Date();
		var idleInterval = (now.getTime() - this.sessionWentIdleDate.getTime()) / 1000;
		$mc.log("idleInterval: ", idleInterval);

		if(idleInterval >= Config.getIdleTimeoutInterval()) {
			$mc.log("Starting new session!");
			this.lastSessionLength = (this.sessionWentIdleDate.getTime() - this.sessionStartDate.getTime()) / 1000;
			Session.renewIdentifier();
			Config.updateConfiguration(require('./Controller').Controller);
			this.startNewSession();
		} else if(Config.hasConfigFailed()) {
			this.offlineSessionCount--; // Config will auto-increase this if it fails again.
			Config.updateConfiguration(require('./Controller').Controller);
		} else {
			this.idleSessionTime += idleInterval;
			$mc.log("Within idle timeout range: ", Config.getIdleTimeoutInterval());
		}

		this.saveSessionTrackingData();
	},
	
	willGoInactive: function() {
		this.sessionWentIdleDate = new Date();
		this.saveSessionTrackingData();
	},

	willTerminate: function() {
		this.sessionEndDate = new Date();
		this.lastSessionLength = (this.sessionEndDate.getTime() - this.sessionStartDate.getTime()) / 1000;
		this.saveSessionTrackingData();
	},
	
	// Session Tracking Data Management
	
	loadSessionTrackingData: function(callback) {
		Storage.FileSystem.readFile(this.dataFile, {}, function(error, value) {
			try {
				value = eval("("+value+")");
			} catch(e) { }
			
			if(value && typeof value == 'object' && value.length > 0) {
				this.offlineSessionCount = $mc.parseDouble(value.offlineSessionCount) || 0.0;
				
				this.idleSessionTime = $mc.parseDouble(value.idleSessionTime) || 0.0;
				
				if(value.sessionStartDate) {
					try { this.sessionStartDate = new Date(value.sessionStartDate); } catch (e) { }
				}
				
				if(value.sessionWentIdleDate) {
					try { this.sessionWentIdleDate = new Date(value.sessionWentIdleDate); } catch (e) { }
				}
				
				if(value.sessionEndDate) {
					try { this.sessionEndDate = new Date(value.sessionEndDate); } catch (e) { }
				}
				
				this.lastSessionLength = $mc.parseDouble(value.lastSessionLength) || 0.0;

				if(value.firstRun) {
					this.firstRun = $mc.parseBool(value.firstRun);
				}
			}
			
			callback();
		});
	},
	
	saveSessionTrackingData: function() {
		var data = {};
		data.offlineSessionCount = this.offlineSessionCount;
		data.idleSessionTime = this.idleSessionTime;
		data.lastSessionLength = this.lastSessionLength;
		data.firstRun = this.firstRun ? "true" : "false";

		if(this.sessionStartDate) {
			data.sessionStartDate = this.sessionStartDate.toString();
		}

		if(this.sessionWentIdleDate) {
			data.sessionWentIdleDate = this.sessionWentIdleDate.toString();
		}

		if(this.sessionEndDate) {
			data.sessionEndDate = this.sessionEndDate.toString();
		}

		try {
			Storage.FileSystem.writeFile(this.dataFile, JSON.stringify(data));
		} catch(e) { }
	},
	
	
	// Clean up
	
	destroy: function($super) {
		this.sessionEndDate = null;
		this.sessionStartDate = null;
		this.sessionWentIdleDate = null;
		this.originalUDID = null;

		dataFile.release();
		_environment.release();
		
		if($super) $super();
	}
});
