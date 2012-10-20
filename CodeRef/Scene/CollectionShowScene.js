var Scene					 = require("../../NGGo/Framework/Scene/Scene").Scene;
var GUIBuilder				 = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var CollectionShowController = require("../Controller/CollectionShowController").CollectionShowController;
var Layer					 = require("../Layer").Layer;

exports.CollectionShowScene = Scene.subclass({
    classname: "CollectionShowScene",
    sceneName: "CollectionShowScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new CollectionShowController();        
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
       
    }
});