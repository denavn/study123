var Core = require('../../NGCore/Client/Core').Core;
var GameAPI = require('../GameAPI').GameAPI;

exports.FriendPendingConfirmController = Core.Class.subclass({
    classname: "FriendPendingConfirmController",

    initialize: function (user) {
        this._user = user;
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'FriendPendingConfirmScene') {
            SceneDirector.pop();
        }
    },

    action_click: function(elem, param) {
    },

    action_approve: function (elem, param) {
        var _self = this;
        GameAPI.Friend.approve(_self._user.id, function (res) {
            // TODO
            SceneDirector.push('FriendPendingCompleteScene', { user: _self._user });
        });
    },

    action_reject: function (elem, param) {
        var _self = this;
        GameAPI.Friend.reject(_self._user.id, function (res) {
            if (SceneDirector.currentScene.sceneName === 'FriendPendingConfirmScene') {
                SceneDirector.pop({ update: 'action_select_pending' });
            }
        });
    },

    deactive: function() {
        this.FriendPendingConfirmView.setTouchable(false);
    },

    active: function() {
        this.FriendPendingConfirmView.setTouchable(true);
    },

    onSceneLoaded: function (user) {
        // avatar
        var avatar = user.getAvatarSprite([64, 64]);
        avatar.setPosition(41, 171);
        this.FriendPendingConfirmView.addChild(avatar);
        // tag
        var tag_a = user.tag.a.getIconSprite();
        var tag_b = user.tag.b.getIconSprite();
        tag_a.setPosition( 83, 171);
        tag_b.setPosition(115, 171);
        this.FriendPendingConfirmView.addChild(tag_a);
        this.FriendPendingConfirmView.addChild(tag_b);
        // replace
        this.DescriptionLabel.gluiobj.replace({ nickname: user.nickname });
        this.NameLabel.gluiobj.replace({ nickname: user.nickname });
        this.LevelLabel.gluiobj.replace({ level: user.level });
    }
});
