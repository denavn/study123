var Core = require('../../NGCore/Client/Core').Core;
var GameAPI = require('../GameAPI').GameAPI;

exports.WelcomeController = Core.Class.subclass({
    classname: "WelcomeController",

    initialize: function() {
    },

    action_close: function(elem, param) {
    },

    action_register: function(elem, param) {
        this.RegisterBtn.setTouchable(false);
        GameAPI.User.register(function (user) {
            SceneDirector.transition('MyPageScene');
        });
    }
});
