var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var ShopItemController = require("../Controller/ShopItemController").ShopItemController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var GLUI = require("../../NGGo/GLUI").GLUI;
var Layer = require("../Layer").Layer;

exports.ShopItemScene = Scene.subclass({
    classname: "ShopItemScene",
    sceneName: "ShopItemScene",

    controller: null,

    initialize: function($super) {
        $super();
        this.item = null;
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;
        _self.item = option.item;

        _self.controller = new ShopItemController(_self.item.id);
        GUIBuilder.loadConfigFromFile("Content/view/ShopItemView.json", _self.controller, function (e){
            Layer.getHeaderController().deactive();
            var controller = _self.controller,
                item       = _self.item;
            controller.ItemIcon.gluiobj.setImage(item.getImagePath(), null, [80, 80]);
            controller.ItemName.setText(item.name);
            controller.ItemPrice.setText("" + item.price + "モバコイン");
            controller.ItemHasCount.setText("" + item.has_count + "個所有");
            controller.ItemDescription.setText(item.description);
            Layer.addRootChild(_self.controller.ShopItemView, Layer.Depth.TOP);
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
        Layer.removeRootChild(this.controller.ShopItemView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
