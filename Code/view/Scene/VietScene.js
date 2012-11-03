var GL2					 = require('../../../NGCore/Client/GL2').GL2;
var Core				 = require('../../../NGCore/Client/Core').Core;
var UI 					 = require('../../../NGCore/Client/UI').UI;
var Scene				 = require('../../../NGGo/Framework/Scene/Scene').Scene;
var GUIBuilder			 = require('../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var VFX                  = require('../../../NGGo1.3/Service/Graphics/VFX').VFX;
var VFXActions           = require('../../../NGGo1.3/Service/Graphics/VFXActions').VFXActions;
var Ops                  = require('../../../NGGo1.3/Foundation/Math/Ops').Ops;
var Scene                = require('../../../NGGo/Framework/Scene/Scene').Scene;
var SceneDirector        = require('../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var DebugView            = require('../../utils/DebugView').DebugView;
var ScreenManager        = require('../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var VietScene = ({
 	classname: "VietScene",  // must be unique
 	sceneName: "VIET_SCENE",
 	initialize: function(data) {
 		Log(this.classname + " initialized");
 		this.controller = {};
 		this.CONF = {};
 		this.node = new GL2.Node();
 		this._addBackground();
 	},
 	onEnter: function(preScene, option) {
 		Log(" call onEnter");
		GUIBuilder.registerTypeMethod(this.classname, this.defineConfig);
		GUIBuilder.loadConfigFromFile("Config/Scene/" + this.classname + ".json", this.controller, function(err) {
			if(this.controller.CONF!= undefined) {
				this.CONF = this.controller.CONF;
				if(this.CONF.debug) {
					if(this.setupForDebug == undefined)
						Log("You must implement setupForDebug function");
					else {
						this.setupForDebug();
						this._debugView = new DebugView(this, this.CONF.debugAttrs, [0,40,480,30]);
					}
				}
				this._addBackButton();
 				this.onSuccessConfig();
 			}
 		}.bind(this));
 		ScreenManager.getRootNode().addChild(this.node);
 		//GL2.Root.addChild(this.node);
 		this._slowAppear();
 	},
 	onSuccessConfig: function() {
 		Log("call onSuccessConfig");
 	},
 	reloadForDebug: function(values) {
 		Log("call reloadForDebug");
 		var str = "[";
		this.reInitForDebug();
		for ( var i = 0; i < values.length; i++) {
			if (values[i] != null) {
				str += this.CONF.debugAttrs[i]  + ":" + values[i] + "|";
				this._setConfigAttrs(this.CONF.debugAttrs[i], values[i]);
			}
		}
		Log("CONF after debug: " + str + "]");
		this.onSuccessConfig();
 	},
 	
 	
 	//Must be override
 	defineConfig: function(controller,def){
 			var conf = {};
			conf.description = def.attrs.description;
			conf.debug = def.attrs.debug || false;
			conf.debugAttrs = def.attrs.debugAttrs || [];
    		return conf;
	},
 	// Must be implement if scene has debug mode in scene.
 	// setupForDebug: function() {
 		// this.reInitForDebug = function() {Log("call reInitForDebug");};
 		// this._setConfigAttrs = function(name,value) {
 			// Log("call _setConfigAttrs");
 			// switch(name) {
 			// case 'description' : {this.CONF.description = value;break;}
 			// case 'debug' : {this.CONF.debug = value;break;}
 			// default: Log("Can't find " + name + " in CONF");
 		// }
 		// };
 	// },
 	onExit: function() {
 	    Log("call onExit of " + this.sceneName);
 		this.node.destroy();
 		
 		if(this._debugView)
 			this._debugView.destroy();
 	},
 	onPause: function() {
 		//this.btnBack.setEnabled(false);
 	},
 	onResume: function() {
 	    Log(this.sceneName + " resumed");
 		this._slowAppear();
 		//this.btnBack.setEnabled(true);
 	},
 	
 	//add background right after init, so hard code
 	_addBackground: function() {
		this.bg = new GL2.Sprite();
		this.bg.setImage("Content/white.png", new Core.Size(1024,1024), new Core.Point(0,0));
		this.node.addChild(this.bg);
	},
	_slowAppear: function() {
	    this.node.setAlpha(0);
	    var seq = VFX.spawn().alphaTo(1,2);
	    seq.play(this.node);
	},
	_addBackButton: function() {
        /*this.btnBack = new UI.Button({
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
        // if the back button is pressed, then launch /Samples/Launcher
        });
        this.btnBack.setOnClick(function(event) {
            Log("Back button onclicked + currentScene = " + SceneDirector.currentScene.sceneName);
             SceneDirector.pop();
             this.btnBack.destroy();
           /* if(SceneDirector.currentScene.sceneName == this.sceneName) {
                this.btnBack.setVisible(false);
                SceneDirector.pop();
                return;
            }
            while(SceneDirector.currentScene.sceneName != this.sceneName) {
                SceneDirector.pop();
                Log("CurrentScene is " + SceneDirector.currentScene.sceneName);
            }
        }.bind(this));
        UI.Window.document.addChild(this.btnBack); */
    },
 });
 exports.VietScene = Scene.subclass(VietScene);