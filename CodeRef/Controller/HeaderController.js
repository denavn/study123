var Core = require('../../NGCore/Client/Core').Core;
var Pool = require('../Pool').Pool;

exports.HeaderController = Core.Class.singleton({

    classname: 'HeaderController',

    action_menuClick: function(elem) {
        if (SceneDirector.currentScene.sceneName !== 'MenuScene') {
            SceneDirector.push('MenuScene');
        }
    },
    
    action_homeClick: function(elem) {
        if (SceneDirector.currentScene.sceneName !== 'MyPageScene') {
            SceneDirector.popToRoot();
        }
        if (SceneDirector.currentScene.sceneName !== 'MyPageScene') {
            SceneDirector.transition('MyPageScene');
        }
    },

    deactive: function() {
        NgLogD("HeaderController::deactive");
        this.HeaderView.setTouchable(false);
    },

    active: function() {
        this.HeaderView.setTouchable(true);
    },

    update: function() {
        NgLogD("HeaderView update");
        var u = Pool.Mine;
        this.LevelLabel.gluiobj.setText(""+u.level);

        this.ExpLabel.gluiobj.setText(""+u.exp);
        this.ExpGauge.gluiobj.setValue(u.exp_rate / 100);

        this.TPLabel.gluiobj.setText(""+u.mission_point + "TP");

        this.MSLabel.gluiobj.setText(""+u.mission_stamina+"/"+u.max_mission_stamina);
        this.MSGauge.gluiobj.setValue(u.mission_stamina / u.max_mission_stamina);

        this.BSLabel.gluiobj.setText(""+u.battle_stamina+"/"+u.max_battle_stamina);
        this.BSGauge.gluiobj.setValue(u.battle_stamina / u.max_battle_stamina);

        this.CoinLabel.gluiobj.setText(""+u.combined_point);
    }

});
