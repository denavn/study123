var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var WelcomeController = require("../Controller/WelcomeController").WelcomeController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.WelcomeScene = Scene.subclass({
    classname: "WelcomeScene",
    sceneName: "WelcomeScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new WelcomeController();
        GUIBuilder.loadConfigFromFile("Content/view/WelcomeView.json", _self.controller, function (e){
            Layer.addRootChild(_self.controller.WelcomeView, Layer.Depth.MAIN);
        });
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname + "::onResume");
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname + "::onPause");
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname + "::onExit");

        Layer.removeRootChild(this.controller.WelcomeView);

        this.controller.destroyAll();
        this.controller = null;
    }
});
