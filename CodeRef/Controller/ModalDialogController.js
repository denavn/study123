var Core = require('../../NGCore/Client/Core').Core;

exports.ModalDialogController = Core.Class.subclass({
    classname: "ModalDialogController",

    initialize: function() {
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'ModalDialogScene') {
            SceneDirector.pop();
        }
    },

    deactive: function() {
        this.ModalDialogView.setTouchable(false);
    },

    active: function() {
        this.ModalDialogView.setTouchable(true);
    }
});
