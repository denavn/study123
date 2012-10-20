var Scene = require('../../NGGo/Framework/Scene/Scene').Scene;
var ProfileController = require('../Controller/ProfileController').ProfileController;
var GUIBuilder = require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Layer = require('../Layer').Layer;

exports.ProfileScene = Scene.subclass({

    classname: "ProfileScene",

    sceneName: "ProfileScene",

    initialize: function() {
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");
        var _self = this;
        this.controller = new ProfileController();
        GUIBuilder.loadConfigFromFile("Content/view/ProfileView.json", this.controller, function (e){
            Layer.addRootChild(_self.controller.ProfileView, Layer.Depth.MAIN);
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
