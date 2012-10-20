var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var ItemUseController = require("../Controller/ItemUseController").ItemUseController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;
var Pool = require("../Pool").Pool;

exports.ItemUseScene = Scene.subclass({
    classname: "ItemUseScene",
    sceneName: "ItemUseScene",

    controller: null,

    initialize: function($super) {
        $super();
        this.item = null;
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;
        _self.item = option.item;

        _self.controller = new ItemUseController();
        GUIBuilder.loadConfigFromFile("Content/view/ItemUseView.json", _self.controller, function (e){
            _self.controller.setItem(_self.item);
            Layer.getHeaderController().deactive();
            Layer.addRootChild(_self.controller.ItemUseView, Layer.Depth.TOP);
        });
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname + "::onResume");
        Layer.getHeaderController().deactive();
        this.controller.active();
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname + "::onPause");
        Layer.getHeaderController().active();
        this.controller.deactive();
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname + "::onExit");
        Layer.getHeaderController().active();

        Layer.removeRootChild(this.controller.ItemUseView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
