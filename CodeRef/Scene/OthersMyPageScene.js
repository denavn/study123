var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var OthersMyPageController = require("../Controller/OthersMyPageController").OthersMyPageController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.OthersMyPageScene = Scene.subclass({
    classname: "OthersMyPageScene",
    sceneName: "OthersMyPageScene",
    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        this.controller = new OthersMyPageController();

        var controller = this.controller;

        GUIBuilder.loadConfigFromFile("Content/view/OthersMyPageView.json", controller, function (e) {

            controller.buildNodes();

            Layer.addRootChild(controller.OthersMyPageView, Layer.Depth.MAIN);
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

        Layer.removeRootChild(this.controller.OthersMyPageView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
