var Scene = require('../../NGGo/Framework/Scene/Scene').Scene;
var StatusController = require('../Controller/StatusController').StatusController;
var GUIBuilder = require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Layer = require('../Layer').Layer;

exports.StatusScene = Scene.subclass({
    classname: "StatusScene",
    sceneName: "StatusScene",
    controller: null,

    initialize: function($super) {
        $super();
    },

    // 生成時にコールバックされます
    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        this.controller = new StatusController();

        var controller = this.controller;

        GUIBuilder.loadConfigFromFile("Content/view/StatusView.json", controller, function (e){

            controller.buildNodes();
            controller.startUpdateTimer();

            Layer.addRootChild(controller.StatusView, Layer.Depth.TOP);
        });
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname+"::onResume");
        this.controller.active();

        this.controller.startUpdateTimer();
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname+"::onPause");
        this.controller.deactive();

        this.controller.endUpdateTimer();
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname+"::onExit");

        this.controller.endUpdateTimer();
        this.controller.destroyNodes();

        Layer.removeRootChild(this.controller.StatusView);
        this.controller.destroyAll();
        this.controller = null;
    }

});

