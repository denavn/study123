var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var ModalDialogController = require("../Controller/ModalDialogController").ModalDialogController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.ModalDialogScene = Scene.subclass({
    classname: "ModalDialogScene",
    sceneName: "ModalDialogScene",

    controller: null,

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new ModalDialogController();
        GUIBuilder.loadConfigFromFile("Content/view/ModalDialogView.json", _self.controller, function (e){
            _self.controller.Message.gluiobj.setText(option.message);
            Layer.addRootChild(_self.controller.ModalDialogView, Layer.Depth.TOP + 100);
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

        Layer.removeRootChild(this.controller.ModalDialogView);
        this.controller.destroyAll();
        this.controller = null;
    }
});
