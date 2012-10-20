//
//  Mobclix.Core.MMArray.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var MMClass = require('./MMClass').MMClass;
var $mc = require('./Utils').Utils;

var MMArray = exports.MMArray = MMClass.subclass({
	__className: "MMArray",
	___array: null,
	length: 0,
	
	initialize: function($super) {
		$super();
		this.___array = new Array();
	},
	
	get: function(index) {
		return this.___array[index];
	},
	
	set: function(index, element) {
		if(this.___array[index]) {
			try { this.___array[index].release(); } catch (e) { }
		}
		
		this.___array[index] = element;
		try { this.___array[index].retain(); } catch(e) { }
		
		this.length = this.___array.length;
	},
	
	remove: function(index) {
		var element = this.___array[index];
		this.___array = this.___array.slice(0, index).join(this.___array.slice(index+1));
		try { element.release(); } catch (e) { }
		this.length = this.___array.length;
	},
	
	push: function() {
		for(var i = 0; i < arguments.length; i++) {
			var element = arguments[i];
			$mc.log("Adding " + element.__description()  + " to " + this.__description());
			this.___array.push(element);
			try { element.retain(); } catch(e) {}
		}
		this.length = this.___array.length;
	},
	
	pop: function() {
		var element = this.___array.pop();
		try { element.release(); } catch(e) { }
		this.length = this.___array.length;
		return element;
	},
	
	valueOf: function() {
		return this.___array.valueOf();
	},
	
	toString: function() {
		return this.___array.toString();
	},
	
	reverse: function() {
		this.___array.reverse();
	},
	
	indexOf: function(element) {
		for(var i = 0; i < this.___array.length; i++) {
			if(element == this.___array[i]) {
				return i;
			}
		}
		
		return -1;
	},
	
	each: function(callback) {
		for(var i = 0; i < this.___array.length; i++) {
			if(callback(this.___array[i], i) === false) break;
		}
	},
	
	destroy: function($super) {
		var self = this;
		this.each(function(element) {
			$mc.log("Removing " + element.__description()  + " from " + self.__description());
			try { element.release(); } catch(e) { }
		});
		
		this.length = this.___array.length;
		this.___array = null;

		$super();
	}
});
