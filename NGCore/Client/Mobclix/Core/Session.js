//
//  Mobclix.Core.Session.js
//  Mobclix Mobage SDK
//
//  Copyright 2011 Mobclix. All rights reserved.
//

var Core = require('../../Core').Core;
var $mc = require('./Utils').Utils;

exports.Session = Core.Class.singleton({
	identifier: null,
	connectionType: null,

	initialize: function() {

	},
	
	renewIdentifier: function() {
		this.identifier = $mc.sha1(Core.Capabilities.getUniqueId() + Core.Time.getRealTime());
		$mc.log("Generated session identifier: " + this.identifier);
	},
	
	update: function() {
		
	},
	
	destroy: function() {
		this.identifier = null;
		this.connectionType = null;
	}
});
