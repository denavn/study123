/**
 * @author sonnn
 */

var Core 				= require('../../NGCore/Client/Core').Core;
var Device 				= require('../../NGCore/Client/Device').Device;
var SceneDirector 		= require('../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory 		= require('../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var JSONData 			= require('../../NGGo/Service/Data/JSONData').JSONData;
var GUIBuilder 			= require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var ScreenManager 		= require('../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GL2 				= require('../../NGCore/Client/GL2').GL2;
var GlobalParameter 	= require('../utils/GlobalParameter').GlobalParameter;
var SpecialMission 		= require('../module/cutscene/SpecialMission').SpecialMission;
var BattleEntry 		= require('../module/battle/BattleEntry').BattleEntry;
var Logger 				= require('../utils/Logger').Logger;
var MissionScene 		= require('../module/mission/MissionScene').MissionScene;

var debugSceneController = 
{
	initialize: function(scene) {
		Logger.log("Load Game successfully!");
		this._scene = scene;
	},
	
    action_click: function (elem, battleName)
    {
    	var self = this;
        console.log('You clicked ' + battleName + '!');
        
        if (battleName === "Battle") {
        	this.gotoBattle(self);
        } else if (battleName === "Mission") {
        	console.log("NDL:---- Mission");
        	this.transitionToMission();
        	
        } else if (battleName === "Test") {
        	this.transitionToTest();
        	var a = [];
        	a["key1"] = { "key1": 1 };
        	a["key2"] = { "key2": 2 };
        	var key;
        	for (key in a) {
        		Logger.log(key + " = " + a[key]);
        	}
        } else if (battleName === "Reload") {
        	this._initBackKey();
        } else if (battleName === "Viet") {
            this.transitionToViet();
        } else if (battleName === "Home") {
            this.transitionToHomeScene();
        }
    },
    
    gotoBattle: function(self) {
    	self.transitionToBattle();
    },
    
    transitionToBattle: function() {
		console.log("Jump into battle");
		new BattleEntry("DEBUG");
    },
    
    transitionToTest: function() {
		console.log("transition to test scene");
		SceneDirector.transition("TEST_SCENE");
    },
    transitionToViet: function() {
        console.log("transition to Viet");
        SceneDirector.push("ALL_SCENE");
    },
    transitionToHomeScene: function() {
        console.log("transition to Viet");
        this._scene.node.setTouchable(false);
        SceneDirector.push("HOME_SCENE");
    },
    transitionToMission: function() {
		console.log("Jump into mission");
		SceneDirector.push("MISSION_SCENE");
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

exports.DebugSceneController = Core.Class.subclass(debugSceneController);
