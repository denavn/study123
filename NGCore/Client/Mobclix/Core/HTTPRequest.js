//
//  Mobclix.Core.HTTPRequest.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var MMClass = require('./MMClass').MMClass;
var Network = require('../../Network').Network;
var Utils = require('./Utils').Utils;

exports.HTTPRequest = MMClass.subclass({
	__className: "HTTPRequest",

	success: false,
	loading: false,
	error: false,
	response: null,
	statusCode: 0,
	request: null,
	
	initialize: function() {
		try {
			this.request = new Network.XHR();
		} catch (e) {
			this.request = null;
		}
	},
	
	getStatusCode: function() {
		return this.statusCode;
	},
	
	getResponse: function() {
		return this.response;
	},
	
	getResponseText: function() {
		return this.request.responseText;
	},
	
	wasSuccessful: function() {
		return this.success;
	},
	
	getError: function() {
		return this.error;
	},

	start: function(options) {
		// If we don't have an ajax object, bail out
		if(!this.request) {
			this.error = true;
			if(options.error) options.error(this);
			return false;
		}
		
		// Cleanup options
		if(typeof options != "object") {
			options = {url: options};
		}
		
		// Setup some defaults
		options.type = options.type || "GET";
		options.timeout = options.timeout || 120;
		options.data = options.data || "";
		options.async = options.async || true;
		
		
		// Build data
		if(typeof options.data == "object") {
			var params = options.data;
			options.data = "";

			for(var key in params) {
				options.data += "&" + escape(key) + "=" + escape(params[key]);
			}
			
			if(options.data.length > 0) {
				options.data = options.data.substring(1, options.length);
			}
		} else if(options != null && typeof options != 'undefined') {
			options.data = options.data.toString();
		} else {
			options.data = "";
		}
        
		// Setup state change handler
		var self = this;
		self.retain();

		this.request.onreadystatechange = function() {
			// Check if we're done loading
			if(self.request.readyState != 4) return;
			self.loading = false;
			
			// Store status code
			self.statusCode = self.request.status;

			// See if it's a valid response
			if((self.statusCode >= 200 && self.statusCode < 300) || (!options.async && self.statusCode == 0)) {
				self.success = true;

				if(self.request.getResponseHeader("Content-type").indexOf("json") >= 0 || self.request.getResponseHeader("Content-type").indexOf("javascript") >= 0) {
					try {
						resp = eval("("+self.request.responseText+")");
					} catch (e) {
						resp = null;
					}
					
					if(resp == null || typeof resp == 'undefined') {
						resp = self.request.responseText;
					}
				} else {
					resp = self.request.responseText;
				}
				
				if(options.success) options.success(self, resp);
			} else if(self.request.responseXML) {
				resp = self.request.responseXML;
			} else {
				self.error = true;
				if(options.error) options.error(self, self.statusCode);
			}
			
			self.release();
		};
		
		// Start the request
		if(options.type.toLowerCase() == "get") {
			var url = options.url + (options.url.indexOf("?") >= 0 ? "&" : "?") + options.data;
			this.request.open("GET", url, options.async);

            if (options.userAgent != null)
                this.request.setRequestHeader("User-Agent", options.userAgent);
			this.request.send(null);
		} else {
			this.request.open(options.type, options.url, options.async);
			this.request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			this.request.setRequestHeader("Content-length", options.data.length);
            if (options.userAgent != null)
                this.request.setRequestHeader("User-Agent", options.userAgent);
			this.request.send(options.data);
		}
		
		this.loading = true;
	},
	
	destroy: function($super) {
		// if(this.request) this.request.destroy(); // Network.XHR doesn't have a .destroy() -- what?
		this.request = null;
		this.response = null;
		
		$super();
	}
});
