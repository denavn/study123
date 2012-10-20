var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var BossBattleController = require("../Controller/BossBattleController").BossBattleController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.BossBattleScene = Scene.subclass({
    classname: "BossBattleScene",
    sceneName: "BossBattleScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new BossBattleController(option);

        GUIBuilder.loadConfigFromFile(
            "Content/view/BossBattleView.json",
            self.controller,
            function (e) {
                self.controller.onSceneLoaded(function() {
                    Layer.addRootChild(self.controller.BossBattleView, Layer.Depth.TOP);
                });
            }
        );
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname + "::onResume");

        if (prevScene.toString() === "WinScene" ||
            prevScene.toString() === "LoseScene") {

            GameAPI.Mission.commitBoss(
                this.controller.process.transactionId,
                this.controller.isWin,
                this.controller.useItem,
                function(res) {
                    SceneDirector.transition("BossResultScene", {
                        result: res
                    });
                }
            );
        }
        else {
            this.controller.active();
        }
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname + "::onPause");
        this.controller.deactive();
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname + "::onExit");

        Layer.removeRootChild(this.controller.BossBattleView);
        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
