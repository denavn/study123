/**
 * @author sonnn
 */
var ScreenManager		 = require('../../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GUIBuilder			 = require('../../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Scene				 = require('../../../../NGGo/Framework/Scene/Scene').Scene;
var GL2					 = require('../../../../NGCore/Client/GL2').GL2;
var SceneDirector 		 = require('../../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var TestSceneController	 = require('../../../controller/TestSceneController').TestSceneController;

var testScene = {
	initialize: function() {
		this.controller = new TestSceneController();
	},
	
	onEnter: function(prevScene, option) {
		this.node = new GL2.Node();
	    GUIBuilder.loadConfigFromFile("Config/Scene/TestScene.json", this.controller, function ()
	    {
	    	ScreenManager.getRootNode().addChild(this.node);
	    	this.controller.HUD.setDepth(65535);
	    	this.controller.MainGame.setDepth(0);
	    	this.node.addChild(this.controller.HUD);
	    	this.node.addChild(this.controller.MainGame);
	    	
	    	this.controller.setup();
	    }.bind(this));
	},
	
	onExit: function(nextScene, option) {
		this.node.destroy();
	}
};

exports.TestScene = Scene.subclass(testScene);
