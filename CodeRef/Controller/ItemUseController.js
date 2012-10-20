var Core = require('../../NGCore/Client/Core').Core;
var GameAPI = require('../GameAPI').GameAPI;
var GLUI = require("../../NGGo/GLUI").GLUI;

exports.ItemUseController = Core.Class.subclass({
    classname: "ItemUseController",

    initialize: function() {
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'ItemUseScene') {
            SceneDirector.pop();
        }
    },

    action_use: function(elem, item) {
        if (SceneDirector.currentScene.sceneName === 'ItemUseScene') {
            GameAPI.User.useItem(item.id, function (after_item) {
                SceneDirector.transition("ModalDialogScene", {message: item.name+"を使いました"});
            });
        }
    },

    action_buy: function(elem, item) {
        if (SceneDirector.currentScene.sceneName === 'ItemUseScene') {
            SceneDirector.transition("ShopItemScene", item);
        }
    },

    deactive: function() {
        this.ItemUseView.setTouchable(false);
    },

    active: function() {
        this.ItemUseView.setTouchable(true);
    },

    setItem: function(item) {
        var _self = this,
            btn   = new GLUI.Button();
            
        _self.ItemIcon.gluiobj.setImage(item.getImagePath(), null, [80, 80]);
        _self.ItemName.setText(item.name);
        _self.ItemPrice.setText("" + item.price + "モバコイン");
        _self.ItemHasCount.setText("" + item.has_count + "個所有");
        _self.ItemDescription.setText(item.description);

        if (item.has_count > 0) {
            // アイテム所有
            btn.setImage("Content/image/mypage/btn_touse.png", null, [96, 34]);
            btn.onclick = function() {
                _self.action_use(btn, item);
            }
        } else {
            // アイテム無し
            btn.setImage("Content/image/mypage/btn_tobuy.png", null, [96, 34]);
            btn.onclick = function() {
                _self.action_buy(btn, item);
            }
        }
        btn.setFrame([0, 0, 96, 34]);
        _self.BtnNode.addChild(btn.getGLObject());
    }
});
