/**
 * @author sonnn
 */
var ScreenManager = require('../../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GUIBuilder = require('../../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Scene = require('../../../../NGGo/Framework/Scene/Scene').Scene;
var GL2 = require('../../../../NGCore/Client/GL2').GL2;
var HUDController = require('../../../controller/HUDController').HUDController;
var Core = require('../../../../NGCore/Client/Core').Core;
var SceneDirector = require('../../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var GLUI = require('../../../../NGGo/GLUI').GLUI;

var hudObj = {
	initialize: function() {
		this.controller = new HUDController();
	},
	
	onEnter: function(preScene, option) {
		this.node = new GL2.Node();
	    GUIBuilder.loadConfigFromFile("Config/Scene/HUDScene.json", this.controller, function ()
	    {
	    	this.node.addChild(this.controller.HUD);
	        ScreenManager.getRootNode().addChild(this.node);
	    }.bind(this));
	},
	
	onExit: function(nextScene, option) {
		this.node.destroy();
	},
	
	updateHpBar: function(playerHp, enemyHp) {
		if(playerHp) {
			this.PlayerHp.setSize(playerHp, 15);
		}
		if(enemyHp) {
			this.EnemyHp.setSize(enemyHp, 15);
		}
	}
};

exports.HUDScene = Scene.subclass(hudObj);