var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var FriendPendingCompleteController = require("../Controller/FriendPendingCompleteController").FriendPendingCompleteController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.FriendPendingCompleteScene = Scene.subclass({
    classname: "FriendPendingCompleteScene",
    sceneName: "FriendPendingCompleteScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new FriendPendingCompleteController();
        GUIBuilder.loadConfigFromFile("Content/view/FriendPendingCompleteView.json", _self.controller, function (e){
            Layer.addRootChild(_self.controller.FriendPendingCompleteView, Layer.Depth.TOP);
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

        Layer.removeRootChild(this.controller.FriendPendingCompleteView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
