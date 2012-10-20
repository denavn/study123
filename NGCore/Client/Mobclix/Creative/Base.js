//
//  Mobclix.Creative.Base.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../../Core').Core;
var MMClass = require('../Core/MMClass').MMClass;
var $mc = require('../Core/Utils').Utils;

var Action = require('./Action').Action;
var Events = require('./Events').Events;

// Creative Types
exports.Types = {
	Web: 1,
	Text: 2,
	Banner: 3
};

exports.Base = MMClass.subclass(
/** @lends Mobclix.Creative.Base.prototype */
{
	__className: "Mobclix.Creative.Base",

	// @public properties
	identifier: "",
	type: null,
	events: null,
	properties: {},
	action: null,
	requestParameters: {},

	/**
	 * @class Base class for different creative types.
	 * @constructs The default constructor. 
	 * @param	$super This parameter is stripped out during execution. Do not supply it.
	 * @param	{object} obj	JSON creative used to create this model
	 * @private
	 */
	initialize: function($super, obj) {
		$super();
		var x = 0;

		try {
			this.identifier = obj.creative.id || "";
		} catch(e) {
			this.identifier = "";
		}

		var creativeType = null;
		try {
			creativeType = obj.creative.type || "web";
		} catch(e) {
			creativeType = "web";
		}

		switch(creativeType) {
			case 'html':
			case 'web':
			default:
				this.type = exports.Types.Web;
		}
		
		try {
			this.properties = obj.creative.props || {};
		} catch(e) {
			this.properties = {};
		}

		try {
			if(obj.creative.action) {
				this.action = new Action(obj.creative.action);
			}
		} catch (e) { }

		try {
			var eventUrls = null;
			try {
				eventUrls = obj.creative.eventUrls || {};
			} catch(e) {
				eventUrls = null;
			}

			this.events = new Events(eventUrls);
		} catch(e) {
			$mc.log("Exception creating events.. ", e);
		}
		
		try {
			this.requestParameters = this.properties.params || {};
		} catch(e) {
			this.requestParameters = {};
		}
	},
	
	getAction: function() {
		return this.action;
	},
	
	getEvents: function() {
		return this.events;
	},
	
	// Destructor
	destroy: function($super) {
		$mc.log("Destroying creative");
		this.identifier = null;
		this.type = null;
		this.events = null;
		this.properties = null;
		if(this.action) this.action.release();
		this.requestParameters = null;
		$super();
	}
	
});

