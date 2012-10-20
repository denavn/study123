var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var FriendRequestCancelConfirmController = require("../Controller/FriendRequestCancelConfirmController").FriendRequestCancelConfirmController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.FriendRequestCancelConfirmScene = Scene.subclass({
    classname: "FriendRequestCancelConfirmScene",
    sceneName: "FriendRequestCancelConfirmScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new FriendRequestCancelConfirmController(option.user);
        GUIBuilder.loadConfigFromFile("Content/view/FriendRequestCancelConfirmView.json", _self.controller, function (e){
            Layer.addRootChild(_self.controller.FriendRequestCancelConfirmView, Layer.Depth.TOP);
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

        Layer.removeRootChild(this.controller.FriendRequestCancelConfirmView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
