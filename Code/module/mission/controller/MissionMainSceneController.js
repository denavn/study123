/**
 * @author lucnd
 */

var Core 			= require('../../../../NGCore/Client/Core').Core;
var GL2  			= require('../../../../NGCore/Client/GL2').GL2;
var SceneDirector 	= require('../../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory 	= require('../../../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var ParticleEmitter = require('../../../../NGGo/Service/Graphics/ParticleEmitter').ParticleEmitter;
var Logger 			= require('../../../utils/Logger').Logger;
var UI 				= require('../../../../NGCore/Client/UI').UI;
var BattleEntry= require('../../battle/BattleEntry').BattleEntry;

var mainSceneController = 
{
	
	initialize: function() {
		this.currentBattle = "";
		this.enemyTurn = false;
		this.isFightingE = false;
		this.isFighting = false;
		this._skillTypeS = 1;
		this._skillTypeE = 1;
		this._addGoButton();
	},
    
	initData: function(sumoObj, isEnemy) {
		var hp = 200;
		var ap = 1000;
		var dp = 400;
		var name = "dragon";
		
		if (isEnemy) {
			if (this.currentBattle === "Battle1") {
				ap = 600;
				dp = 300;
			} else {
				ap = 1600;
				dp = 600;
			}
		}
		
		sumoObj.hp = hp;
		sumoObj.ap = ap;
		sumoObj.dp = dp;
		sumoObj.name = name;
	},
	
	setupHero: function(hero) {		
		if(hero) {
				hero.setAnim("hero", "stand");
				this.MainGame.addChild(hero.getAnim());
		}
			
	},
	setupMonster: function(monsters) {		
		if(monsters) {
			for(var i in monsters) {
				var mon = monsters[i];
				mon.setAnim("evil", "stand");
				this.MainGame.addChild(mon.getNode());
			}
		}
	},
	
	_addGoButton: function() {
		this.nextButton = new UI.Button({
			frame: [400, 10, 60, 30],
			text: "Go",
			disabledTextColor: "FFFF",
			textSize: 14,
			textGravity: UI.ViewGeometry.Gravity.Center,
			gradient: {
				corners: '8 8 8 8',
				outerLine: "00 1.5",
				gradient: [ "FF9bd6f4 0.0", "FF0077BC 1.0" ]
			},
			highlightedGradient: {
				corners: '8 8 8 8',
				outerLine: "00 1.5",
				gradient: [ "FF0077BC 0.0", "FF9bd6f4 1.0" ]
			},
			disabledGradient: {
				corners: '0 8 8 8',
				gradient: [ "FF55 0.0", "FF00 1.0"],
			},
			// if the back button is pressed, then launch /Samples/Launcher
			onClick: function(event) {
				UI.Window.document.removeChild(this.nextButton);
				this.nextButton.destroy();
				new BattleEntry();
			}.bind(this)
		});
	
		UI.Window.document.addChild(this.nextButton);
	}
};

exports.MissionMainSceneController = Core.MessageListener.subclass(mainSceneController);
