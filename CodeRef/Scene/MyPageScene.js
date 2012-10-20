var Scene = require('../../NGGo/Framework/Scene/Scene').Scene;
var MyPageController = require('../Controller/MyPageController').MyPageController;
var GUIBuilder = require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Layer = require('../Layer').Layer;

exports.MyPageScene = Scene.subclass({
    classname: "MyPageScene",
    sceneName: "MyPageScene",
    controller: null,

    initialize: function() {
        NgLogD(this.classname+"::initialize");
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        this.controller = new MyPageController();

        var controller = this.controller;

        GUIBuilder.loadConfigFromFile("Content/view/MyPageView.json", controller, function (e){

            controller.buildNodes();
//          controller.startUpdateTimer();
            controller.Tag.setTouchable(true);

            Layer.addRootChild(controller.MyPageView, Layer.Depth.MAIN);
        });
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname+"::onResume");
        this.controller.active();
        this.controller.Tag.setTouchable(true);
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname+"::onPause");

        this.controller.Tag.setTouchable(false);
        this.controller.deactive();
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname+"::onExit");
        // アニメーション

        this.controller.Tag.setTouchable(false);

        Layer.removeRootChild(this.controller.MyPageView);
        this.controller.destroyAll();
        this.controller = null;
    }

});

