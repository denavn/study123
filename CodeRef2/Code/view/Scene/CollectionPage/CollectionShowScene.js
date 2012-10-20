var GL2 					 = require('../../../../NGCore/Client/GL2').GL2;
var GLUI					 = require('../../../../NGGo/GLUI').GLUI;
var Scene					 = require('../../../../NGGo/Framework/Scene/Scene').Scene;
var ScreenManager			 = require('../../../../NGGo/Service/Display/ScreenManager').ScreenManager;
var GUIBuilder				 = require('../../../../NGGo/Framework/GUIBuilder').GUIBuilder;
var CollectionShowController = require('../../../controller/CollectionShowController').CollectionShowController;

exports.CollectionShowScene = Scene.subclass({
    classname: "CollectionShowScene",
    sceneName: "CollectionShowScene",    

    initialize: function($super) {
        $super();
        this._controller = new CollectionShowController();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");
       
                
        // Create UI
        GUIBuilder.loadConfigFromFile("Config/Scene/CollectionPage/CollectionPopup.json", this._controller, function ()
	    {
        	ScreenManager.getRootNode().addChild(this._controller.CollectionPopup);
	    }.bind(this));
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname + "::onResume");
        this._controller.active();
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname + "::onPause");
        this._controller.deactive();
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname + "::onExit");
        if(this._controller.CollectionPopup) {
	    	ScreenManager.getRootNode().removeChild(this._controller.CollectionPopup);
	    	this._controller.CollectionPopup.destroy();
	    }
       
    }
});