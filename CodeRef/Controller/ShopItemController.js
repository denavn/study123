var Core = require('../../NGCore/Client/Core').Core;
var GameAPI = require('../GameAPI').GameAPI;

exports.ShopItemController = Core.Class.subclass({
    classname: "ShopItemController",

    initialize: function(item_id) {
        this.item_id = item_id || 0;
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'ShopItemScene') {
            SceneDirector.pop();
        }
    },

    action_commit: function(elem, param) {
        console.log(this.NumberSelect.gluiobj.getValue());
        GameAPI.Shop.payment(this.item_id, this.NumberSelect.gluiobj.getValue(),
            function(r) {
                NgLogD(r);
                SceneDirector.transition('ShopFinishScene', {item: r});
            },
            function(e) {
                NgLogE(e);
            }
        );
    },

    deactive: function() {
        this.ShopItemView.setTouchable(false);
    },

    active: function() {
        this.ShopItemView.setTouchable(true);
    }
});
