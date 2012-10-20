var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var MissionController = require("../Controller/MissionController").MissionController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;
var Pool = require("../Pool").Pool;

exports.MissionScene = Scene.subclass({
    classname : "MissionScene",
    sceneName : "MissionScene",
    controller : null,

    initialize: function() {
        NgLogD(this.classname+"::initialize");
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new MissionController();

        GUIBuilder.loadConfigFromFile(
            "Content/view/MissionView.json",
            self.controller,
            function (e) {
                if (e && e.stack) {
                    console.log("error: " + e);
                }

                Layer.addRootChild(self.controller.MissionView, Layer.Depth.TOP);

                self.controller.onSceneLoaded();
            }
        );
    },

    onResume: function(prevScene, option) {
        var self = this;

        NgLogD(self.classname+"::onResume");

        this.controller.update();
        this.controller.active();
        this.controller.checkAndCommitProcess(function() {
            self.controller.next(prevScene);
        });
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname+"::onPause");
        this.controller.deactive();
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname+"::onExit");

        Layer.removeRootChild(this.controller.MissionView);

        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
