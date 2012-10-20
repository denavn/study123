//
//  Mobclix.Creative.Events.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var MMClass = require('../Core/MMClass').MMClass;
var $mc = require('../Core/Utils').Utils;
var HTTPRequest = require('../Core/HTTPRequest').HTTPRequest;
var Controller = require('../Core/Controller').Controller;

exports.Events = MMClass.subclass({
	__className: "Mobclix.Creative.Events",
	events: null,
	
	initialize: function($super, obj) {
		$super();
		
		var self = this;
		this.events = {};
		$mc.each(obj, function(urls, key) {
			var normalizedUrls = [];
			$mc.each(urls, function(url) {
				if(url.toString().indexOf("://") != -1) {
					normalizedUrls.push(url);
				}
				
				if(normalizedUrls.length > 0) {
					key = self._normalizeKey(key);
					self.events[key] = normalizedUrls;
				}
			});
		});
	},
	
	triggerEvent: function(name) {
		name = this._normalizeKey(name);
		if(!this.events[name] || this.events[name].length == 0) return;
		
		$mc.each(this.events[name], function(url) {
			var request = new HTTPRequest;
			request.start({
				url: url,
				type: "get",
                userAgent: Controller.getUserAgent()
			});
			request.release();
		});
	},
	
	_normalizeKey: function(key) {
		return key.toString().replace(/^on/i, "").toLowerCase();
	},

	destroy: function($super) {
		this.events.release();
		$super();
	}
	
});
