var Core = require('../../NGCore/Client/Core').Core;

exports.MissionCompleteDetailController = Core.Class.subclass({
    classname: 'MissionCompleteDetailController',

    initialize: function() {
    },

    destroy: function() {
    },

    deactive: function() {
        this.MissionCompleteDetailView.setTouchable(false);
    },

    active: function() {
        this.MissionCompleteDetailView.setTouchable(true);
    },

    onSceneLoaded: function() {
        this._updateProgressGauge();
        this._updateMissionName();
    },

    _updateProgressGauge: function() {
        var mission = Pool.mission.getCurrentMission();
        this.ProgressGauge.gluiobj.setValue(mission.status.achievement_rate / 100);
    },

    _updateMissionName: function() {
        var text = this.SubTitle.gluiobj.getText(),
            mission = Pool.mission.getCurrentMission();
        this.SubTitle.gluiobj.setText(
            text.replace("%mission_name%", mission.name)
        );
    },

    action_forwardClick: function(elem, param) {
        SceneDirector.pop();
    }
});
