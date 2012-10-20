var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var FeedListController = require("../Controller/FeedListController").FeedListController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.FeedListScene = Scene.subclass({
    classname: "FeedListScene",
    sceneName: "FeedListScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        this.controller = new FeedListController();

        var controller = this.controller;

        GUIBuilder.loadConfigFromFile("Content/view/FeedListView.json", controller, function (e) {
            
            controller.buildNodes();

            Layer.addRootChild(controller.FeedListView, Layer.Depth.MAIN);
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

        Layer.removeRootChild(this.controller.FeedListView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
