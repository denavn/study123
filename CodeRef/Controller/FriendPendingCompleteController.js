var Core = require('../../NGCore/Client/Core').Core;

exports.FriendPendingCompleteController = Core.Class.subclass({
    classname: "FriendPendingCompleteController",

    initialize: function() {
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'FriendPendingCompleteScene') {
            SceneDirector.pop();
            SceneDirector.pop({ update: 'action_select_pending' });
        }
    },

    action_click: function(elem, param) {
    },

    action_handshake: function (elem, param) {
        console.log('handshake!');
    },

    deactive: function() {
        this.FriendPendingCompleteView.setTouchable(false);
    },

    active: function() {
        this.FriendPendingCompleteView.setTouchable(true);
    },

    onSceneLoaded: function (user) {
        // avatar
        var avatar = user.getAvatarSprite([64, 64]);
        avatar.setPosition(60, 150);
        this.FriendPendingCompleteView.addChild(avatar);
        // tag
        var tag_a = user.tag.a.getFaceSprite();
        var tag_b = user.tag.b.getFaceSprite();
        tag_a.setPosition(143, 198);
        tag_b.setPosition(213, 198);
        this.FriendPendingCompleteView.addChild(tag_a);
        this.FriendPendingCompleteView.addChild(tag_b);
        // // replace
        this.NameLabel.gluiobj.replace({ nickname: user.nickname });
        this.LevelLabel.gluiobj.replace({ level: user.level });
    }
});
