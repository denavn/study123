var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var CombineBaseSelectController = require("../Controller/CombineBaseSelectController").CombineBaseSelectController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.CombineBaseSelectScene = Scene.subclass({
    classname: "CombineBaseSelectScene",
    sceneName: "CombineBaseSelectScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new CombineBaseSelectController();
        GUIBuilder.loadConfigFromFile("Content/view/CombineBaseSelectView.json", _self.controller, function (e){
            Layer.addRootChild(_self.controller.CombineBaseSelectView, Layer.Depth.MAIN);
            _self.controller.update();
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

        Layer.removeRootChild(this.controller.CombineBaseSelectView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
