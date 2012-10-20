var Core = require('../../NGCore/Client/Core').Core;

exports.OthersMyPageController = Core.Class.subclass({
    classname: "OthersMyPageController",

    initialize: function() {
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'OthersMyPageScene') {
            SceneDirector.pop();
        }
    },

    action_click: function(elem, param) {
    },

    deactive: function() {
        this.OthersMyPageView.setTouchable(false);
    },

    active: function() {
        this.OthersMyPageView.setTouchable(true);
    },

    buildNodes: function() {
    }
});
