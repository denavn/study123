/********************************************************************************************
 * Class Name: MainGame 
 * 
 * @Description: 
 * 
 *******************************************************************************************/

var Core					= require('../../NGCore/Client/Core').Core;
var GL2						= require('../../NGCore/Client/GL2').GL2;
var ScreenManager			= require('../../NGGo/Service/Display/ScreenManager').ScreenManager;
var SceneDirector 			= require('../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory 			= require('../../NGGo/Framework/Scene/SceneFactory').SceneFactory;
var MainScene 				= require('./Scene/MainScene').MainScene;
var TagScene				= require('./Scene/TagPage/TagScene').TagScene;
var TagTwoScene				= require('./Scene/TagPage/TagTwoScene').TagTwoScene;
var CollectionMapScene		= require('./Scene/CollectionPage/CollectionMapScene').CollectionMapScene;
var CollectionShowScene		= require('./Scene/CollectionPage/CollectionShowScene').CollectionShowScene;
var SceneViewCard 			= require('../view/Scene/CardSynthesizePage/SceneViewCard').SceneViewCard;

exports.MainGame= Core.Class.subclass({
	initialize:function() {
	    NgLogD("++++ MainGame");
	    this.registerScenes();
	    ScreenManager.setPortrait(function ()
	    {
	        ScreenManager.register(
	        {
	            type: "FixWidth",
	            name: "GUI",
	            logicalWidth: 320
	        });
	        ScreenManager.setDefault("GUI");
	        GL2.Root.addChild(ScreenManager.getRootNode());
	
	        // Background;
	        var backdrop = new GL2.Sprite();
	        backdrop.setImage("Content/black.png", ScreenManager.logicalSize, [0, 0]);
	        backdrop.setDepth(0);
	        ScreenManager.getRootNode().addChild(backdrop);	        
			// Push main scene
	    	SceneDirector.push("MAIN_SCENE");
	    });
	},
	
	registerScenes: function() {
    	SceneFactory.register(MainScene, "MAIN_SCENE");
		SceneFactory.register(TagScene, "TAG_SCENE");
		SceneFactory.register(TagTwoScene, "TAG_TWO_SCENE");
		SceneFactory.register(CollectionMapScene, "COLLECTION_MAP_SCENE");
    	SceneFactory.register(CollectionShowScene, "COLLECTION_SHOW_SCENE");
		SceneFactory.register(SceneViewCard, "SENCE_VIEW_CARD");
	}
});
