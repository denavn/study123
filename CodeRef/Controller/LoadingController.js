var Core = require('../../NGCore/Client/Core').Core;

exports.LoadingController = Core.Class.subclass({
    classname: "LoadingController",

    initialize: function() {
    },

    deactive: function() {
        this.LoadingView.setTouchable(false);
    },

    active: function() {
        this.LoadingView.setTouchable(true);
    }
});
