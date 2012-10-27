/*
 *ls
 * 
 * 
 * 
 * 
 */
var ImageListView		 = require('../../../NGGo1.3/Service/Graphics/ImageListView').ImageListView;
var GL2					 = require('../../../NGCore/Client/GL2').GL2;
var Core				 = require('../../../NGCore/Client/Core').Core;
var UI 					 = require('../../../NGCore/Client/UI').UI;
var Scene				 = require('../../../NGGo/Framework/Scene/Scene').Scene;
var SceneDirector        = require('../../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory         = require('../../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var GUIBuilder			 = require('../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var VFX					 = require('../../../NGGo1.3/Service/Graphics/VFX').VFX;
var VFXActions			 = require('../../../NGGo1.3/Service/Graphics/VFXActions').VFXActions;
var Ops 				 = require('../../../NGGo1.3/Foundation/Math/Ops').Ops;
var GLUI				 = require('../../../NGGo1.3/GLUI').GLUI;
var DebugView 			 = require('../../utils/DebugView').DebugView;
var Builder              = require('../../utils/Builder').Builder;
var eff                  = require('../../utils/eff').eff;
var VietScene            = require('./VietScene').VietScene;

exports.HomeScene = VietScene.subclass({
	classname: "HomeScene",
	sceneName: "HOME_SCENE",
	/*
	 * type = 0 means display opening story
	 * type = 1 means display boss story,...
	 * conf is an array that contains stories for each type
	 */
	initialize: function($super, type) {
		$super();
		
	},
	defineConfig: function(controller,def) {
		  var conf = {};
            conf.description = def.attrs.description;
            conf.debug = def.attrs.debug || false;
            conf.debugAttrs = def.attrs.debugAttrs || [];
            conf.maps = def.attrs.maps || [];
            return conf;
	},
	onEnter: function($super, preScene,option) {
        $super();
        //Log("option in tutor scene is : " + option);
        this.preScene = preScene;
       // this._data = option;
    },
	onSuccessConfig: function() {
		Log("call onSuccessConfig");
		this.createMapButtons(this.CONF.maps);
	},
	
	
 	createMapButtons: function(maps) {
 	    Log("createmapButtons");
 	    for (var i = 0; i < maps.length; i++) {
 	        Log("var i = " + i);
 	        var map = maps[i];
 	        map.node = new GL2.Node();
 	        Log("map.frame = " + map.frame);
 	        map.node.setPosition(map.frame[0], map.frame[1]);
 	        Builder.makeTouch(map.node,[map.frame[2], map.frame[3]], {func: this.bind(this.onSelectMap), args: map.id});
 	        this.node.addChild(map.node);
 	    }
 	},
 	/*
 	 * args is map_id
 	 */
 	onSelectMap: function(args) {
 	    Log(" Select a rock map: index is =====" + args);
 	    this.node.setTouchable(false);
 	    SceneDirector.push("MAP_SELECTION_SCENE");
 	},
 	onSelectOther: function() {
 	    Log("On select other button ");
 	},
	
	onExit: function($super) {
	    this.preScene.node.setTouchable(true);
		$super();
	},
	onPause: function() {
		Log(this.classname + " paused");
		this.node.setVisible(false);
	},
	_addBackground: function() {
        this.bg = new GL2.Sprite();
        this.bg.setImage("Content/home_bg.png", new Core.Size(480,320), new Core.Point(0,0));
        this.node.addChild(this.bg);
    },
	onResume: function($super) {
	   $super();
		this.node.setVisible(true);
		this.node.setTouchable(true);
	},

});


