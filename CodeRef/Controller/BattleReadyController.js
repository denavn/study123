var Core = require('../../NGCore/Client/Core').Core;
var GameAPI = require('../GameAPI').GameAPI;
var Pool = require('../Pool').Pool;

exports.BattleReadyController = Core.Class.subclass({
    classname: "BattleReadyController",

    initialize: function() {
        this.targetUser     = null;
        this.myFirstHero    = null;
        this.mysecondHero   = null;
        this.yourFirstHero  = null;
        this.yoursecondHero = null;
    },

    destroy: function() {
        this.destroyAll();
        this.targetUser     = null;
        this.myFirstHero    = null;
        this.mysecondHero   = null;
        this.yourFirstHero  = null;
        this.yoursecondHero = null;
    },

    action_close: function(elem, param) {
        SceneDirector.pop();
    },

    action_start: function(elem, param) {
        NgLogD('BattleReadyController::action_start');
    },

    action_change: function(elem, param) {
        NgLogD('BattleReadyController::action_change');
    },

    deactive: function() {
        this.BattleReadyView.setTouchable(false);
    },

    active: function() {
        this.BattleReadyView.setTouchable(true);
    },

    setTargetUser: function(user) {
        this.targetUser = user;
        var my   = Pool.Mine,
            your = this.targetUser;

        this.MyName.gluiobj.setText(my.nickname);
        this.MyLevel.gluiobj.setText(my.level);
        this.MyBp.gluiobj.replace({befor: 100, after: 90});
        this.YourName.gluiobj.setText(your.nickname);
        this.YourLevel.gluiobj.setText(your.level);

        this.MyFirstLevel.gluiobj.replace({level: my.tag.a.status.level});
        this.MyFirstOffence.gluiobj.replace({offence: my.tag.a.status.offence});
        this.YourFirstLevel.gluiobj.replace({level: your.tag.a.status.level});
        this.YourFirstOffence.gluiobj.replace({offence: "???"});
        this.FirstBP.gluiobj.replace({bp: my.tag.a.status.cost});

        this.MySecondLevel.gluiobj.replace({level: my.tag.b.status.level});
        this.MySecondOffence.gluiobj.replace({offence: my.tag.b.status.offence});
        this.YourSecondLevel.gluiobj.replace({level: your.tag.b.status.level});
        this.YourSecondOffence.gluiobj.replace({offence: "???"});
        this.SecondBP.gluiobj.replace({bp: my.tag.b.status.cost});

        // アバターアイコンセットアップ
        var myIcon = my.getAvatarSprite([32,32]);
        myIcon.setPosition(3,3);
        this.MyAvatarFrame.addChild(myIcon);

        var yourIcon = your.getAvatarSprite([32,32]);
        yourIcon.setPosition(3,3);
        this.YourAvatarFrame.addChild(yourIcon);

        // 超人セットアップ
        this.myFirstHero = my.tag.a.getUpperSprite([150,170], [0.5, 0.5]);
        this.myFirstHero.setPosition([64, 141]);
        this.HeroNode.addChild(this.myFirstHero);

        this.mySecondHero = my.tag.b.getUpperSprite([150,170], [0.5, 0.5]);
        this.mySecondHero.setPosition([64, 339]);
        this.HeroNode.addChild(this.mySecondHero);

        this.yourFirstHero = your.tag.a.getUpperSprite([150,170], [0.5, 0.5]);
        this.yourFirstHero.setPosition([256, 141]);
        this.HeroNode.addChild(this.yourFirstHero);

        this.yourSecondHero = your.tag.b.getUpperSprite([150,170], [0.5, 0.5]);
        this.yourSecondHero.setPosition([256, 339]);
        this.HeroNode.addChild(this.yourSecondHero);

        // タッグ変更ボタン　
        this.TagChangeBtn.setVisible(false);
    }
});
