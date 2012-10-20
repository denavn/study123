var Core = require('../../NGCore/Client/Core').Core;

exports.KKDMaxDetailController = Core.Class.subclass({
    classname: 'KKDMaxDetailController',

    initialize: function() {
    },

    destroy: function() {
    },

    deactive: function() {
        this.KKDMaxDetailView.setTouchable(false);
    },

    active: function() {
        this.KKDMaxDetailView.setTouchable(true);
    },

    onConfigLoaded: function() {
        
    },

    action_forwardClick: function(elem, param) {
        SceneDirector.pop();
    }
});
