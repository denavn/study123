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
var TouchManager 	 = require('../../../utils/TouchManager').TouchManager;

var mainSceneController = 
{
	
	initialize: function() {
		this.currentBattle = "";
		this._addGoButton();
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
				TouchManager.instance().addListener(this, mon.touch, this.onTouch);
				mon.setAnim("evil", "stand");
				this.MainGame.addChild(mon.getNode());
			}
		}
	},
	onTouch:function(touch) {
		console.log("NDL----onTouch");
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
