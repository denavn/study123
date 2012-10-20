var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var ItemListController = require("../Controller/ItemListController").ItemListController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;
var GameAPI = require("../GameAPI").GameAPI;
var ItemListNode = require('../GLUI/ItemListNode').ItemListNode;

exports.ItemListScene = Scene.subclass({
    classname: "ItemListScene",
    sceneName: "ItemListScene",

    controller: null,

    initialize: function($super) {
        $super();
        this.list = [];
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new ItemListController();
        GUIBuilder.loadConfigFromFile("Content/view/ItemListView.json", _self.controller, function (e){
            Layer.addRootChild(_self.controller.ItemListView, Layer.Depth.MAIN);
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

        Layer.removeRootChild(this.controller.ItemListView);
        this.controller.destroyAll();
        this.controller = null;
    },

    _updateList: function(category) {
        var _self = this;
        GameAPI.User.getItemList(category, function (res) {
            var i    = 0,
                item = null;
            _self.list = res;
            _self.controller.ItemList.clearItems();
            for (i = 0; i < _self.list.length; i++) {
                _self._buildElement(_self.list[i]);
            }
        });
    },

    _buildElement: function(item) {
        elm = new ItemListNode();
        elm.setItem(item);
        elm.setCommitImage('Content/image/shop/btn_use.png');
        elm.setCommitFunc(this.controller.action_select);
        this.controller.ItemList.addItem(elm);
    }
});
