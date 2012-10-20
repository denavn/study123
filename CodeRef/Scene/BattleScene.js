var Scene = require('../../NGGo/Framework/Scene/Scene').Scene;
var GUIBuilder = require('../../NGGo/Framework/GUIBuilder').GUIBuilder;
var Layer = require('../Layer').Layer;
var GameAPI = require('../GameAPI').GameAPI;

exports.BattleScene = Scene.subclass({

    classname: 'BattleScene',

    sceneName: 'BattleScene',

    initialize: function() {
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+'::onEnter');
        var _self = this;
        GameAPI.Battle.getList(function(res) {
            if (res.status) {
                SceneDirector.transition('BattleListScene');
            } else {
                SceneDirector.transition('BattleJoinScene');
            }
        });
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname+'::onResume');
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname+'::onPause');
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname+'::onExit');
    }

});

