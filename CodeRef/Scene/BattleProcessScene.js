var Scene = require('../../NGGo/Framework/Scene/Scene').Scene;
var BattleProcessController = require('../Controller/BattleProcessController').BattleProcessController;
var GUIBuilder = require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Layer = require('../Layer').Layer;

exports.BattleProcessScene = Scene.subclass({

    classname: "BattleProcessScene",

    sceneName: "BattleProcessScene",

    initialize: function() {
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");
        var _self = this;
        this.controller = new BattleProcessController();
        GUIBuilder.loadConfigFromFile("Content/view/BattleProcessView.json", this.controller, function (e){
            Layer.addRootChild(_self.controller.BattleProcessView, Layer.Depth.MAIN);
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
