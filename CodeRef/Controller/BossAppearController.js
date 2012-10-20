var Core = require('../../NGCore/Client/Core').Core;
var Pool = require("../Pool").Pool;

var BossAppearController = Core.Class.subclass({
    classname: 'BossAppearController',

    _current: "",
    _heroImage: null,

    initialize: function() {
        this._current = BossAppearController.TAG.HERO_A;
    },

    destroy: function() {
        if (this._heroImage) {
            this._heroImage.destroy();
            this._heroImage = null;
        }
    },

    deactive: function() {
        this.BossAppearView.setTouchable(false);
    },

    active: function() {
        this.BossAppearView.setTouchable(true);
    },

    onSceneLoaded: function(callback) {
        var self = this;

        GameAPI.Mission.getBoss(self._current, function(res) {
            self._updateBoss(res.boss);
            self._updateHero();
            self._updateFriend();

            callback();
        });
    },

    action_changeHeroClick: function(elem, param) {
        if (this._current === BossAppearController.TAG.HERO_A) {
            this._current = BossAppearController.TAG.HERO_B;
        }
        else {
            this._current = BossAppearController.TAG.HERO_A;
        }

        this._updateHero();
    },

    action_changeHelperClick: function(elem, param) {

    },

    action_battleClick: function(elem, param) {
        SceneDirector.transition("BossBattleScene", { front: this._current });
    },

    action_closeClick: function(elem, param) {
        SceneDirector.pop();
    },

    _updateBoss: function(boss) {
        // TODO: ボス画像のアップデート
    },

    _updateHero: function() {
        var hero = Pool.Mine.tag[this._current];

        if (this._heroImage) {
            this.HeroImageContainer.removeChild(this._heroImage);
            this._heroImage.destroy();
        }

        this._heroImage = hero.getIconSprite();
        this.HeroImageContainer.addChild(this._heroImage);

        this.HeroName.gluiobj.replace({ name: hero.name });
        this.HeroRank.gluiobj.replace({ rank: hero.rarity });
        this.HeroLevel.gluiobj.replace({ level: hero.status.level });
        this.HeroOffence.gluiobj.replace({ offence: hero.status.offence });
        this.HeroDefence.gluiobj.replace({ defence: hero.status.defence });
    },

    _updateFriend: function() {
        this.FriendName.gluiobj.replace({ name: "{超友名が入る}" });
        this.FriendLevel.gluiobj.replace({ level: "{レベルが入る}" });
        this.FriendRank.gluiobj.replace({ rank: "{ランク}" });
    }
});

BossAppearController.TAG = {
    HERO_A: "a",
    HERO_B: "b"
};

exports.BossAppearController = BossAppearController;