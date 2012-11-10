/**
 * @author sonnn
 */
var Core				= require('../../../NGCore/Client/Core').Core;
var SceneDirector 		= require('../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory 		= require('../../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var JSONData 			= require('../../../NGGo/Service/Data/JSONData').JSONData;
var GlobalParameter 	= require('../../utils/GlobalParameter').GlobalParameter;
var PreBattleScene 		= require('./view/Scene/PreBattleScene').PreBattleScene;
var BattleScene 		= require('./view/Scene/BattleScene').BattleScene;
var TestScene 			= require('./view/Scene/Test/TestScene').TestScene;

var battleEntry = {
	initialize: function(mode) {
		
		var jsondata = new JSONData();
		jsondata.load("Config/player.json", function(err, obj) {
			if (err) {
				console.log("Error:" + err.errorText);
			} else {
				GlobalParameter.player = obj.data.player;

				jsondata.load("Config/sumo.json", function(err, obj) {
					if (err) {
						console.log("Error:" + err.errorText);
					} else {
						GlobalParameter.sumo = obj.data.sumos;
						
						jsondata.load("Config/skill.json", function(err, obj) {
    						if (err) {
    							console.log("Error:" + err.errorText);
    						} else {
    							GlobalParameter.skill = obj.data.skills;
    							
    							jsondata.load("Config/battle.json", function(err, obj) {
	        						if (err) {
	        							console.log("Error:" + err.errorText);
	        						} else {
	        							GlobalParameter.battle = obj.data.battle;
	        							
	        							SceneFactory.register(PreBattleScene, "PRE_BATTLE_SCENE");
								    	SceneFactory.register(BattleScene, "BATTLE_SCENE");
								    	SceneFactory.register(TestScene, "TEST_SCENE");
								    	
								    	if (mode == "DEBUG") {
								    		SceneDirector.push("PRE_BATTLE_SCENE");
								    	} else {
								    		SceneDirector.transition("BATTLE_SCENE", "Battle2");
								    	}
	        						}
	        					});
		        			}
	        			});
	        		}
        		});
			}
		});
	}
};

exports.BattleEntry = Core.Class.subclass(battleEntry);