var Core = require('../../NGCore/Client/Core').Core;

exports.StaminaEmptyController = Core.Class.subclass({
    classname: 'StaminaEmptyController',

    initialize: function() {
    },

    destroy: function() {
    },

    deactive: function() {
        this.StaminaEmptyView.setTouchable(false);
    },

    active: function() {
        this.StaminaEmptyView.setTouchable(true);
    },

    onConfigLoaded: function() {
        NgLogD(this.classname + '.onConfigLoaded');
    },

    action_useClick: function(elem, param) {
        NgLogD(this.classname + '.action_useClick');
    },

    action_shopClick: function(elem, param) {
        NgLogD(this.classname + '.action_shopClick');
    },

    action_useFriendPointClick: function(elem, param) {
        NgLogD(this.classname + '.action_useFriendPointClick');
    },

    action_closeClick: function(elem, param) {
        NgLogD(this.classname + '.action_closeClick');
        SceneDirector.pop();
    }
});
