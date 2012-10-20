/**
 * 
 */
var Scene					 = require("../../NGGo/Framework/Scene/Scene").Scene;
var GUIBuilder				 = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var HeroCollectionController = require("../Controller/HeroCollectionController").HeroCollectionController;
var Layer					 = require("../Layer").Layer;
var TouchManager			 = require('../Common/Util/TouchManager').TouchManager;
var CollectionTouch 		 = require('../Common/Util/CollectionTouch').CollectionTouch;
var ScreenManager		   	 = require('../../NGGo/Service/Display/ScreenManager').ScreenManager;
var SceneManager			 = require('../../NGGo/Service/Display/SceneManager').SceneManager;
var Camera					 = require('../../NGGo/Service/Display/Camera').Camera;
var CameraManager			 = require('../../NGGo/Service/Display/CameraManager').CameraManager;
var GameAPI					 = require('../GameAPI').GameAPI;
var Constant				 = require('../Common/Util/Constant').Constant;
var Util					 = require('../../NGGo/GLUI/Util').Util;

exports.HeroCollectionScene = Scene.subclass({
    classname: "HeroCollectionScene",
    sceneName: "HeroCollectionScene",
    controller: null,
    
    initialize: function($super) {
    	this.controller = new HeroCollectionController();
        $super();
    },
    
    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");
        var cameraObj = {
        	"Screen": {
        		"depth": 0,
        		"childrenDepthGrouped": true,
        		"children": {
        			"CameraScreen": { "depth": 1 },
        			"StaticScreen": { "depth": 2 }
        		}
        	}
	    };
	    
        SceneManager.loadConfigFromData(cameraObj, function(err) {
				ScreenManager.getRootNode().addChild(SceneManager.getNodeCameraScreen());
			    	        
				// Load Camera configuration
				CameraManager.loadConfigFromFile('Config/camera.json', function(err) {
					console.log("Finish reading camera.json");
					if (err) { 
						NgLogD('Error: ' + err); 
					} else {					
						// Camera
						this._camera = new Camera('CameraScreen', 'mySetting');
						this.controller._myCamera= this._camera;
					}		    	   

				}.bind(this));		
	
				//Load json file of Scene
				GUIBuilder.loadConfigFromFile("Content/view/HeroCollectionView.json", this.controller, function ()
				{						
					var heroCollectionView = this.controller.HeroCollectionView;
					var header = this.controller.Header;
					var buttons = this.controller.Buttons;
					var maskMenu = this.controller.MaskMenu;
					
					ScreenManager.getRootNode().addChild(maskMenu);
					ScreenManager.getRootNode().addChild(header);
					ScreenManager.getRootNode().addChild(buttons);
					SceneManager.getNodeCameraScreen().addChild(heroCollectionView);

					this.controller.MaskMenu.setDepth(100);
					this.controller.Header.setDepth(100);
			    	this.controller.Buttons.setDepth(100);
					this.controller.updateList();
					
					listener = new CollectionTouch(this.controller);
					var navigationTarget= new GL2.TouchTarget();
					navigationTarget.setAnchor(0, 0);		    
					navigationTarget.setSize(Constant.BG_IMAGE_W, Constant.BG_IMAGE_H - Constant.HEADER_HEIGHT);					
					navigationTarget.getTouchEmitter().addListener(listener, listener.onTouch);
					navigationTarget.getTouchEmitter().addListener(this._camera, this._camera.onTouch);
					heroCollectionView.addChild(navigationTarget);
				}.bind(this));
				
    		}.bind(this)
    	);        
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname + "::onResume");
        this.controller.active();
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname + "::onPause");
        this.controller.deactive();
    },

    onExit: function(nextScene, option) {
		NgLogD(this.classname + "::onExit");   
		SceneManager.getNodeCameraScreen().removeChild(this.controller.HeroCollectionView);
	   	this.controller.destroyAll();
	   	this.controller = null;
    }
});