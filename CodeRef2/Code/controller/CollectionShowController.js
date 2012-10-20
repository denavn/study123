/**
 * @author
 */

var Core			 = require('../../NGCore/Client/Core').Core;
var SceneDirector	 = require('../../NGGo/Framework/Scene/SceneDirector').SceneDirector;

exports.CollectionShowController = Core.Class.subclass({
    classname: "CollectionShowController",

    initialize: function() {
    },

    action_close: function(elem, param) {
       
    },

    action_click: function(elem, param) {
    	console.log('You clicked ' + param + '!');        
        if(param === "GotoCollectionPage") {
        	console.log("Go to CollectionPage");
        	SceneDirector.transition("COLLECTION_MAP_SCENE");
        }
    },

    deactive: function() {
        
    },

    active: function() {
        
    }
});