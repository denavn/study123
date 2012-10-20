var Core = require('../../NGCore/Client/Core').Core;

exports.FeedDetailController = Core.Class.subclass({
    classname: "FeedDetailController",

    initialize: function() {
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'FeedDetailScene') {
            SceneDirector.pop();
        }
    },

    action_click: function(elem, param) {
    },

    deactive: function() {
        this.FeedDetailView.setTouchable(false);
    },

    active: function() {
        this.FeedDetailView.setTouchable(true);
    },

    buildNodes: function() {
    }
});
