var Scene = require('../../NGGo/Framework/Scene/Scene').Scene;
var BattleResultController = require('../Controller/BattleResultController').BattleResultController;
var GUIBuilder = require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Layer = require('../Layer').Layer;

exports.BattleResultScene = Scene.subclass({

    classname: "BattleResultScene",

    sceneName: "BattleResultScene",

    initialize: function() {
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");
        var _self = this;
        this.controller = new BattleResultController();
        GUIBuilder.loadConfigFromFile("Content/view/BattleResultView.json", this.controller, function (e){
            Layer.addRootChild(_self.controller.BattleResultView, Layer.Depth.TOP);
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
        this.controller.destroy();
        this.controller.destroyAll();
        this.controller = null;
    }

});
