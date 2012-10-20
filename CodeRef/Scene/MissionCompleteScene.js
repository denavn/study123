var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var MissionCompleteController = require("../Controller/MissionCompleteController").MissionCompleteController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.MissionCompleteScene = Scene.subclass({
    classname  : "MissionCompleteScene",
    sceneName  : "MissionCompleteScene",
    controller : null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new MissionCompleteController();

        GUIBuilder.loadConfigFromFile(
            "Content/view/MissionCompleteView.json",
            _self.controller,
            function (e){
                if (e && e.classname === 'NGGOError') {
                    console.log('error: ' + e);
                }
                Layer.addRootChild(_self.controller.MissionCompleteView, Layer.Depth.TOP);
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

        Layer.removeRootChild(this.controller.MissionCompleteView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
