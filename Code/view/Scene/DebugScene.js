/**
 * @author sonnn
 */
var ScreenManager		 = require('../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GUIBuilder			 = require('../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Scene				 = require('../../../NGGo/Framework/Scene/Scene').Scene;
var GL2					 = require('../../../NGCore/Client/GL2').GL2;
var DebugSceneController	 = require('../../controller/DebugSceneController').DebugSceneController;

var debugScene = {
    sceneName: "DEBUG_SCENE",
	initialize: function() {
		this.controller = new DebugSceneController(this);
	},
	
	onEnter: function(prevScene, option) {
	    Log("VVVVVVVVVVVVVVVVVVVSLRLRSSSSSSSSSSSSS111111112222SSSS");
		this.node = new GL2.Node();
		console.log("SON:in debugScene1");
	    GUIBuilder.loadConfigFromFile("Config/Scene/DebugScene.json", this.controller, function() {
	    	console.log("SON:in debugScene2:"+this.controller);
	    	this.node.addChild(this.controller.DebugScene);
	        ScreenManager.getRootNode().addChild(this.node);
	        console.log("SON:in debugScene3");
	    }.bind(this));
	},
	
	onExit: function(nextScene, option) {
		this.node.destroy();
	},
	onResume: function() {
	    Log("VVVVVVVVVVVVVVVVVVVSLRLRSSSSSSSSSSSSSSSSS" + this.node.getTouchable());
	    this.node.setTouchable(true);
	}
};

exports.DebugScene = Scene.subclass(debugScene);
