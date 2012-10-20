var Core = require('../../NGCore/Client/Core').Core;

exports.LevelUpController = Core.Class.subclass({
    classname: 'LevelUpController',

    initialize: function() {
    },

    action_levelUpClick: function(elem, param) {
        NgLogD(this.clasname + '.action_levelUpClick');
        SceneDirector.transition("LevelUpDetailScene");
    }
});
