//
//  Mobclix.Creative.Action.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var MMClass = require('../Core/MMClass').MMClass;
var $mc = require('../Core/Utils').Utils;
var Browser = require('../Browser').Browser;

exports.Action = MMClass.subclass({
	
	__className: "Mobclix.Creative.Action",
	action: null,
	events: null,
	
	initialize: function($super, obj) {
		$super();
		
		this.action = obj;
		
		var eventUrls = null;
		try {
			eventUrls = obj.creative.eventUrls || {};
		} catch(e) {
			eventUrls = null;
		}
		
		this.events = new Events(eventUrls);
	},
	
	shouldAutoplay: function() {
		return $mc.parseBool(this.action.autoplay) || false;
	},
	
	getEvents: function() {
		return this.events;
	},
	
	getUrl: function() {
		return this.action.url || null;
	},
	
	getBrowserType: function() {
		try {
			var browserType = this.action.browserType.toLowerCase();
			
			if(browserType == "minimal") {
				return Browser.Type.Minimal;
			} else if(browserType == "full") {
				return Browser.Type.Full;
			} else if(browserType == "navigation") {
				return Browser.Type.Navigation;
			} else {
				return Browser.Type.Toolbar;
			}
		} catch(e) {
			$mc.log("Exception getting browser type: ", e);
			return Browser.Type.Toolbar;
		}
	},
	
	destroy: function($super) {
		this.events.release();
		$super();
	}
	
});
