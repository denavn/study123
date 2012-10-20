var Core = require('../../NGCore/Client/Core').Core;
var GameAPI = require('../GameAPI').GameAPI;

exports.FriendRequestCancelConfirmController = Core.Class.subclass({
    classname: "FriendRequestCancelConfirmController",

    initialize: function (user) {
        this._user = user;
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'FriendRequestCancelConfirmScene') {
            SceneDirector.pop();
        }
    },

    action_click: function(elem, param) {
    },

    action_commit_cancel: function (elem, param) {
        var _self = this;
        GameAPI.Friend.reject(_self._user.id, function (res) {
            // TODO
            SceneDirector.push('FriendRequestCancelCompleteScene', { user: _self._user });
        });
    },

    deactive: function() {
        this.FriendRequestCancelConfirmView.setTouchable(false);
    },

    active: function() {
        this.FriendRequestCancelConfirmView.setTouchable(true);
    },

    onSceneLoaded: function (user) {
        // avatar
        var avatar = user.getAvatarSprite([64, 64]);
        avatar.setPosition(41, 171);
        this.FriendRequestCancelConfirmView.addChild(avatar);
        // tag
        var tag_a = user.tag.a.getIconSprite();
        var tag_b = user.tag.b.getIconSprite();
        tag_a.setPosition( 83, 171);
        tag_b.setPosition(115, 171);
        this.FriendRequestCancelConfirmView.addChild(tag_a);
        this.FriendRequestCancelConfirmView.addChild(tag_b);
        // replace
        this.NameLabel.gluiobj.replace({ nickname: user.nickname });
        this.LevelLabel.gluiobj.replace({ level: user.level });
    }
});
