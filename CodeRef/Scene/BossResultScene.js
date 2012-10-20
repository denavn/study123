var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var BossResultController = require("../Controller/BossResultController").BossResultController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.BossResultScene = Scene.subclass({
    classname: "BossResultScene",
    sceneName: "BossResultScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new BossResultController(option);

        GUIBuilder.loadConfigFromFile(
            "Content/view/BossResultView.json",
            self.controller,
            function (e) {
                self.controller.onSceneLoaded(function() {
                    Layer.addRootChild(self.controller.BossResultView, Layer.Depth.TOP);    
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

        Layer.removeRootChild(this.controller.BossResultView);
        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
