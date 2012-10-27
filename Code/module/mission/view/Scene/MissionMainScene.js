/**
 * @author sonnn
 */
var ScreenManager		 = require('../../../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GUIBuilder			 = require('../../../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Scene				 = require('../../../../../NGGo/Framework/Scene/Scene').Scene;
var GL2					 = require('../../../../../NGCore/Client/GL2').GL2;
var MissionMainSceneController	 = require('../../controller/MissionMainSceneController').MissionMainSceneController;
var SceneDirector 		 = require('../../../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var Monster		 		 = require('../../model/Entity/Monster').Monster;
var GlobalParameter 	 = require('../../../../utils/GlobalParameter').GlobalParameter;
var Mission		 		 = require('../../model/Entity/Mission').Mission;
var Hero		 		 = require('../../model/Entity/Hero').Hero;
var TouchManager 	 = require('../../../../utils/TouchManager').TouchManager;

var mainScene = {
	initialize: function() {
		TouchManager.initialize();
		this.controller = new MissionMainSceneController();
		
		this.mission = new Mission();
		this.monsters = {};
		this.hero = {}
		
		if(this.mission && this.mission.data && this.mission.data.monsters) {
			for(var i = 0; i < this.mission.data.monsters.length; i++ ) {
				var mon = new Monster(this.mission.data.monsters[i]);
				mon.setPosition(this.mission.data.monsters[i].x, this.mission.data.monsters[i].y);
				this.monsters[this.mission.data.monsters[i].monster_id] = mon;
			}
		}

		if(this.mission && this.mission.data && this.mission.data.hero) {
			this.hero = new Hero(this.mission.data.hero);
			this.hero.setPosition(this.mission.data.hero.x, this.mission.data.hero.y);
		}
		
	},
	
	onEnter: function(prevScene, option) {
		this.controller.currentBattle = option;
		this.node = new GL2.Node();
	    GUIBuilder.loadConfigFromFile("Config/Scene/mission/MainScene.json", this.controller, function ()
	    {
	    	ScreenManager.getRootNode().addChild(this.node);
	    	this.controller.MainGame.setDepth(0);
	    	this.node.addChild(this.controller.MainGame);
	    	this.controller.setupHero(this.hero);
	    	this.controller.setupMonster(this.monsters);
	    	
	    }.bind(this));
	},

	onExit: function(nextScene, option) {
		this.node.destroy();
		TouchManager.instance().destroy();
		if(this.mission) {
			this.mission.destroy();
		}
	}
};

exports.MissionMainScene = Scene.subclass(mainScene);
