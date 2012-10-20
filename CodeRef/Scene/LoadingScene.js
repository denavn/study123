var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var LoadingController = require("../Controller/LoadingController").LoadingController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.LoadingScene = Scene.subclass({
    classname: "LoadingScene",
    sceneName: "LoadingScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname + "::onEnter");

        var _self = this;

        _self.controller = new LoadingController();
        GUIBuilder.loadConfigFromFile("Content/view/LoadingView.json", _self.controller, function (e) {
            Layer.addRootChild(_self.controller.LoadingView, Layer.Depth.LOADING);
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

        Layer.removeRootChild(this.controller.LoadingView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
