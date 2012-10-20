var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var FriendRequestCancelCompleteController = require("../Controller/FriendRequestCancelCompleteController").FriendRequestCancelCompleteController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.FriendRequestCancelCompleteScene = Scene.subclass({
    classname: "FriendRequestCancelCompleteScene",
    sceneName: "FriendRequestCancelCompleteScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new FriendRequestCancelCompleteController();
        GUIBuilder.loadConfigFromFile("Content/view/FriendRequestCancelCompleteView.json", _self.controller, function (e){
            Layer.addRootChild(_self.controller.FriendRequestCancelCompleteView, Layer.Depth.TOP);
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

        Layer.removeRootChild(this.controller.FriendRequestCancelCompleteView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
