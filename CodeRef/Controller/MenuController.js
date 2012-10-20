var Core = require('../../NGCore/Client/Core').Core;
var SceneDirector = require('../../NGGo/Framework/Scene/SceneDirector').SceneDirector;
exports.MenuController = Core.Class.subclass({
    classname: 'MenuController',

    initialize: function() {
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'MenuScene') {
            SceneDirector.pop();
        }
    },

    action_transition: function(elem, SceneName) {
        if (SceneDirector.currentScene.sceneName !== 'MenuScene') {
            return;
        }
        if (SceneDirector.currentScene.sceneName !== SceneName) {
            SceneDirector.popToRoot();
            SceneDirector.transition(SceneName);
        }
    },

    action_click: function(elem, param) {
        NgLogD(param + ' :: click'); 
        if(param === "collection") {
        	console.log("den day");
        	//add HeroCollectionScene
        	this.addHeroCollectionScene();
        }
    },
    addHeroCollectionScene : function() {
    	SceneDirector.popToRoot();
    	SceneDirector.transition("HeroCollectionScene");
    }
   
});
