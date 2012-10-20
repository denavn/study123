var ModelBase = require('./ModelBase').ModelBase;
var Hero   = require('./Hero').Hero;
var Pool   = require('../Pool').Pool;
var Scene  = require("../../Code/Scene").Scene;

var EVENT_TYPE = {
    1: { name: "StaminaEmpty",   method: "push", scene: "StaminaEmptyScene"    }, // スタミナ切れ
    2: { name: "Cleared",        method: "push", scene: "MissionCompleteScene" }, // クリア
    3: { name: "LeverUp",        method: "push", scene: "LevelUpScene"         }, // レベルアップ
    4: { name: "MeetCommonHero", method: "push", scene: "CaptureAppearScene"   }, // 超人に会う
    5: { name: "MeetRareHero",   method: "push", scene: "CaptureAppearScene"   }, // レア超人に会う
    6: { name: "RequestSecret",  method: "push", scene: "RequestSecretScene"   }, // 他ユーザに会う
    7: { name: "KKDMax",         method: "push", scene: "KKDMaxScene"          }, // KKDが100%に
    8: { name: "BOSS",           method: "push", scene: "BossAppearScene"      }  // ボス出現
};

/**
 * inheritance from ModelBase
 */
var Mission = ModelBase.subclass({
    classname: "Mission",

    _setParams: function (d) {
        d = d || {};

        var k = "",
            user_status = d.user_mission || {},
            hero_to_mission = d.super_man_to_mission || {};

        this.id                 =  ~~d.id                  || this.id                  || 0;  // ミッションID
        this.episode_id         =  ~~d.episode_id          || this.episode_id          || 0;  // エピソードID
        this.name               =  d.name                  || this.name                || ""; // 名前
        this.description        =  d.description           || this.description         || ""; // 説明
        this.consumable_stamina =  ~~d.consumable_stamina  || this.consumable_stamina  || 0;  // 消費体力
        this.exp                =  ~~d.exp                 || this.exp                 || 0;  // 獲得経験値
        this.exp_bonus          =  ~~d.exp_bonus           || this.exp_bonus           || 0;  // 獲得経験値ボーナス
        this.max_combined_point =  ~~d.max_combined_point  || this.max_combined_point  || 0;  // 合成ポイント
        this.complete_num       =  ~~d.complete_num        || this.complete_num        || 0;  // 基本達成回数
        this.num                =  ~~d.num                 || this.num                 || 0;  // エピソード中何番目のミッションか

        this.status = this.status || {};
        this.status.achievement_rate = ~~user_status.achievement_rate || this.status.achievement_rate  || 0;  // 達成率
        this.status.count            = ~~user_status.count            || this.status.count             || 0;  // 繰り返し数
        this.status.max_dropped      = ~~hero_to_mission.max_count    || this.status.max_dropped       || 0;  // 取得できる超人の種類数
        this.status.has_dropped      = ~~hero_to_mission.has_num      || this.status.has_dropped       || 0;  // 獲得済み超人数

        this.dropped_heroes = this.dropped_heroes || [];

        if (hero_to_mission.info) {
            this.dropped_heroes = [];
            for (k in hero_to_mission.info) {
                this.dropped_heroes.push(
                    {
                        hero:   new Hero(hero_to_mission.info[k].super_man),
                        is_got: hero_to_mission.info[k].is_got > 0 ? true: false
                    }
                );
            }
        }

    },

    getDroppedHeroById: function(id) {
        var i      = 0,
            length = this.dropped_heroes.length,
            hero   = null;
        for (i; i < length; i++) {
            hero =  this.dropped_heroes[i].hero;
            if (hero.id === id) {
                return hero;
            }
        }
        return undefined;
    }
});

/**
 * ミッションprocessのイテレーター
 *
 * var process = new MissionProcess(data);
 * process.setMission(mission);
 * mission.addListener(missionUpdateListener);
 * Pool.Mine.addListener(userUpdateListener);
 * while (process.hasNextProcess()) {
 *     executeProcessAction(process.nextProcess().getChange());
 * }
 * while (process.hasNextEvent()) {
 *     executeEvent(process.nextEvent());
 * }
 */
var MissionProcess = Core.Class.subclass({
    classname: "MissionProcess",


    initialize: function(d, mission) {
        d          = d || {};
        d.end_list = d.end_list || [];
        d.process  = d.process || [];

        this._processIndex = 0;
        this._eventIndex   = 0;
        this.transactionId = d.token;
        this.mission  = null;
        this.process  = [];
        this.heros    = [];
        this.end      = d.end;
        this.eventsIds = d.end_list.map(function (v) { return ~~v; });
        this.current  = ~~d.current || 0;
        this.total    = ~~d.total   || 0;
        this.special_user_id = ~~d.special_training || 0;
        this.achievement_rate = 0;
        this.hero_ids = d.super_mans || [];
        this.meet_user_id = ~~d.meet_user_id || 0;

        if (mission) {
            this.setMission(mission);
        }

        if (d.start) {
            this.updateState(d.start);
        }

        for (var i = 0; i < d.process.length; i++) {
            d.process[i].special_training = this.special_user_id ? true : false;
            this.process.push(new MissionState(d.process[i]));
        }
    },

    destroy: function() {
        this.mission = null;
        this.process = null;
        this.heros   = null;
    },

    setMission: function(mission) {
        this.mission = mission;

        this.mission.update({
            current          : this.current,
            total            : this.total,
            achievement_rate : this.achievement_rate
        });

        for (var i = 0; i < this.hero_ids.length; i++) {
            this.heros.push(this.mission.getDroppedHeroById(~~this.hero_ids[i]));
        }

    },

    getMission: function() {
        return this.mission;
    },

    updateState: function(r) {
        Pool.Mine.update({
            mission_stamina: r.stamina        || Pool.Mine.mission_stamina,
            combined_point:  r.combined_point || Pool.Mine.combined_point,
            exp:             r.exp            || Pool.Mine.exp,
            kkd:             r.kkd            || Pool.Mine.kkd
        });

        this.achievement_rate = ~~r.achievement;

        if (this.mission) {
            this.mission.update({
                achievement_rate: this.achievement_rate || this.mission.achievement_rate
            });
        }
    },

    hasNextProcess: function() {
        return (this._processIndex < this.process.length) ? true: false;
    },

    nextProcess: function() {
        var proc = this.process[this._processIndex++];
        this.updateState(proc.getResult());
        return proc;
    },

    currentProcess: function() {
        var proc = this.process[this._processIndex];
        return proc;
    },

    hasNextEvent: function() {
        return (this._eventIndex < this.eventsIds.length) ? true: false;
    },

    nextEvent: function() {
        var eventId = this.eventsIds[this._eventIndex++],
            ev      = { type: eventId };

        for (var id in EVENT_TYPE) {
            ev["is" + EVENT_TYPE[id].name] = id == eventId;
        }

        ev.method = EVENT_TYPE[eventId].method;
        ev.scene = EVENT_TYPE[eventId].scene;

        if (ev.isMeetCommonHero || ev.isMeetRareHero) {
            ev.heros = this.heros;
        }

        if (ev.isMeetUser) {
            ev.user_id = this.meet_user_id;
        }

        return ev;
    }
});

var MissionState = Core.Class.subclass({

    classname: "MissionState",

    initialize: function(d) {
        d = d || {};
        d.result = d.result || {};

        this.change = {};
        this.result = {};

        this.is_smash = (d.smash && ~~d.smash === 1 ) ? true: false;
        this.is_special =(~~d.special_training === 1) ? true: false;

        this.change.achievement    = ~~d.achievement    || 0;
        this.change.combined_point = ~~d.combined_point || 0;
        this.change.exp            = ~~d.exp            || 0;
        this.change.kkd            = ~~d.kkd            || 0;
        this.change.stamina        = -(~~d.stamina || 0);

        this.result.achievement    = ~~d.result.achievement    || 0;
        this.result.combined_point = ~~d.result.combined_point || 0;
        this.result.exp            = ~~d.result.exp            || 0;
        this.result.kkd            = ~~d.result.kkd            || 0;
        this.result.stamina        = ~~d.result.stamina        || 0;
    },

    getChange: function() {
        return this.change;
    },

    getResult: function() {
        return this.result;
    }

});

exports.Mission = Mission;
exports.Mission.Process = MissionProcess;
exports.Mission.State   = MissionState;
