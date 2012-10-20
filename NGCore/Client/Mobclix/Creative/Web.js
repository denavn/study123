//
//  Mobclix.Creative.Web.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../../Core').Core;
var Base = require('./Base').Base;

exports.Web = Base.subclass(
/** @lends Mobclix.Creative.Web.prototype */
{
	__className: "Mobclix.Creative.Web",

	html: "",
	
	/**
	 * @class Web class for the web creative.
	 * @constructs The default constructor. 
	 * @param $super This parameter is stripped out during execution. Do not supply it.
	 * @param	{object} obj	JSON creative used to create this model
	 * @augments Mobclix.Creative.Base
	 * @private
	 */
	initialize: function($super, obj) {
		$super(obj);
		
		try {
			this.html = this.properties.html || "";
		} catch(e) {
			this.html = "";
		}
	},
	
	/**
	 * Destroys the current object
	 * @private
	 */
	destroy: function($super) {
		this.html = "";
		$super();
	}
});
