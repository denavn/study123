/**
 * @author sonnn
 */
var ScreenManager		 = require('../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GUIBuilder			 = require('../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Scene				 = require('../../../NGGo/Framework/Scene/Scene').Scene;
var GL2					 = require('../../../NGCore/Client/GL2').GL2;
var MainSceneController	 = require('../../controller/MainSceneController').MainSceneController;

var mainScene = {
	initialize: function() {
		this.controller = new MainSceneController();
	},
	
	onEnter: function(prevScene, option) {
		this.node = new GL2.Node();
	    GUIBuilder.loadConfigFromFile("Config/Scene/MainScene.json", this.controller, function ()
	    {
	    	this.node.addChild(this.controller.MainGame);
	        ScreenManager.getRootNode().addChild(this.node);
	    }.bind(this));
	},
	
	onExit: function(nextScene, option) {
		this.node.destroy();
	}
};

exports.MainScene = Scene.subclass(mainScene);
