//
//  Mobclix.Core.MMClass.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../../Core').Core;
var $mc = require('./Utils').Utils;
var __internalMMClassCounter = 0;

exports.Memory =
/** @lends Mobclix.Core.MMClass.prototype */
{
	__className: "MMClass",
	retainCount: 0,
	__instanceId: 0,

	/**
	 * @class MMClass provides a base foundation for memory managed objects
	 * @description Any objects that subclass MMClass will have their memory managed for them
	 * @constructs The default constructor. 
	 * @param $super This parameter is stripped out during execution. Do not supply it.
	 * @private
	 */
	initialize: function($super) {
		if($super) $super();
		this.__instanceId = ++__internalMMClassCounter;
		// $mc.log("--- initialized: "+this.__description()+" ---");
		this.retain();
	},
	
	/**
	 * Redirects all calls to $addProperty
	 * @private
	 * @see Mobclix.Utils#$addProperty
	 * @function
	 * @static
	 */
	$addProperty: function(propName, shouldRetain, defaultValue) {
		$mc.addProperty(this, propName, shouldRetain, defaultValue);
	},
	
	/**
	 * Gets the description of the current object
	 *  @private
	 */
	__description: function() {
		var hash = this.__instanceId.toString();
		while(hash.length < 5) 	hash = "0" + hash;

		return "[" + this.__className + " 0x" + hash + "]";
	},
	
	/**
	 * Increase the instances retain count by one
	 * @return	current instance
	 * @private
	 */
	retain: function() {
		this.retainCount++;
		// $mc.log("--- retained: "+this.__description()+", new count: "  + this.retainCount + " ---");
		return this;
	},
	
	/**
	 * Schedules {@link #release} to be called at the start of the next run loop
	 * @see Mobclix.Core.MMClass.release
	 * @return	current instance
	 * @private
	 */
	autorelease: function() {
		var self = this;
		setTimeout(function() {
			self.release();
		}, 1);
		return this;
	},
	
	/**
	 * Decreases the instances retain count by one
	 * If the retainCount hits 0, the object will call {@link #destroy}.
	 * @see Mobclix.Core.MMClass.destroy
	 * @private
	 */
	release: function() {
		this.retainCount--;

		// $mc.log("--- released: "+this.__description()+", new count: "  + this.retainCount + " ---");
		
		if(this.retainCount <= 0) {
			this.destroy();
		}
	},
	
	/**
	 * Convers the object to a useable string format
	 * @private
	 */
	toString: function() {
		return "[" + this.__className + " object]";
	},
	
	/**
	 * @private
	 */
	destroy: function($super) {
		// $mc.log("--- destroy: "+this.__description()+" ---");
		if($super) $super();
	}
	
};

exports.MMClass = Core.Class.subclass(exports.Memory);
