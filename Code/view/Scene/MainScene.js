/**
 * @author sonnn
 */
var ScreenManager		 = require('../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GUIBuilder			 = require('../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Scene				 = require('../../../NGGo/Framework/Scene/Scene').Scene;
var GL2					 = require('../../../NGCore/Client/GL2').GL2;
var MainSceneController	 = require('../../controller/MainSceneController').MainSceneController;
var SceneDirector 		 = require('../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var Sumo		 		 = require('../../model/Entity/Sumo').Sumo;
var Skill		 		 = require('../../model/Entity/Skill').Skill;
var GlobalParameter 	 = require('../../utils/GlobalParameter').GlobalParameter;

var mainScene = {
	initialize: function() {
		this.controller = new MainSceneController();
		
		this.playerSumo = new Sumo();
    	this.playerSumo.setPosition(GlobalParameter.battle.player.x - 250, GlobalParameter.battle.player.y - 150);
    	this.playerSumo.setScale(0.6, 0.6);
		
		this.enemySumo = new Sumo();
		this.enemySumo.setPosition(GlobalParameter.battle.enemy.x + 250, GlobalParameter.battle.enemy.y - 160);
	    this.enemySumo.setScale(-1, 1);
	    
	    this.skill = new Skill();
	    this.skill.setPosition(-500, GlobalParameter.battle.player.y - 150);
	    this.skill.setScale(1, 1);
	    this.skill.setRotation(180);
	    
	    this.playerSumo.setSkill(this.skill);
	    this.enemySumo.setSkill(this.skill);
	    
	    this.controller.offsetX = GlobalParameter.battle.enemy.x + 40 - (GlobalParameter.battle.player.x - 40);
	},
	
	onEnter: function(prevScene, option) {
		this.controller.currentBattle = option;
		this.node = new GL2.Node();
	    GUIBuilder.loadConfigFromFile("Config/Scene/MainScene.json", this.controller, function ()
	    {
	    	ScreenManager.getRootNode().addChild(this.node);
	    	this.controller.HUD.setDepth(65535);
	    	this.controller.MainGame.setDepth(0);
	    	this.node.addChild(this.controller.HUD);
	    	this.node.addChild(this.controller.MainGame);
	    	
	    	this.controller.setup(this.playerSumo, this.enemySumo, this.skill);
	    	
	    }.bind(this));
	},
	
	fightEnemy: function() {
		var setEnemyTurn = function() {
			this.enemyTurn = true;
		}.bind(this);
		
		this.controller.fightEnemy(setEnemyTurn);
	},
	
	fightSumo: function() {
		this.enemyTurn = false;
		this.controller.fightSumo();
	},
	
	onExit: function(nextScene, option) {
		this.node.destroy();
	}
};

exports.MainScene = Scene.subclass(mainScene);
