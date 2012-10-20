/**
 * 
 */
var Scene					 = require("../../NGGo/Framework/Scene/Scene").Scene;
var GUIBuilder				 = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var HeroShowController		 = require("../Controller/HeroShowController").HeroShowController;
var Layer					 = require("../Layer").Layer;
var TouchManager			 = require('../Common/Util/TouchManager').TouchManager;
var CollectionTouch 		 = require('../Common/Util/CollectionTouch').CollectionTouch;
var ScreenManager		   	 = require('../../NGGo/Service/Display/ScreenManager').ScreenManager;
var Hero 		   			 = require('../Model/Hero').Hero;
var VFX					 	 = require('../../DnLib/Dn/GL2/VFX').VFX;

exports.HeroShowScene = Scene.subclass({
    classname: "HeroShowScene",
    sceneName: "HeroShowScene",
    controller: null,
    
    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");
        var _self = this;
        _self.node = new GL2.Node();
        _self.controller = new HeroShowController();
        GUIBuilder.loadConfigFromFile("Content/view/HeroShowView.json", _self.controller, function (e){
        	_self.node.addChild(_self.controller.HeroShowView);
            Layer.addRootChild(_self.node, Layer.Depth.TOP);
            _self.controller.updateHero(option);            
            VFX.enchant(_self.controller.HeroShowView).move(0.3, 0, 480).wait(0.1).move(0.02, 0, -14).wait(0.01).move(0.01, 0, 10);
        });     
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
        //VFX.enchant(this.controller.HeroShowView).moveTo(0.4, 0, -460);
        Layer.removeRootChild(this.node);        
        this.controller.destroyAll();
        this.controller = null;
    }
});