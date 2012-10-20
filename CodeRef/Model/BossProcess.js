var ModelBase = require('./ModelBase').ModelBase;

exports.BossProcess = ModelBase.subclass({
    classname: "BossProcess",

    _setParams: function(d) {
        d = d || {};
        d.damage = d.damage || {};

        this.damage = this.damage || {};

        this.damage.recovery     = ~~d.damage.recovery  || 0;
        this.damage.playerPow    = ~~d.damage.user_pow  || 0;
        this.damage.bossPow      = ~~d.damage.boss_pow  || 0;
        this.damage.kamaseDamage = ~~d.damage.kamase_dm || 0;
        this.damage.playerHp     = ~~d.damage.user_hp   || 0;
        this.damage.bossHp       = ~~d.damage.boss_hp   || 0;

        this.transactionId = d.process.token;
    }
});
