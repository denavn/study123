var GL2 					 = require('../../../../NGCore/Client/GL2').GL2;
var GLUI					 = require('../../../../NGGo/GLUI').GLUI;
var Scene					 = require('../../../../NGGo/Framework/Scene/Scene').Scene;
var SceneManager			 = require('../../../../NGGo/Service/Display/SceneManager').SceneManager;
var ScreenManager			 = require('../../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var Camera					 = require('../../../../NGGo/Service/Display/Camera').Camera;
var CameraManager			 = require('../../../../NGGo/Service/Display/CameraManager').CameraManager;
var TouchManager		 	 = require('../../../utils/TouchManager').TouchManager;
var GUIBuilder				 = require('../../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var CollectionMapController	 = require('../../../controller/CollectionMapController').CollectionMapController;

exports.CollectionMapScene = Scene.subclass({

    classname: "CollectionMapScene",
    sceneName: "CollectionMapScene",    
    
	initialize: function ($super){			
		 $super();
		 this._controller = new CollectionMapController();
    },	
	    
	onEnter: function (prevScene, option) {
		NgLogD(this.classname+"::onEnter");           
		// Scene config
		SceneManager.loadConfigFromFile('Config/scene.json', function(err) {
			               
			//import data from json	    	        
			GUIBuilder.loadConfigFromFile("Config/Scene/CollectionPage/ToyData.json", this._controller, function ()
			{							
				SceneManager.getNodeCameraScreen().addChild(this._controller.ToyData);
			}.bind(this));
		    // TouchTarget			
			
			this._target = new GL2.TouchTarget();
			this._target.setAnchor(0, 0);		    
			this._target.setSize(Core.Capabilities.getScreenWidth(),Core.Capabilities.getScreenHeight());
			this._target.setPosition(0, 0);
		    SceneManager.getNodeCameraScreen().addChild(this._target);
		    	        
			// Camera config
			CameraManager.loadConfigFromFile('Config/camera.json', function(err) {
				if (err) { NgLogD('Error: ' + err); }
				// Camera
				var camera = new Camera('CameraScreen', 'mySetting');
				this._target.getTouchEmitter().addListener(camera, camera.onTouch);		    	   
			}.bind(this));
				    
			// Create UI
			GUIBuilder.loadConfigFromFile("Config/Scene/CollectionPage/CollectionPage.json",  this._controller, function ()
		    {
				SceneManager.getNodeStaticScreen().addChild( this._controller.MainGame);
		    }.bind(this));
			            
		}.bind(this));	
	},
	   
	onExit: function () {
		this.destroy();
	},
	/**
	* Destroys object and releases memory.
	*/
	destroy: function () {	    	 
		if (this._controller.ToyData) {
			SceneManager.getNodeCameraScreen().removeChild(this._controller.ToyData);
			this._controller.ToyData.destroy();
		}
		if (this._controller.MainGame) {
			SceneManager.getNodeStaticScreen().removeChild(this._controller.MainGame);
			this._controller.MainGame.destroy();
		}
		if (this._target) {
			SceneManager.getNodeCameraScreen().removeChild(this._target);
			this._target.destroy();
		}
	}
});