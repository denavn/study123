var Scene = require('../../NGGo/Framework/Scene/Scene').Scene;
var BattleListController = require('../Controller/BattleListController').BattleListController;
var GUIBuilder = require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Layer = require('../Layer').Layer;
var GLUI = require('../../NGGo/GLUI').GLUI;
var GL2 = require('../../NGCore/Client/GL2').GL2;
var UI = require('../../NGCore/Client/UI').UI;

exports.BattleListScene = Scene.subclass({

    classname: "BattleListScene",

    sceneName: "BattleListScene",

    initialize: function() {
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");
        var _self = this;
        _self.controller = new BattleListController();
        GUIBuilder.loadConfigFromFile("Content/view/BattleListView.json", _self.controller, function (e){
            _self.controller.setArea(option.area);
            Layer.addRootChild(_self.controller.BattleListView, Layer.Depth.MAIN);
            setTimeout(function() {
                _self.controller.update();
            }, 100);
        });
    },

    onResume: function(prevScene, option) {
        this.controller.active();
        NgLogD(this.classname+"::onResume");
    },

    onPause: function(nextScene, option) {
        this.controller.deactive();
        NgLogD(this.classname+"::onPause");
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname+"::onExit");
        Layer.removeRootChild(this.controller.BattleListView);
        this.controller.deactive();
        this.controller.destroy();
        this.controller = null;
    }

});
