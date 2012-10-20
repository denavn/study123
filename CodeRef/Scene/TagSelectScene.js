var Scene 				= require("../../NGGo/Framework/Scene/Scene").Scene;
var TagSelectController = require("../Controller/TagSelectController").TagSelectController;
var GUIBuilder 			= require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer 				= require("../Layer").Layer;


exports.TagSelectScene = Scene.subclass({
    classname: "TagSelectScene",
    sceneName: "TagSelectScene",

    initialize: function($super) {
        $super();
        this.controller = null;
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter option=" + option);

        this.controller = new TagSelectController();
        this.controller.setTagController(option.tagController);
        this.controller.setPosition(option.position);

        GUIBuilder.loadConfigFromFile("Content/view/TagSelectView.json", this.controller, function (e) {
            var parentNode = this.controller.TagSelectView;
            Layer.addRootChild(parentNode, Layer.Depth.MAIN);
            this.controller.setupTags();
            this.controller.updateList();
        }.bind(this));
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

        Layer.removeRootChild(this.controller.TagSelectView);
        this.controller.destroyAll();
        this.controller = null;
    }

});