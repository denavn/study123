var Core = require('../../NGCore/Client/Core').Core;

exports.ShopListController = Core.Class.subclass({
    classname: "ShopListController",

    initialize: function() {
    },

    action_close: function(elem, param) {
    },

    action_select: function(elem, item) {
        NgLogD("select::"+item.id);
        if (SceneDirector.currentScene == "ShopListScene") {
            SceneDirector.push("ShopItemScene", {item: item});
        }
    },

    deactive: function() {
        this.ShopListView.setTouchable(false);
    },

    active: function() {
        this.ShopListView.setTouchable(true);
    }
});
