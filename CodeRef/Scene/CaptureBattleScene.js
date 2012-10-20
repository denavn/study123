var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var CaptureBattleController = require("../Controller/CaptureBattleController").CaptureBattleController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.CaptureBattleScene = Scene.subclass({
    classname: "CaptureBattleScene",
    sceneName: "CaptureBattleScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new CaptureBattleController();

        GUIBuilder.loadConfigFromFile(
            "Content/view/CaptureBattleView.json",
            self.controller,
            function (e){
                Layer.addRootChild(self.controller.CaptureBattleView, Layer.Depth.TOP);
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

        Layer.removeRootChild(this.controller.CaptureBattleView);
        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
