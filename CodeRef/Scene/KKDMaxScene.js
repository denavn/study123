var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var KKDMaxController = require("../Controller/KKDMaxController").KKDMaxController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.KKDMaxScene = Scene.subclass({
    classname: "KKDMaxScene",
    sceneName: "KKDMaxScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new KKDMaxController();

        GUIBuilder.loadConfigFromFile(
            "Content/view/KKDMaxView.json",
            _self.controller,
            function (e){
                if (e) {
                    console.log('error: ' + e);
                }
                Layer.addRootChild(_self.controller.KKDMaxView, Layer.Depth.TOP);
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

        Layer.removeRootChild(this.controller.KKDMaxView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
