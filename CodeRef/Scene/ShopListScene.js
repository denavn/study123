var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var ShopListController = require("../Controller/ShopListController").ShopListController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;
var GameAPI = require("../GameAPI").GameAPI;
var ItemListNode = require('../GLUI/ItemListNode').ItemListNode;

exports.ShopListScene = Scene.subclass({
    classname: "ShopListScene",
    sceneName: "ShopListScene",

    controller: null,

    initialize: function($super) {
        $super();
        this.list = [];
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new ShopListController();
        GUIBuilder.loadConfigFromFile("Content/view/ShopListView.json", _self.controller, function (e){
            Layer.addRootChild(_self.controller.ShopListView, Layer.Depth.MAIN);
            _self._updateList();
        });
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname + "::onResume");

        if (prevScene.toString() !== "LoadingScene") {
            this._updateList();
        }

        this.controller.active();
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname + "::onPause");
        this.controller.deactive();
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname + "::onExit");

        Layer.removeRootChild(this.controller.ShopListView);
        this.controller.destroyAll();
        this.controller = null;
    },

    _updateList: function(category) {
        var _self = this;
        GameAPI.Shop.getList(category, function (res) {
            var i    = 0,
                item = null;
            _self.list = res;
            if (!_self.controller) return;

            _self.controller.ItemList.clearItems();
            for (i = 0; i < _self.list.length; i++) {
                _self._buildElement(_self.list[i]);
            }
        });
    },

    _buildElement: function(item) {
        elm = new ItemListNode();
        elm.setItem(item);
        elm.setCommitImage('Content/image/shop/btn_buy_shop.png');
        elm.setCommitFunc(this.controller.action_select);
        this.controller.ItemList.addItem(elm);
    }
});
