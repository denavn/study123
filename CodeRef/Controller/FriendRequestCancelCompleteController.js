var Core = require('../../NGCore/Client/Core').Core;

exports.FriendRequestCancelCompleteController = Core.Class.subclass({
    classname: "FriendRequestCancelCompleteController",

    initialize: function() {
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'FriendRequestCancelCompleteScene') {
            SceneDirector.pop();
            SceneDirector.pop({ update: 'action_select_requested' });
        }
    },

    action_click: function(elem, param) {
    },

    action_commit_cancel: function (elem, param) {
        // TODO commit cancel
        this.action_close(elem, param);
    },

    deactive: function() {
        this.FriendRequestCancelCompleteView.setTouchable(false);
    },

    active: function() {
        this.FriendRequestCancelCompleteView.setTouchable(true);
    },

    onSceneLoaded: function (user) {
        // avatar
        var avatar = user.getAvatarSprite([64, 64]);
        avatar.setPosition(41, 171);
        this.FriendRequestCancelCompleteView.addChild(avatar);
        // tag
        var tag_a = user.tag.a.getIconSprite();
        var tag_b = user.tag.b.getIconSprite();
        tag_a.setPosition( 83, 171);
        tag_b.setPosition(115, 171);
        this.FriendRequestCancelCompleteView.addChild(tag_a);
        this.FriendRequestCancelCompleteView.addChild(tag_b);
        // replace
        this.DescriptionLabel.gluiobj.replace({ nickname: user.nickname });
        this.NameLabel.gluiobj.replace({ nickname: user.nickname });
        this.LevelLabel.gluiobj.replace({ level: user.level });
    }
});
