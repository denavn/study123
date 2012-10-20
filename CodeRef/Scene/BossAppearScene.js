var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var BossAppearController = require("../Controller/BossAppearController").BossAppearController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.BossAppearScene = Scene.subclass({
    classname: "BossAppearScene",
    sceneName: "BossAppearScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new BossAppearController();
        GUIBuilder.loadConfigFromFile(
            "Content/view/BossAppearView.json",
            self.controller,
            function (e) {
                self.controller.onSceneLoaded(function() {
                    Layer.addRootChild(self.controller.BossAppearView, Layer.Depth.TOP);
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

        Layer.removeRootChild(this.controller.BossAppearView);
        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
