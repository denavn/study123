var Core = require('../../NGCore/Client/Core').Core;

exports.MissionCompleteController = Core.Class.subclass({
    classname: 'MissionCompleteController',

    initialize: function() {
    },

    action_completeClick: function(elem, param) {
        NgLogD(this.classname + '.action_campleteClick');
        SceneDirector.transition("MissionCompleteDetailScene");
    }
});
