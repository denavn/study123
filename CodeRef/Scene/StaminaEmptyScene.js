var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var StaminaEmptyController = require("../Controller/StaminaEmptyController").StaminaEmptyController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.StaminaEmptyScene = Scene.subclass({
    classname: "StaminaEmptyScene",
    sceneName: "StaminaEmptyScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new StaminaEmptyController();

        GUIBuilder.loadConfigFromFile(
            "Content/view/StaminaEmptyView.json",
            self.controller,
            function (e) {
                Layer.addRootChild(self.controller.StaminaEmptyView, Layer.Depth.TOP);
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

        Layer.removeRootChild(this.controller.StaminaEmptyView);
        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
