var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var CombineSingleSelectController = require("../Controller/CombineSingleSelectController").CombineSingleSelectController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.CombineSingleSelectScene = Scene.subclass({
    classname: "CombineSingleSelectScene",
    sceneName: "CombineSingleSelectScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new CombineSingleSelectController();
        GUIBuilder.loadConfigFromFile("Content/view/CombineSingleSelectView.json", _self.controller, function (e){
            Layer.addRootChild(_self.controller.CombineSingleSelectView, Layer.Depth.MAIN);
            _self.controller.setBaseHero(option.basehero);
            _self.controller.updateList(option.list);
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

        Layer.removeRootChild(this.controller.CombineSingleSelectView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
