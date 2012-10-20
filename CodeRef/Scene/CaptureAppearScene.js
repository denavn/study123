var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var CaptureAppearController = require("../Controller/CaptureAppearController").CaptureAppearController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.CaptureAppearScene = Scene.subclass({
    classname: "CaptureAppearScene",
    sceneName: "CaptureAppearScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new CaptureAppearController();

        GUIBuilder.loadConfigFromFile(
            "Content/view/CaptureAppearView.json",
            self.controller,
            function (e){
                Layer.addRootChild(self.controller.CaptureAppearView, Layer.Depth.TOP);
                self.controller.onSceneLoaded();
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

        Layer.removeRootChild(this.controller.CaptureAppearView);
        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
