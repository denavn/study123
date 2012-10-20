var Core = require("../../NGCore/Client/Core").Core;
var GameAPI = require("../GameAPI").GameAPI;
var FriendListNode = require('../GLUI/FriendListNode').FriendListNode;

exports.FriendListController = Core.Class.subclass({
    classname: "FriendListController",

    _Button: {
        Friends: {
            "frame": [240, 40, 72, 25],
            "url": "Content/image/friend/btn_shakehand72.png",
            "scene": 'FriendPendingConfirmScene'
        },
        Requested: {
            "frame": [240, 40, 72, 25],
            "url": "Content/image/friend/btn_shinseicancel.png",
            "scene": 'FriendRequestCancelConfirmScene'
        },
        Pending: {
            "frame": [240, 40, 72, 25],
            "url": "Content/image/friend/btn_befriend.png",
            "scene": 'FriendPendingConfirmScene'
        }
    },

    initialize: function() {
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'FriendListScene') {
            SceneDirector.pop();
        }
    },

    action_click: function(elem, param) {
    },

    action_select_friends: function (elem, param) {
        var _self = this;
        _self.FriendList.clearItems();
        GameAPI.Friend.list(function (res) {
            _self._updateList(res, _self._Button.Friends);
        });
    },

    action_select_requested: function (elem, param) {
        var _self = this;
        _self.FriendList.clearItems();
        GameAPI.Friend.requested(function (res) {
            _self._updateList(res, _self._Button.Requested);
        });
    },

    action_select_pending: function (elem, param) {
        var _self = this;
        _self.FriendList.clearItems();
        GameAPI.Friend.pending(function (res) {
            _self._updateList(res, _self._Button.Pending);
        });
    },

    onSceneLoaded: function() {
        var _self = this;
        _self.action_select_friends();
    },

    deactive: function() {
        this.FriendListView.setTouchable(false);
    },

    active: function() {
        this.FriendListView.setTouchable(true);
    },

    _updateList: function (users, button) {
        var _self = this;
        var i, l;
        for (i = 0, l = users.length; i < l; i++) {
            _self._buildElement(users[i], button);
        }
    },

    _buildElement: function (user, button) {
        var elem = new FriendListNode({ button: button });
        elem.setUser(user);
        elem.setOnClick(function (elem, user) {
            // TODO ボタン種別によって切り替え
            SceneDirector.push(button.scene, {
                user: user,
                button: button
            });
        });
        this.FriendList.addItem(elem);
    }
});
