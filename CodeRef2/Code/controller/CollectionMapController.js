/**
 * @author 
 */

var Core			 = require('../../NGCore/Client/Core').Core;
var SceneDirector	 = require('../../NGGo/Framework/Scene/SceneDirector').SceneDirector;


exports.CollectionMapController = Core.Class.subclass({
    classname: "CollectionMapController",

    initialize: function() {
    },

    action_close: function(elem, param) {
       
    },

    action_click: function(elem, param) {
    	console.log('You clicked ' + param + '!');
        if (param === "HomeButton") {
        	console.log("Go to main scene");
        	SceneDirector.transition("MAIN_SCENE");
        }
        if(param === "Toy") {
        	console.log("Click Toy");
        	SceneDirector.transition("COLLECTION_SHOW_SCENE");
        }
        if(param === "Toy1") {
        	console.log("Click Toy1");
        	SceneDirector.transition("COLLECTION_SHOW_SCENE");
        }
        if(param === "Toy2") {
        	console.log("Click Toy2");
        	SceneDirector.transition("COLLECTION_SHOW_SCENE");
        }
        if(param === "Toy4") {
        	console.log("Click Toy4");
        	SceneDirector.transition("COLLECTION_SHOW_SCENE");
        }
    },

    deactive: function() {
        
    },

    active: function() {
        
    }
});