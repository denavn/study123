var Core = require('../../NGCore/Client/Core').Core;

exports.ItemListController = Core.Class.subclass({
    classname: "ItemListController",

    initialize: function() {
    },

    action_close: function(elem, param) {
    },

    action_select: function(elem, item) {
        NgLogD("select::"+item.id);
        if (SceneDirector.currentScene == "ItemListScene") {
            SceneDirector.push("ItemUseScene", {item: item});
        }
    },

    deactive: function() {
        this.ItemListView.setTouchable(false);
    },

    active: function() {
        this.ItemListView.setTouchable(true);
    }
});
