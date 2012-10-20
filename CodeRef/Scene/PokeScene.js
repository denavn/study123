var Scene = require('../../NGGo/Framework/Scene/Scene').Scene;
var PokeController = require('../Controller/PokeController').PokeController;
var GUIBuilder = require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Layer = require('../Layer').Layer;

exports.PokeScene = Scene.subclass({

    classname: "PokeScene",

    sceneName: "PokeScene",

    initialize: function() {
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");
        var _self = this;
        this.controller = new PokeController();
        GUIBuilder.loadConfigFromFile("Content/view/PokeView.json", this.controller, function (e){
            Layer.addRootChild(_self.controller.PokeView, Layer.Depth.MAIN);
        });
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname+"::onResume");
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname+"::onPause");
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname+"::onExit");
        this.controller.destroyAll();
        this.controller = null;
    }

});
