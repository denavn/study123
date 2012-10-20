var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var FriendListController = require("../Controller/FriendListController").FriendListController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.FriendListScene = Scene.subclass({
    classname: "FriendListScene",
    sceneName: "FriendListScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new FriendListController();
        GUIBuilder.loadConfigFromFile("Content/view/FriendListView.json", _self.controller, function (e) {
            Layer.addRootChild(_self.controller.FriendListView, Layer.Depth.MAIN);
            _self.controller.onSceneLoaded();
        });
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname + "::onResume");

        if (option && option.update) {
            this.controller[option.update]();
        }
        this.controller.active();
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname + "::onPause");
        this.controller.deactive();
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname + "::onExit");

        Layer.removeRootChild(this.controller.FriendListView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
