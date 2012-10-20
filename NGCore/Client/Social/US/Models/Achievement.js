var GSGlobals 	= require("../../_Internal/GSGlobals");
var DataModelR  = require("./DataModel");
var Dispatcher  = require("../Data/Dispatcher").Dispatcher;

/**
	// MAX: TODO: DOCUMENT 
 */

var Achievement = exports.Achievement = DataModelR.DataModel.subclass({
		
	classname: "Achievement",

	properties: [
		"description",
		"points",
		"category",
		"unlocked",
		"name",
		"index",
		"icon_url"
	],
	
	initialize: function($super, recordID){

		$super(recordID);
	},

	// cb signature: function(data, err), err is null if no error
	// data will have success: true, and points:___ with some # of points
	unlockAchievement: function(cb) {
		Dispatcher.callMethodOnRemoteObject(this, "unlockAchievement", [cb]);
	}

});