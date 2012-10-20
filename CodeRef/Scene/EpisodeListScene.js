var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var EpisodeListController = require("../Controller/EpisodeListController").EpisodeListController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.EpisodeListScene = Scene.subclass({
    classname: "EpisodeListScene",
    sceneName: "EpisodeListScene",

    controller: null,
    touchListener: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new EpisodeListController();
        GUIBuilder.loadConfigFromFile(
            "Content/view/EpisodeListView.json",
            self.controller,
            function (e){
                if (e && e.stack) {
                    console.log("error: " + e);
                }

                self.controller.onSceneLoaded(function() {
                    Layer.addRootChild(self.controller.EpisodeListView, Layer.Depth.MAIN);
                });
            }
        );
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

        Layer.removeRootChild(this.controller.EpisodeListView);

        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
