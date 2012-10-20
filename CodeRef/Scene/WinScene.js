var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var WinController = require("../Controller/WinController").WinController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.WinScene = Scene.subclass({
    classname: "WinScene",
    sceneName: "WinScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new WinController();

        GUIBuilder.loadConfigFromFile(
            "Content/view/WinView.json",
            self.controller,
            function (e){
                Layer.addRootChild(self.controller.WinView, Layer.Depth.TOP);
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

        Layer.removeRootChild(this.controller.WinView);
        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
