var Core = require('../../NGCore/Client/Core').Core;
var GameAPI = require('../GameAPI').GameAPI;

exports.RequestSecretController = Core.Class.subclass({
    classname: 'RequestSecretController',

    initialize: function() {
    },

    destroy: function() {
    },

    deactive: function() {
        this.RequestSecretView.setTouchable(false);
    },

    active: function() {
        this.RequestSecretView.setTouchable(true);
    },

    action_acceptClick: function(elem, param) {
        GameAPI.Mission.requestSecret(
            Pool.mission.episode.transactionId,
            function() {
                SceneDirector.push("ModalDialogScene", {
                    message: "秘密特訓を申請しました"
                });
            }
        );
    },

    action_rejectClick: function(elem, param) {
        SceneDirector.pop();
    },

    onSceneLoaded: function() {
        this._updateUser();
    },

    _updateUser: function() {
        var self = this;

        GameAPI.User.getUserStatus(Pool.mission.result.meet_user_id, function(user) {
            self.UserAvatarContainer.addChild(user.getAvatarSprite([64, 64]));

            self.UserName.gluiobj.replace({ name: user.nickname });
            self.UserLevel.gluiobj.replace({ level: user.level });

            self.UserHeroAContainer.addChild(user.tag.a.getIconSprite());
            self.UserHeroBContainer.addChild(user.tag.b.getIconSprite());
        });
    }
});
