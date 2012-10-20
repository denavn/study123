var Core = require("../../NGCore/Client/Core").Core;
var Pool = require('../Pool').Pool;

exports.CaptureBattleController = Core.Class.subclass({
    classname: "CaptureBattleController",

    initialize: function() {
    },

    destroy: function() {
    },

    deactive: function() {
        this.CaptureBattleView.setTouchable(false);
    },

    active: function() {
        this.CaptureBattleView.setTouchable(true);
    },

    action_movieClick: function(elem, param) {
        SceneDirector.transition("CaptureResultScene");
    }
});
