var Core = require('../../NGCore/Client/Core').Core;
var GameAPI = require('../GameAPI').GameAPI;

exports.ShopFinishController = Core.Class.subclass({
    classname: "ShopFinishController",

    initialize: function() {
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'ShopFinishScene') {
            SceneDirector.pop();
        }
    },

    action_back: function(elem, param) {
        NgLogD("action back");
    },

    action_use: function(elem, item) {
        if (SceneDirector.currentScene.sceneName === 'ShopFinishScene') {
            GameAPI.User.useItem(item.id, function (after_item) {
                SceneDirector.transition("ModalDialogScene", {message: item.name+"を使いました"});
            });
        }
    },

    deactive: function() {
        this.ShopFinishView.setTouchable(false);
    },

    active: function() {
        this.ShopFinishView.setTouchable(true);
    },

    setItem: function(item) {
        var _self = this;

        _self.ItemIcon.gluiobj.setImage(item.getImagePath(), null, [80, 80]);
        _self.ItemName.setText(item.name);
        _self.ItemPrice.setText("" + item.price + "モバコイン");
        _self.ItemHasCount.setText("" + item.has_count + "個所有");
        _self.ItemDescription.setText(item.description);

        _self.UseBtn.gluiobj.onclick = function() {
            _self.action_use(_self.UseBtn, item);
        };

    }
});
