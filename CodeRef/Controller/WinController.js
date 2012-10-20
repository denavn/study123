var Core = require('../../NGCore/Client/Core').Core;

exports.WinController = Core.Class.subclass({
    classname: 'WinController',

    initialize: function() {
    },

    destroy: function() {
    },

    deactive: function() {
        this.WinView.setTouchable(false);
    },

    active: function() {
        this.WinView.setTouchable(true);
    },

    action_click: function(elem, param) {
        SceneDirector.pop();
    }
});
