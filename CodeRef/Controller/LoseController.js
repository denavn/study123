var Core = require('../../NGCore/Client/Core').Core;

exports.LoseController = Core.Class.subclass({
    classname: 'LoseController',

    initialize: function() {
    },

    destroy: function() {
    },

    deactive: function() {
        this.LoseView.setTouchable(false);
    },

    active: function() {
        this.LoseView.setTouchable(true);
    },

    action_click: function(elem, param) {
        SceneDirector.transition("BossResultScene");
    }
});
