var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var CombineReadyController = require("../Controller/CombineReadyController").CombineReadyController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.CombineReadyScene = Scene.subclass({
    classname: "CombineReadyScene",
    sceneName: "CombineReadyScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new CombineReadyController();
        GUIBuilder.loadConfigFromFile("Content/view/CombineReadyView.json", _self.controller, function (e){
            Layer.addRootChild(_self.controller.CombineReadyView, Layer.Depth.TOP);
        });
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

        Layer.removeRootChild(this.controller.CombineReadyView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
