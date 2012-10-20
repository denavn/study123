/********************************************************************************************
 * Class Name: MainGame 
 * 
 * @Description: 
 * 
 *******************************************************************************************/
var UI 						= require('../../NGCore/Client/UI').UI;
var Core					= require('../../NGCore/Client/Core').Core;
var GL2						= require('../../NGCore/Client/GL2').GL2;
var ConfigurationManager    = require('../../NGGo/Framework/ConfigurationManager').ConfigurationManager;
var ScreenManager			= require('../../NGGo/Service/Display/ScreenManager').ScreenManager;
var SceneDirector 			= require('../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory 			= require('../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var DebugScene 				= require('./Scene/DebugScene').DebugScene;
var PreBattleScene   		= require('../module/battle/view/Scene/PreBattleScene').PreBattleScene;
var VietScene				= require('./Scene/VietScene').VietScene;
var StoryScene				= require('./Scene/StoryScene').StoryScene;
var ListScene				= require('./Scene/ListScene').ListScene;
var AllScene 				= require('./Scene/AllScene').AllScene;
var EffectScene 			= require('./Scene/EffectScene').EffectScene;
var MapSelectionScene 		= require('./Scene/MapSelectionScene').MapSelectionScene;
var TutorScene              = require('./Scene/TutorScene').TutorScene;
var HomeScene               = require('./Scene/HomeScene').HomeScene;
var MissionScene            = require('../module/mission/MissionScene').MissionScene;

exports.MainGame = Core.Class.subclass({
	initialize:function() {
	    NgLogD("++++ MainGame");
	    this.registerScenes();
	    
	    ConfigurationManager.begin(function (err)
	    {
	        if (err)
	        {
	            console.log("Something went very wrong: " + err);
	        } else {
	            var w1 = Core.Capabilities.getScreenWidth();
	            var h1 = Core.Capabilities.getScreenHeight();
	            platformOS = Core.Capabilities.getPlatformOS();
	            
	            var w = 480;
	            var h = 320;
	            var onload = function() {
				        if (platformOS === 'Android') {
				        	w = h1/1.5;
				        	h = w1/1.5;
				        } 
				        
				        ScreenManager.register(
				        {
				            type: "LetterBox",
				            name: "GUI",
				            logicalSize: [w, h]
				        });
				        
				        ScreenManager.setDefault("GUI");
				        
				        if (platformOS === 'Android') {
				        	var scale = ScreenManager.screenSetting._scale;
				        	var ws = scale * w1;
				        	var hs = scale * h1;
				        	//var path = "/?q=BEGIN&scale=" + scale +"&ws=" + ws + "&hs=" + hs + "&w1=" + w1 + "&h1="+h1;
				        	//ServerConsole.log(path);
					        var backdrop2 = new GL2.Sprite();
					        backdrop2.setImage("Content/bg1.png", [h1 - scale * w1, w1], [0, 0]);
					        backdrop2.setDepth(65535);
					        backdrop2.setPosition(ws, 0);
					        GL2.Root.addChild(backdrop2);
				        
				        }
				        
				        GL2.Root.addChild(ScreenManager.getRootNode());
				        
				        Core.UpdateEmitter.setTickRate(0.05);
				        
						// Push main scene
				    	SceneDirector.push("DEBUG_SCENE");
	                };
	                
	            ScreenManager.setLandscape(onload);
	        }
	    });
	},
	
	registerScenes: function() {
		console.log("SON:in registerScenes");
		SceneFactory.register(DebugScene, "DEBUG_SCENE");
    	SceneFactory.register(PreBattleScene, "PRE_BATTLE_SCENE");
    	SceneFactory.register(VietScene,"VIET_SCENE");
    	SceneFactory.register(StoryScene, "STORY_SCENE");
    	SceneFactory.register(ListScene,"LIST_SCENE");
    	SceneFactory.register(AllScene, "ALL_SCENE");
    	SceneFactory.register(EffectScene, "EFFECT_SCENE");
    	SceneFactory.register(MapSelectionScene,"MAP_SELECTION_SCENE");
    	SceneFactory.register(TutorScene, "TUTOR_SCENE");
    	SceneFactory.register(HomeScene, "HOME_SCENE");
    	SceneFactory.register(MissionScene, "MISSION_SCENE");
    	UI.Window.document.addChild(this.btnBack);
	},
	btnBack: new UI.Button({
        frame: [460, 0, 20, 20],
        text: "X",
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
        onClick: function(event) {
              Log("Back button onclicked + currentScene = " + SceneDirector.currentScene.sceneName);
                if(SceneDirector.currentScene.sceneName != "DEBUG_SCENE")
                    SceneDirector.pop();
                else SceneDirector.currentScene.controller._initBackKey();
             
        }
    })
});