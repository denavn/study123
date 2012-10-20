var Core = require('../../NGCore/Client/Core').Core;
var GameAPI = require('../GameAPI').GameAPI;
var Flash = require('../../ExGame/Flash').Flash;
var GLUI = require("../../NGGo/GLUI").GLUI;
var PieGraph = require("../GLUI/PieGraph").PieGraph;
var Pool = require("../Pool").Pool;
var Global = require("../../Config/Global").Global;

exports.MissionController = Core.Class.subclass({
    classname: 'MissionController',

    _rewards: [],

    mission: null, // MissionScene.onEnter でセットされる

    initialize: function() {
    },

    destroy: function() {
        this._rewards.forEach(function(reward) {
            reward.destroy();
        });
        this._rewards = [];
    },

    deactive: function() {
        this.MissionView.setTouchable(false);
    },

    active: function() {
        this.MissionView.setTouchable(true);
    },

    onSceneLoaded: function() {
        this._initRewards();
        this._updateTexts();
        this.update();
    },

    update: function() {
        this._updateProgressGauge();
        this._updateStaminaGauge();
        this._updateKKDGauge();
        // this._updateRewards(); TODO:
    },

    // ミッション選択に戻る
    action_closeClick: function(elem, param) {
        NgLogD(this.classname + '.action_closeClick');
        SceneDirector.pop();
    },

    // ミッション実行
    action_processClick: function(elem, param) {
        NgLogD(this.classname + '.action_processClick');

        var self = this, mission;

        mission = Pool.mission.getCurrentMission();

        GameAPI.Mission.process(mission.id, function(result) {
            Pool.mission.result = result;

            if (Pool.mission.result.eventsIds.length === 0 && Pool.mission.result.end) {
                Pool.mission.result.eventsIds = [Pool.mission.result.end];
            }

            self.next();
        });
    },

    next: function(prevScene) {
        if (!Pool.mission.result) {
            return;
        }

        if (Pool.mission.result.hasNextProcess &&
            Pool.mission.result.hasNextProcess()) {
            this._nextProcess();
        }
        else if (Pool.mission.result.hasNextEvent &&
                 Pool.mission.result.hasNextEvent()) {
            this._nextEvent();
        }
        else if(prevScene) {
            switch (prevScene.toString()) {
            case "MissionCompleteDetailScene":
                SceneDirector.pop();
                break;
            }
        }
    },

    _nextProcess: function() {
        var nextProcess = Pool.mission.result.nextProcess();

        // TODO: ミッション効果の演出

        SceneDirector.push("MissionMovieScene", {
            swfPath: "./Content/swf/m_a1-1_bk/", // TODO: ミッションに対応したswf
            effects: {
                exp: nextProcess.change.exp,
                kkd: nextProcess.change.kkd,
                combinedPoint: nextProcess.change.combined_point,
                stamina: nextProcess.change.stamina
            }
        });
    },

    _nextEvent: function() {
        var nextEvent = Pool.mission.result.nextEvent();

        if (nextEvent.method === "transition") {
            SceneDirector.transition(nextEvent.scene);
        }
        else {
            SceneDirector.push(nextEvent.scene);
        }
    },

    // onResume時に呼ばれる
    checkAndCommitProcess: function(callback) {
        var self = this;

        if (Pool.mission &&
            Pool.mission.isCommit === false &&
            Pool.mission.result &&
            Pool.mission.result.hasNextProcess &&
            !Pool.mission.result.hasNextProcess())
        {
            Pool.mission.isCommit = true;
            GameAPI.Mission.commit(Pool.mission.result.transactionId, function(res) {
                callback();
            });
        }
        else {
            callback();
        }
    },

    _updateStaminaGauge: function() {
        this.StaminaGauge.gluiobj.setValue(
            Pool.Mine.mission_stamina / Pool.Mine.max_mission_stamina
        );
    },

    _updateProgressGauge: function() {
        var mission = Pool.mission.getCurrentMission();
        this.ProgressGauge.gluiobj.setValue(mission.status.achievement_rate / 100);
    },

    _updateKKDGauge: function() {
        this.KKDPie.gluiobj.update(Pool.Mine.kkd);
        this.KKDValue.gluiobj.setText(Pool.Mine.kkd + "p");
    },

    _updateTexts: function() {
        var episode = Pool.mission.episode;
        var mission = Pool.mission.getCurrentMission();

        this.MissionNumber.gluiobj.replace({ num: mission.num });
        this.MissionName.gluiobj.replace({ name: mission.name });
        this.MissionFrac.gluiobj.replace({
            num: mission.num,
            den: Global.mission.num[episode.status.count]
        });

        this.ExpText.gluiobj.replace({ value: mission.exp });
        this.MuscleText.gluiobj.replace({ value: mission.max_combined_point });
        this.StaminaText.gluiobj.replace({ value: mission.consumable_stamina });
    },

    _initRewards: function() {
        var heroes = Pool.mission.getCurrentMission().dropped_heroes,
            image, imagePath, i;

        for (i = 0; i < heroes.length; ++i) {
            imagePath = heroes[i].is_got
                    ? "Content/image/mission/reward" + heroes[i].hero.id + ".png"
                    : "Content/image/mission/reward" + heroes[i].hero.id + "_gray.png";

            image = new GLUI.Image();
            image.setFrame([70 * i, 0, 62, 52]);
            image.setImage(imagePath, GLUI.State.Normal, [62, 52]);

            this._rewards.push(image);
            this.Rewards.addChild(image.getGLObject());
        }
    }
});
