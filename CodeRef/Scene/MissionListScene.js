var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var MissionListController = require("../Controller/MissionListController").MissionListController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.MissionListScene = Scene.subclass({
    classname  : "MissionListScene",
    sceneName  : "MissionListScene",

    initialize: function() {
        NgLogD(this.classname + "::initialize");
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname + "::onEnter");

        var self = this;

        option = option || {};
        self.controller = new MissionListController(option.episode);

        GUIBuilder.loadConfigFromFile(
            "Content/view/MissionListView.json",
            self.controller,
            function(e) {
                if (e && e.stack) {
                    console.log(e.stack);
                }

                self.controller.updateMissionList(function() {
                    Layer.addRootChild(self.controller.MissionListView, Layer.Depth.MAIN);
                });
            }
        );
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname + "::onResume");
        this.controller.active();

        if (prevScene.toString() !== "LoadingScene") {
            this.controller.updateMissionList();
        }
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname + "::onPause");
        this.controller.deactive();
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname + "::onExit");

        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
