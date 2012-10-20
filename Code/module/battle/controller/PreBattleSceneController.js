/**
 * @author sonnn
 */

var Core 				= require('../../../../NGCore/Client/Core').Core;
var Device 				= require('../../../../NGCore/Client/Device').Device;
var SceneDirector 		= require('../../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory 		= require('../../../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var JSONData 			= require('../../../../NGGo/Service/Data/JSONData').JSONData;
var GUIBuilder 			= require('../../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var ScreenManager 		= require('../../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GL2 				= require('../../../../NGCore/Client/GL2').GL2;
var GlobalParameter 	= require('../../../utils/GlobalParameter').GlobalParameter;
var Logger 				= require('../../../utils/Logger').Logger;

var preBattleSceneController = 
{
	initialize: function() {
		Logger.log("Load Game successfully!");
	},
	
    action_click: function (elem, battleName)
    {
    	var self = this;
        console.log('You clicked ' + battleName + '!');
        
        if (battleName === "Battle1" || battleName === "Battle2") {
        	this.gotoBattle(self, battleName);
        } else if (battleName === "Reload") {
        	this._initBackKey();
        } else if (battleName === "Back") {
            this.transitionToDebugScene();
        }
    },
    
    gotoBattle: function(self, battleName) {
    	self.transitionToBattleMain(battleName);
    },
    
    transitionToBattleMain: function(battleName) {
		console.log("transition to main scene: " + battleName);
		SceneDirector.push("BATTLE_SCENE", battleName);
    },
    
    transitionToTest: function() {
		console.log("transition to test scene");
		SceneDirector.transition("TEST_SCENE");
    },
    
    transitionToDebugScene: function() {
        console.log("transition to Viet");
        SceneDirector.push("DEBUG_SCENE");
    },
    
	_initBackKey: function () {
		// back key
		var KeyListener = Core.MessageListener.singleton ({
			initialize: function() {
				Device.KeyEmitter.addListener(this, this.onUpdate);
				Device.KeyEmitter.emit(new Device.KeyEmitter.KeyEvent(Device.KeyEmitter.EventType.onUp, Device.KeyEmitter.Modifier.NONE, Device.KeyEmitter.Keycode.back));
			},

			onUpdate : function(keyEvent) {
				var gameUrl = Core.Capabilities.getStartingServer() + "/" + Core.Capabilities.getBootGame();
				Logger.log("Reload Game " + gameUrl);
				
				Core.LocalGameList.runUpdatedGame(gameUrl);
				return false;
			}
		});
		
		KeyListener.instantiate();
	}
};

exports.PreBattleSceneController = Core.Class.subclass(preBattleSceneController);
