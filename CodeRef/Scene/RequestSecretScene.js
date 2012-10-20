var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var RequestSecretController = require("../Controller/RequestSecretController").RequestSecretController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.RequestSecretScene = Scene.subclass({
    classname: "RequestSecretScene",
    sceneName: "RequestSecretScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new RequestSecretController();

        GUIBuilder.loadConfigFromFile(
            "Content/view/RequestSecretView.json",
            self.controller,
            function (e) {
                self.controller.onSceneLoaded();
                Layer.addRootChild(self.controller.RequestSecretView, Layer.Depth.TOP);
            }
        );
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname + "::onResume");

        if (prevScene.toString() === "ModalDialogScene") {
            SceneDirector.pop();
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

        Layer.removeRootChild(this.controller.RequestSecretView);
        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }
});
