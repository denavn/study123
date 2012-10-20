/**
 * @author lucnd
 */

var Core 				= require('../../../../NGCore/Client/Core').Core;
var SceneDirector 		= require('../../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory 		= require('../../../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var JSONData 			= require('../../../../NGGo/Service/Data/JSONData').JSONData;
var GUIBuilder 			= require('../../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var ScreenManager 		= require('../../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GL2 				= require('../../../../NGCore/Client/GL2').GL2;
var GlobalParameter 	= require('../../../utils/GlobalParameter').GlobalParameter;
//var SpecialMission 		= require('../../../../module/cutscene/SpecialMission').SpecialMission;

var debugSceneController = 
{
    action_click: function (elem, battleName)
    {
    	var self = this;
        console.log('You clicked ' + battleName + '!');
        
        if (battleName === "Mission1" || battleName === "Mission2") {
        	this.gotoMission(self, battleName);
        } else if (battleName === "Test") {
        	console.log("NDL:---- Test");
        }
    },
    
    gotoMission: function(self, battleName) {
    	var jsondata = new JSONData();
		jsondata.load("Config/player.json", function(err, obj) {
			if (err) {
				console.log("Error:"+err.errorText);
			} else {
				GlobalParameter.player = obj.data.player;
				console.log("Player_01.name="+obj.data.player.player_01.name);

				jsondata.load("Config/sumo.json", function(err, obj) {
					if (err) {
						
					} else {
						GlobalParameter.sumo = obj.data.sumos;
						console.log("Sumo_01.name="+obj.data.sumos.sumo_01.name);
						
						jsondata.load("Config/skill.json", function(err, obj) {
    						if (err) {
    							
    						} else {
    							GlobalParameter.skill = obj.data.skills;
    							console.log("Skill_01.name="+GlobalParameter.skill.skill_01.name);
    							
    							jsondata.load("Config/battle.json", function(err, obj) {
	        						if (err) {
	        							
	        						} else {
	        							GlobalParameter.battle = obj.data.battle;
	        							console.log("battle_01.name="+obj.data.battle.background);
									    
									    self.transitionToMain(battleName);
	        						}
	        					});
		        			}
	        			});
	        		}
        		});
			}
		});
    },
    
    transitionToMain: function(battleName) {
		console.log("transition to main scene: " + battleName);
		SceneDirector.transition("MISSION_MAIN_SCENE", battleName);
    }
};

exports.MissionDebugSceneController = Core.Class.subclass(debugSceneController);
