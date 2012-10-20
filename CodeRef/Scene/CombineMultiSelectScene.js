var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var CombineMultiSelectController = require("../Controller/CombineMultiSelectController").CombineMultiSelectController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;
var Core = require("../../NgCore/Client/Core").Core;
var HeroStat = require("../Common/Util/HeroStat").HeroStat;


exports.CombineMultiSelectScene = Scene.subclass({
    classname: "CombineMultiSelectScene",
    sceneName: "CombineMultiSelectScene",

    controller: null,
    listener: null,

    initialize: function() {
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;
        
        if (!option) {
        	option = {"id": 1};
        }
        _self.controller = new CombineMultiSelectController(option);
        GUIBuilder.loadConfigFromFile("Content/view/CombineMultiSelectView.json", _self.controller, function (e){
            Layer.addRootChild(_self.controller.CombineMultiSelectView, Layer.Depth.MAIN);
            
            _self.controller.createGameListener();
            _self.controller.updateList();
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

        Layer.removeRootChild(this.controller.CombineMultiSelectView);
        this.controller.destroyAll();
//        this.controller.destroy();
        this.controller = null;
    }
});
