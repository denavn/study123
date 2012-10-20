var Core = require('../../NGCore/Client/Core').Core;

exports.FeedListController = Core.Class.subclass({
    classname: "FeedListController",

    initialize: function() {
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'FeedListScene') {
            SceneDirector.pop();
        }
    },

    action_click: function(elem, param) {
    },

    deactive: function() {
        this.FeedListView.setTouchable(false);
    },

    active: function() {
        this.FeedListView.setTouchable(true);
    },

    buildNodes: function() {
    }
});
