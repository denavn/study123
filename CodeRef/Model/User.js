var Hero = require('./Hero').Hero;
var ModelBase = require('./ModelBase').ModelBase;
var AvatarSprite = require('../../DnLib/Dn/GL2/AvatarSprite').AvatarSprite;

exports.User = ModelBase.subclass({

    classname: 'User',
 
    _setParams: function (d) {
        d = d || {};
        d.tag = d.tag || {};
        d.exp_info = d.exp_info || {};

        this.tag = this.tag || {};

        this.id                  = ~~d.id                  || this.id                  || 0;
        this.mobage_id           = ~~d.mobage_id           || this.mobage_id           || 0;
        this.nickname            = d.nickname              || this.nickname            || "";
        this.level               = ~~d.level               || this.level               || 0;
        this.exp                 = ~~d.exp                 || this.exp                 || 0;
        this.kkd                 = ~~d.kkd                 || this.kkd                 || 0;
        this.mission_point       = ~~d.mission_point       || this.mission_point       || 0;
        this.friend              = ~~d.friend              || this.friend              || 0;
        this.mission_stamina     = ~~d.mission_stamina     || this.mission_stamina     || 0;
        this.battle_stamina      = ~~d.battle_stamina      || this.battle_stamina      || 0;
        this.max_friend          = ~~d.max_friend          || this.max_friend          || 0;
        this.max_battle_stamina  = ~~d.max_battle_stamina  || this.max_battle_stamina  || 0;
        this.max_mission_stamina = ~~d.max_mission_stamina || this.max_mission_stamina || 0;
        this.is_checked_feed     = ~~d.is_checked_feed     || this.is_checked_feed     || 0;
        this.navigator_id        = ~~d.navigator_id        || this.navigator_id        || 0;
        this.super_man_limit     = ~~d.super_man_limit     || this.super_man_limit     || 0;
        this.combined_point      = ~~d.combined_point      || this.combined_point      || 0;
        this.last_combined_id    = ~~d.last_combined_id    || this.last_combined_id    || 0;
        this.tag.a               = (d.tag.a) ? new Hero(d.tag.a) : this.tag.a || undefined;
        this.tag.b               = (d.tag.b) ? new Hero(d.tag.b) : this.tag.b || undefined;
        this.tag.combo           = d.tag.combo || this.tag.combo || "";
        this.level_up_exp        = ~~d.exp_info.require_exp      || this.level_up_exp || 0;
        this.exp_rate            = ~~d.exp_info.require_exp_rate || this.exp_rate     || 0;
    },

    /**
     * AvatarSpriteを取得する
     *
     * - avatar size 
     *   - 16x16 
     *   - 32x32
     *   - 64x64
     *   - 128x128
     *
     * @param {Array} size [w, h]
     * @param {String} defaultImagePath 画像を取得するまでに利用するデフォルト画像のパス
     * @return AvatarSprite
     */
    getAvatarSprite: function (size, defaultImagePath) {
        var avatar = new AvatarSprite({
            cache:          true,
            directory:      'usericon',
            localcachetime: 3600,
            cachesize:      100
        });
        size = size || [128, 128];
        if (defaultImagePath) {
            avatar.setDefaultImage(defaultImagePath, size, [0,0]);
        }
        avatar.setAvatarImage(this.mobage_id, size, [0,0]);
        return avatar;
    }
});
