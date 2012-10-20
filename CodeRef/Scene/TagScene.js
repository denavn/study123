var Scene 			= require('../../NGGo/Framework/Scene/Scene').Scene;
var TagController 	= require('../Controller/TagController').TagController;
var GUIBuilder 		= require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Layer 			= require('../Layer').Layer;
var Pool 			= require('../Pool').Pool;
var GameAPI			= require('../GameAPI').GameAPI;

exports.TagScene = Scene.subclass({
    classname: "TagScene",
    sceneName: "TagScene",
    controller: null,

    initialize: function($super) {
		this.heroLeft = null;
		this.heroRight = null;
		
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");
        
        GameAPI.User.getSelfStatus(function(data){
        	var heroLeft = data.tag.a;
        	var heroRight = data.tag.b;
        	
        	this.controller = new TagController();
	        GUIBuilder.loadConfigFromFile("Content/view/TagView.json", this.controller, function (e){
	            var parentNode = this.controller.TagView;
	            Layer.addRootChild(parentNode, Layer.Depth.MAIN);
	            this.controller.setupTags(heroLeft, heroRight);
	        }.bind(this));
        }.bind(this));
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname+"::onResume");
        this.controller.setupTags({}, {});
        this.controller.active();
    },
    
    onPause: function(nextScene, option) {
        NgLogD(this.classname+"::onPause");
        this.controller.deactive();
    },
    
    onExit: function(nextScene, option) {
        NgLogD(this.classname+"::onExit");

        Layer.removeRootChild(this.controller.TagView);
        this.controller.destroyAll();
        this.controller = null;
    }
});