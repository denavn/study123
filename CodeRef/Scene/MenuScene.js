var Scene = require('../../NGGo/Framework/Scene/Scene').Scene;
var MenuController = require('../Controller/MenuController').MenuController;
var GUIBuilder = require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Layer = require('../Layer').Layer;

exports.MenuScene = Scene.subclass({

    classname: "MenuScene",

    sceneName: "MenuScene",

    initialize: function() {
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");
        var _self = this;
        this.controller = new MenuController();
        GUIBuilder.loadConfigFromFile("Content/view/MenuView.json", this.controller, function (e){
            Layer.getHeaderController().deactive();
            Layer.addRootChild(_self.controller.MenuView, Layer.Depth.TOP);
        });
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname+"::onResume");
        Layer.getHeaderController().deactive();
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname+"::onPause");
        Layer.getHeaderController().active();
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname+"::onExit");
        Layer.getHeaderController().active();
        Layer.removeRootChild(this.controller.MenuView);
        this.controller.destroyAll();
        this.controller = null;
    }

});
