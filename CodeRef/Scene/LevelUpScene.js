var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var LevelUpController = require("../Controller/LevelUpController").LevelUpController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.LevelUpScene = Scene.subclass({
    classname: "LevelUpScene",
    sceneName: "LevelUpScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new LevelUpController();
        GUIBuilder.loadConfigFromFile(
            "Content/view/LevelUpFlashView.json",
            _self.controller,
            function (e){
                if (e) {
                    console.log('error: ' + e);
                }
                Layer.addRootChild(_self.controller.LevelUpView, Layer.Depth.TOP);
            }
        );
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname + "::onResume");
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname + "::onPause");
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname + "::onExit");

        Layer.removeRootChild(this.controller.LevelUpView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
