var Core = require('../../NGCore/Client/Core').Core;

exports.CombineResultController = Core.Class.subclass({
    classname: "CombineResultController",

    initialize: function() {
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'CombineResultScene') {
            SceneDirector.pop();
        }
    },

    action_click: function(elem, param) {
    },

    deactive: function() {
        this.CombineResultView.setTouchable(false);
    },

    active: function() {
        this.CombineResultView.setTouchable(true);
    }
});
