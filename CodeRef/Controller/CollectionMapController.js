var Core = require('../../NGCore/Client/Core').Core;

exports.CollectionMapController = Core.Class.subclass({
    classname: "CollectionMapController",

    initialize: function() {
    },

    action_close: function(elem, param) {
       
    },

    action_click: function(elem, param) {
    },
    
    action_zoomin: function(elem, param) {
    	console.log("Zoom In");
    	
    },
    action_zoomout: function(elem, param) {
    	console.log("Zoom Out");
    },
    action_next: function(elem, param) {
    	console.log("Next");
    },
    action_prev: function(elem, param) {
    	console.log("Prev");
    },
    deactive: function() {
        
    },

    active: function() {
        
    }
});
