/**
 * @author sonnn
 */

var Core = require('../../NGCore/Client/Core').Core;
var CollectionMapScene = require('../view/Scene/CollectionPage/CollectionMapScene').CollectionMapScene;
var SceneDirector = require('../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var SceneFactory = require('../../NGGo/Framework/Scene/SceneFactory').SceneFactory;

var mainSceneController = 
{
    action_click: function (elem, buttnName)
    {
        console.log('You clicked ' + buttnName + '!');
        if (buttnName === "TagButton") {
        	console.log("Please handle Tag Team Select");
        	
        	// Add tag team select page
        	this.addTagTeamSelectPage();
        } else if (buttnName === "CollectionButton") {
        	this.addCollectionPage();
        } else if (buttnName === "CardButton") {
        	 this.addSynthesizePage();
        }
    },
    
    addTagTeamSelectPage: function() {
		console.log("BEGIN add tage team select page");
		SceneDirector.transition("TAG_SCENE");
    },
    
	addCollectionPage : function(){
    	SceneDirector.transition("COLLECTION_MAP_SCENE");
	},
	
	addSynthesizePage : function()
	{
    	SceneDirector.transition("SENCE_VIEW_CARD");
	}
};

exports.MainSceneController = Core.Class.subclass(mainSceneController);
