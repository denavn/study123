var Global = require('../../Config/Global').Global;
var Core = require("../../NGCore/Client/Core").Core;
var GameAPI = require('../GameAPI').GameAPI;
var Pool = require('../Pool').Pool;

exports.CaptureAppearController = Core.Class.subclass({
    classname: "CaptureAppearController",

    initialize: function() {
    },

    destroy: function() {
    },

    deactive: function() {
        this.CaptureAppearView.setTouchable(false);
    },

    active: function() {
        this.CaptureAppearView.setTouchable(true);
    },

    onSceneLoaded: function() {
        var self = this;

        GameAPI.User.getItem(Global.item.glove_id, function(res) {
            var max_num = Global.mission.max_glove_num;

            if (max_num <= res.has_count) {
                self.GloveCount.gluiobj.setMax(max_num);
            }
            else {
                self.GloveCount.gluiobj.setMax(res.has_count);
            }
        });
    },

    action_buyClick: function(elem, param) {
        console.log(this.classname + "buy clicked");
    },

    action_battleWithItemClick: function(elem, param) {
        var self = this;

        GameAPI.Mission.capture(
            Pool.mission.result.transactionId,
            self.GloveCount.gluiobj.getValue(),
            function(res) {
                Pool.mission.captureResult = res;
                SceneDirector.transition("CaptureBattleScene");
            }
        );
    },

    action_battleWithoutItemClick: function(elem, param) {
        var self = this;

        GameAPI.Mission.capture(
            Pool.mission.result.transactionId,
            0,
            function(res) {
                Pool.mission.captureResult = res;
                SceneDirector.transition("CaptureBattleScene");
            }
        );
    },

    action_forwardClick: function(elem, param) {
        SceneDirector.pop();
    }
});
