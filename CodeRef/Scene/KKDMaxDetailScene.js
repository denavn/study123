var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var KKDMaxDetailController = require("../Controller/KKDMaxDetailController").KKDMaxDetailController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.KKDMaxDetailScene = Scene.subclass({
    classname: "KKDMaxDetailScene",
    sceneName: "KKDMaxDetailScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new KKDMaxDetailController();

        GUIBuilder.loadConfigFromFile(
            "Content/view/KKDMaxDetailView.json",
            self.controller,
            function (e) {
                Layer.addRootChild(self.controller.KKDMaxDetailView, Layer.Depth.TOP);
                self.controller.onConfigLoaded();
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

        Layer.removeRootChild(this.controller.KKDMaxDetailView);
        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
