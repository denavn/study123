/**
 * @author sonnn
 */
var ScreenManager		 		= require('../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GUIBuilder			 		= require('../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Scene				 		= require('../../../NGGo/Framework/Scene/Scene').Scene;
var GL2					 		= require('../../../NGCore/Client/GL2').GL2;
var MissionMainSceneController	= require('./controller/MissionMainSceneController').MissionMainSceneController;
var SceneDirector 		 		= require('../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory 				= require('../../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var GlobalParameter 	 		= require('../../utils/GlobalParameter').GlobalParameter;
var MissionDebugScene 			= require('./view/Scene/MissionDebugScene').MissionDebugScene;
var MissionMainScene 			= require('./view/Scene/MissionMainScene').MissionMainScene;
var missionScene = {
	initialize: function() {
		SceneFactory.register(MissionDebugScene, "MISSION_DEBUG_SCENE");
    	SceneFactory.register(MissionMainScene, "MISSION_MAIN_SCENE");
	},
	
	onEnter: function(prevScene, option) {
		if(option) {
			SceneDirector.transition("MISSION_DEBUG_SCENE");
		}
		else {
			SceneDirector.transition("MISSION_MAIN_SCENE");
		}
		
	},

	onExit: function(nextScene, option) {
	}
};

exports.MissionScene = Scene.subclass(missionScene);
