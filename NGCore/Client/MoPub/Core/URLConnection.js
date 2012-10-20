var Core = require('../../Core').Core;
var Network = require('../../Network').Network;

exports.URLConnection = Core.Class.subclass(
{
	classname: 'URLConnection',
	
	initialize: function() {
		this.onSuccess = function() {};
		this.onFailure = function() {};
		this.options = {};
		this.URL = null;
		this.XHR = new Network.XHR();
	},
	
	setOnSuccess: function(callback) {
		this.onSuccess = callback;
	},
	
	setOnFailure: function(callback) {
		this.onFailure = callback;
	},
	
	setURL: function(URL) {
		this.URL = URL;
	},
	
	setOptions: function(options) {
		this.options = options;
	},
	
	start: function() {
		if (!this.URL) {
			return;
		}
	
		var self = this;
	
		this.XHR.onreadystatechange = function() {
			// We don't need to do anything except when the request has completed (readyState == 4).
			if (self.XHR.readyState !== 4) {
				return;
			}
			
			// status codes 200-399 are valid, otherwise we have a failure
			var statusCode = self.XHR.status;
			if (statusCode < 200 || statusCode >= 400) {
				self.onFailure(self.XHR, statusCode);
				return;
			}
			
			var response = self.XHR.responseText || '';
			self.onSuccess(self.XHR, response);
		};
		
		this.XHR.open('GET', this.URL, true); // method, URL, async
		
		if (this.options['User-Agent']) {
			this.XHR.setRequestHeader('User-Agent', this.options['User-Agent']);
		}
		
		this.XHR.send();
	}
});
