var ModelBase = require('./ModelBase').ModelBase;
var Mission   = require('./Mission').Mission;
var Boss      = require('./Boss').Boss;

var BATTLE_RESULT = {
    NEW:     0,
    LOSE:    1,
    TIMEOUT: 2,
    CLEARED: 3
};

var Area = ModelBase.subclass({
    classname: "Area",

    _setParams: function (d) {
        d = d || {};
        var area      = d.area || d || {},
            user_area = d.user_area || {};

        this.id             = ~~area.id            || this.id               || 0;
        this.area_id        = ~~area.area_id       || this.area_id          || 0;
        this.block_id       = ~~area.block_id      || this.block_id         || 0;
        this.sub_block_name = area.sub_block_name  || this.sub_block_name   || "";
        this.remained_num   = ~~area.remained_num  || this.remained_num     || 0;
        this.clear_win_num  = ~~area.clear_win_num || this.clear_win_num    || 0;
        this.lose_num       = ~~area.lose_num      || this.lose_num         || 0;
        this.interval_sec   = ~~area.interval_sec  || this.interval_sec     || 0;
        this.mission_point  = ~~area.mission_point || this.mission_point    || 0;
        this.super_man_ids  = area.super_man_ids   || this.super_man_ids    || [];
        this.is_area_clear  = area.is_area_clear && area.is_area_clear == 1;

        this.area_name      = area.area_name       || this.area_name       || "";
        this.block_name     = area.block_name      || this.block_name      || "";

        this.status = this.status || {};

        this.status.win_num    = ~~user_area.win_num    || this.status.win_num    || 0;
        this.status.lose_num   = ~~user_area.lose_num   || this.status.lose_num   || 0;
        this.status.is_joined  = user_area.is_joined && user_area.is_joined == 1;
        this.status.result     = ~~user_area.result     || this.status.result     || 0;
        //this.status.updated_at =  user_area.updated_at || this.status.updated_at || 0;
        this.status.start_at = (user_area.updated_at) ? new Date(user_area.updated_at.replace(/\-/g, "/")) : new Date();

        this.status.is_lose = d.is_lose || 0;

        // 終了時間
        this.status.finish_time = new Date(this.status.start_at.getTime() + this.interval_sec * 1000);
    },

    /**
     * 残り時間(秒)を取得する
     */
    getRemainingSec: function() {
        return (this.status.finish_time.getTime() - Date.now()) / 1000 | 0;
    }
    
}); 

var Battle = {
    RESULT: BATTLE_RESULT,
    Area:   Area
};

exports.Battle = Battle;
