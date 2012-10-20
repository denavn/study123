var Scene					 = require("../../NGGo/Framework/Scene/Scene").Scene;
var GUIBuilder				 = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var CollectionMapController  = require("../Controller/CollectionMapController").CollectionMapController;
var Layer					 = require("../Layer").Layer;
var TouchManager 	= require('../Common/Util/TouchManager').TouchManager;
var CollectionTouch 	= require('../Common/Util/CollectionTouch').CollectionTouch;
var ScreenManager	= require('../../NGGo/Service/Display/ScreenManager').ScreenManager;


exports.CollectionMapScene = Scene.subclass({
    classname: "CollectionMapScene",
    sceneName: "CollectionMapScene",
    
    
    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;
        _self.node = new GL2.Node();
        _self.touchTarget = new GL2.TouchTarget();
        _self.touchTarget.setAnchor(0, 0);        
        _self.touchTarget.setSize(Core.Capabilities.getScreenWidth(),Core.Capabilities.getScreenHeight());
        _self.controller = new CollectionMapController();        
        GUIBuilder.loadConfigFromFile("Content/view/CollectionMapView.json", _self.controller, function (e){
        	_self.node.addChild(_self.controller.CollectionMapView);
            Layer.addRootChild(_self.node, Layer.Depth.MAIN);
            
        });
        GUIBuilder.loadConfigFromFile("Content/view/CollectionZoom.json", _self.controller, function (e){
            // _self.controller.setArea(option.area);
        	_self.nodeZoom = new GL2.Node();
         	_self.nodeZoom.addChild(_self.controller.CollectionZoom);
             Layer.addRootChild(_self.nodeZoom, Layer.Depth.TOP);
             
         });
//        listener = new CollectionTouch(_self.node);
//        _self.touchTarget.getTouchEmitter().addListener(listener, listener.onTouch);
//    	_self.node.addChild(_self.touchTarget);   	
             
         
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
//        Layer.removeRootChild(this.controller.CollectionMapView);
//        this.controller.deactive();
//        this.controller.destroy();
//        this.controller = null;
    }
});