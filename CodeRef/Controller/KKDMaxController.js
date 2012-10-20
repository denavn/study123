var Core = require('../../NGCore/Client/Core').Core;

exports.KKDMaxController = Core.Class.subclass({
    classname: 'KKDMaxController',

    initialize: function() {
    },

    deactive: function() {
        this.KKDMaxView.setTouchable(false);
    },

    active: function() {
        this.KKDMaxView.setTouchable(true);
    },

    action_kkdClick: function(elem, param) {
        NgLogD(this.classname + '.action_kkdClick');
        SceneDirector.transition("KKDMaxDetailScene");
    }
});
