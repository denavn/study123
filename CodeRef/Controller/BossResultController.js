var Core = require('../../NGCore/Client/Core').Core;
var GLUI = require("../../NGGo/GLUI").GLUI;
var URLSprite = require('../../NGGo/GLUI/Sprite').URLSprite;

exports.BossResultController = Core.Class.subclass({
    classname: 'BossResultController',
    _result: null,
    _boss: null,
    _win: null,
    _avatar: null,
    _hero: { a: null, b: null },

    initialize: function(options) {
        this._result = options.result;
    },

    destroy: function() {
        if (this._boss) {
            this._boss.destroy();
            this._boss = null;
        }

        if (this._win) {
            this._win.destroy();
            this._win = null;
        }

        if (this._avatar) {
            this._avatar.destroy();
            this._avatar = null;
        }

        if (this._hero.a) {
            this._hero.a.destroy();
            this._hero.a = null;
        }

        if (this._hero.b) {
            this._hero.b.destroy();
            this._hero.b = null;
        }
    },

    deactive: function() {
        this.BossResultView.setTouchable(false);
    },

    active: function() {
        this.BossResultView.setTouchable(true);
    },

    action_forwardClick: function(elem, param) {
        SceneDirector.pop();
    },

    onSceneLoaded: function(callback) {
        this._updateBoss();
        this._updateResult();
        this._updateUserData();
        this._updateHero("a");
        this._updateHero("b");

        callback();
    },

    _updateBoss: function() {
        this._boss = new URLSprite();
        this._boss.setImage(
            "Content/image/npc/boss/" + this._result.episodeId + ".png",
            [512, 512], [0, 0]
        );
        this.BossContainer.addChild(this._boss);
    },

    _updateResult: function() {
        var image = this._result.isWin
                ? "Content/image/fight/pop_win.png"
                : "Content/image/fight/pop_lose.png";

        this._win = new URLSprite();
        this._win.setImage(image, [128, 92], [0, 0]);
        this.ResultContainer.addChild(this._win);
    },

    _updateUserData: function() {
        this._avatar = Pool.Mine.getAvatarSprite([32, 32]);
        this.AvatarContainer.addChild(this._avatar);

        this.UserName.gluiobj.replace({ name: Pool.Mine.nickname });
        this.UserLevel.gluiobj.replace({ level: Pool.Mine.level });
        this.UserBattleStamina.gluiobj.replace({
            before: this._result.battleStamina.before,
            after: this._result.battleStamina.after
        });
    },

    _updateHero: function(which) {
        var hero, prefix;

        if(which === "a") {
            hero = Pool.Mine.tag.a;
            prefix = "HeroA";
        }
        else {
            hero = Pool.Mine.tag.b;
            prefix = "HeroB";
        }

        console.log(hero);

        this._hero[which] = hero.getIconSprite();
        this[prefix + "Container"].addChild(this._hero[which]);
        this[prefix + "Level"].gluiobj.replace({ level: hero.status.level });
        this[prefix + "Offence"].gluiobj.replace({ value: hero.status.offence });
    }
});
