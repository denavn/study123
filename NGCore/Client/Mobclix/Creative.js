//
//  Mobclix.Creative.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../Core').Core;
var $mc = require('./Core/Utils').Utils;

exports.Creative =
/** @lends Mobclix.Creative.prototype */
{
	Types: require('./Creative/Base').Types,
	Web: require('./Creative/Web').Web,

	/**
	 * Create an Creative model from a JSON objects
	 * @param {object}	JSON creative object
	 * @private
	 */
	Create: function(obj) {
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
				$mc.log("HTML or Unknown ad type detected: ", creativeType);
				return new this.Web(obj);
		}
	}
};
