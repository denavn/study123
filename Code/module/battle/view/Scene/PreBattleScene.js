/**
 * @author sonnn
 */
var ScreenManager		         = require('../../../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GUIBuilder			         = require('../../../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Scene				         = require('../../../../../NGGo/Framework/Scene/Scene').Scene;
var SceneFactory                 = require('../../../../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var GL2					         = require('../../../../../NGCore/Client/GL2').GL2;
var PreBattleSceneController	 = require('../../controller/PreBattleSceneController').PreBattleSceneController;
var BattleScene                  = require('../../view/Scene/BattleScene').BattleScene;

var preBattleScene = {
	initialize: function() {
	    SceneFactory.register(BattleScene, "BATTLE_SCENE");
		this.controller = new PreBattleSceneController();
	},
	
	onEnter: function(prevScene, option) {
		this.node = new GL2.Node();
		console.log("SON:in debugScene1");
	    GUIBuilder.loadConfigFromFile("Config/Scene/battle/PreBattleScene.json", this.controller, function() {
	    	console.log("SON:in debugScene2:"+this.controller);
	    	this.node.addChild(this.controller.DebugScene);
	        ScreenManager.getRootNode().addChild(this.node);
	        console.log("SON:in debugScene3");
	    }.bind(this));
	},
	
	onExit: function(nextScene, option) {
		this.node.destroy();
	}
};

exports.PreBattleScene = Scene.subclass(preBattleScene);
