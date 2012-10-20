/**
 * @author lucnd
 */
var ScreenManager		 = require('../../../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GUIBuilder			 = require('../../../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Scene				 = require('../../../../../NGGo/Framework/Scene/Scene').Scene;
var GL2					 = require('../../../../../NGCore/Client/GL2').GL2;
var MissionDebugSceneController = require('../../controller/MissionDebugSceneController').MissionDebugSceneController;

var debugScene = {
	initialize: function() {
		this.controller = new MissionDebugSceneController();
	},
	
	onEnter: function(prevScene, option) {
		this.node = new GL2.Node();
	    GUIBuilder.loadConfigFromFile("Config/Scene/mission/DebugScene.json", this.controller, function() {
	    	this.node.addChild(this.controller.DebugScene);
	        ScreenManager.getRootNode().addChild(this.node);
	    }.bind(this));
	},
	
	onExit: function(nextScene, option) {
		this.node.destroy();
	}
};

exports.MissionDebugScene = Scene.subclass(debugScene);
