var Scene = require('../../NGGo/Framework/Scene/Scene').Scene;
var BattleJoinController = require('../Controller/BattleJoinController').BattleJoinController;
var GUIBuilder = require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Layer = require('../Layer').Layer;
var SceneManager			 = require('../../NGGo/Service/Display/SceneManager').SceneManager;
var Camera					 = require('../../NGGo/Service/Display/Camera').Camera;
var CameraManager			 = require('../../NGGo/Service/Display/CameraManager').CameraManager;
var TouchManager		 	 = require('../../Code/Common/Util/TouchManager').TouchManager;

exports.BattleJoinScene = Scene.subclass({

    classname: "BattleJoinScene",

    sceneName: "BattleJoinScene",

    initialize: function() {
        this.count = 0;
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");
//        var _self = this;
//        this.controller = new BattleJoinController();
//        GUIBuilder.loadConfigFromFile("Content/view/BattleJoinView.json", this.controller, function (e){
//            _self.controller.setArea(option.area);
//            Layer.getHeaderController().deactive();
//            Layer.addRootChild(_self.controller.BattleJoinView, Layer.Depth.TOP);
//        });
        this.controller = new BattleJoinController();
        
        SceneManager.loadConfigFromData({
			"Screen": {
				"depth": 0,
				"childrenDepthGrouped": true,
				"children": {
					"CameraScreen": { "depth": 100000 },
					"StaticScreen": { "depth": 200000 }
				}
			}
		}, 
		function(err) {		               
			
			 GUIBuilder.loadConfigFromFile("Content/view/BattleJoinView.json", this.controller, function (e){
		          this.controller.setArea(option.area);	          
		           SceneManager.getNodeCameraScreen().addChild(
		        		   ScreenManager.getRootNode().addChild(this.controller.BattleJoinView));
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
			
		            
		}.bind(this));
        
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname+"::onResume");
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname+"::onPause");
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname+"::onExit");
//        Layer.getHeaderController().active();
//        Layer.removeRootChild(this.controller.BattleJoinView);
        this.controller.destroyAll();
        this.controller = null;
		if (this._target) {
			SceneManager.getNodeCameraScreen().removeChild(this._target);
			this._target.destroy();
		}
    },


});
