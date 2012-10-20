var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var ShopFinishController = require("../Controller/ShopFinishController").ShopFinishController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.ShopFinishScene = Scene.subclass({
    classname: "ShopFinishScene",
    sceneName: "ShopFinishScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;
        _self.item = option.item;

        _self.controller = new ShopFinishController(_self.item);
        GUIBuilder.loadConfigFromFile("Content/view/ShopFinishView.json", _self.controller, function (e){
            _self.controller.setItem(_self.item);
            Layer.getHeaderController().deactive();
            Layer.addRootChild(_self.controller.ShopFinishView, Layer.Depth.TOP);
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
        Layer.removeRootChild(this.controller.ShopFinishView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
