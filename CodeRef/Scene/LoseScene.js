var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var LoseController = require("../Controller/LoseController").LoseController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.LoseScene = Scene.subclass({
    classname: "LoseScene",
    sceneName: "LoseScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new LoseController();

        GUIBuilder.loadConfigFromFile(
            "Content/view/LoseView.json",
            self.controller,
            function (e){
                Layer.addRootChild(self.controller.LoseView, Layer.Depth.TOP);
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

        Layer.removeRootChild(this.controller.LoseView);
        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
