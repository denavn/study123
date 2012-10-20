var Core = require('../../NGCore/Client/Core').Core;

exports.LevelUpDetailController = Core.Class.subclass({
    classname: 'LevelUpDetailController',

    initialize: function() {
    },

    destroy: function() {
    },

    deactive: function() {
        this.LevelUpDetailView.setTouchable(false);
    },

    active: function() {
        this.LevelUpDetailView.setTouchable(true);
    },

    onSceneLoaded: function() {
        this._updateSubTitle();
        this._updateExtraMessage();
    },

    action_forwardClick: function(elem, param) {
        SceneDirector.pop();
    },

    _updateSubTitle: function() {
        this.SubTitle.gluiobj.replace({
            level: Pool.Mine.level
        });
    },

    _updateExtraMessage: function() {
        this.ExtraMessage.gluiobj.replace({
            battle_point_limit: Pool.Mine.max_battle_stamina,
            muscle_point: "(仮)"
        });
    }
});
