var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var CaptureResultController = require("../Controller/CaptureResultController").CaptureResultController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.CaptureResultScene = Scene.subclass({
    classname: "CaptureResultScene",
    sceneName: "CaptureResultScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new CaptureResultController();

        GUIBuilder.loadConfigFromFile(
            "Content/view/CaptureResultView.json",
            self.controller,
            function (e){
                Layer.addRootChild(self.controller.CaptureResultView, Layer.Depth.TOP);
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

        Layer.removeRootChild(this.controller.CaptureResultView);
        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
