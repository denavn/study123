var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var CombineResultController = require("../Controller/CombineResultController").CombineResultController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.CombineResultScene = Scene.subclass({
    classname: "CombineResultScene",
    sceneName: "CombineResultScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new CombineResultController();
        GUIBuilder.loadConfigFromFile("Content/view/CombineResultView.json", _self.controller, function (e){
            Layer.addRootChild(_self.controller.CombineResultView, Layer.Depth.MAIN);
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

        Layer.removeRootChild(this.controller.CombineResultView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
