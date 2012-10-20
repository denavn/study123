var Core = require('../../NGCore/Client/Core').Core;
var GameAPI = require('../GameAPI').GameAPI;
var Times = require('../Common/Util/Times').Times;

exports.BattleJoinController = Core.Class.subclass({
    classname: 'BattleJoinController',

    initialize: function() {
    },

    action_close: function(elem, param) {
        if (SceneDirector.currentScene.sceneName === 'BattleJoinScene') {
            SceneDirector.pop();
        }
    },

    action_start: function(elem, param) {
        GameAPI.Battle.join(function (area) {
            SceneDirector.pop();
            SceneDirector.transition('BattleListScene', {area: area});
        });
    },
    action_collection : function(elem, param) {
    	SceneDirector.pop();
    	SceneDirector.transition('CollectionMapScene');
    },

    deactive: function() {
        this.BattleJoinView.setTouchable(false);
    },

    active: function() {
        this.BattleJoinView.setTouchable(true);
    },

    setArea: function(area) {
        var dTime = Times.toDigitString(area.interval_sec);
        this.DescriptionLabel.gluiobj.replace({
            win:      area.clear_win_num,
            lose:     area.lose_num,
            interval: dTime, 
        });

        this.CountdownText.gluiobj.setText(dTime.replace(/:/g, "c").trim());

    }
});
