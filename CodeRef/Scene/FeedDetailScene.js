var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var FeedDetailController = require("../Controller/FeedDetailController").FeedDetailController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.FeedDetailScene = Scene.subclass({
    classname: "FeedDetailScene",
    sceneName: "FeedDetailScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        this.controller = new FeedDetailController();

        var controller = this.controller;

        GUIBuilder.loadConfigFromFile("Content/view/FeedDetailView.json", controller, function (e) {
            controller.buildNodes();

            Layer.addRootChild(controller.FeedDetailView, Layer.Depth.MAIN);
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

        Layer.removeRootChild(this.controller.FeedDetailView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
