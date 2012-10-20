var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var FriendPendingConfirmController = require("../Controller/FriendPendingConfirmController").FriendPendingConfirmController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.FriendPendingConfirmScene = Scene.subclass({
    classname: "FriendPendingConfirmScene",
    sceneName: "FriendPendingConfirmScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new FriendPendingConfirmController(option.user);
        GUIBuilder.loadConfigFromFile("Content/view/FriendPendingConfirmView.json", _self.controller, function (e){
            Layer.addRootChild(_self.controller.FriendPendingConfirmView, Layer.Depth.TOP);
            _self.controller.onSceneLoaded(option.user);
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

        Layer.removeRootChild(this.controller.FriendPendingConfirmView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
