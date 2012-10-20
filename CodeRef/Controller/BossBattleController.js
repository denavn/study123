var Core = require('../../NGCore/Client/Core').Core;
var GLUI = require("../../NGGo/GLUI").GLUI;

exports.BossBattleController = Core.Class.subclass({
    classname: 'BossBattleController',
    process: null, // Model.BossProcess
    isWin: false, // 勝敗
    useItem: false, // 回復アイテムを使ったかどうか

    _front: "",
    _hp: {
        boss: 0,
        player: 0
    },
    _turn: 0, // 奇数: プレイヤー, 偶数: ボス


    initialize: function(options) {
        this._front = options.front;
    },

    destroy: function() {
    },

    deactive: function() {
        this.BossBattleView.setTouchable(false);
    },

    onSceneLoaded: function(callback) {
        var self = this;

        GameAPI.Mission.processBoss(self._front, function(res) {
            self.process = res;
            self._hp.boss = self.process.damage.bossHp;
            self._hp.player = self.process.damage.playerHp;

            self._updateHealButton(true); // TODO: アイテム諸字数に応じて出し分け
            self._updateGauges();

            callback();
        });
    },

    active: function() {
        this.BossBattleView.setTouchable(true);
    },

    action_healClick: function(elem, param) {
        NgLogD(this + "::action_healClick");

        if (this.useItem) {
            return;
        }

        this.useItem = true;
        this._hp.player = this.process.damage.playerHp;

        this._updateHealButton(false);
        this._updateGauges();
    },

    action_processClick: function(elem, param) {
        NgLogD(this + "::action_processClick");

        this.processBattle();
    },

    processBattle: function() {
        ++this._turn;

        if (this._hp.boss <= 0) {
            this.isWin = true;
            SceneDirector.push("WinScene");
            return;
        }
        else if (this._hp.player <= 0) {
            this.isWin = false;
            SceneDirector.push("LoseScene");
            return;
        }

        if (this._turn % 2 === 1) {
            this._hp.boss -= this.process.damage.playerPow;
        }
        else {
            this._hp.player -= this.process.damage.bossPow;
        }

        this._updateGauges();
    },

    _updateHealButton: function(state) {
        console.log(state);
        if (state === true) {
            this.HealBtn.setTouchable(true);
            this.HealBtn.gluiobj.setImage(
                "Content/image/mission/btn_mission.png",
                GLUI.State.Normal, [66, 67]
            );
        }
        else {
            this.HealBtn.setTouchable(false);
            this.HealBtn.gluiobj.setImage(
                "Content/image/mission/btn_mission_next.png",
                GLUI.State.Normal, [66, 67]
            );
        }
    },

    _updateGauges: function() {
        var bossValue = this._hp.boss / this.process.damage.bossHp,
            playerValue = this._hp.player / this.process.damage.playerHp;

        this.BossGauge.gluiobj.setValue(bossValue < 0 ? 0 : bossValue);
        this.PlayerGauge.gluiobj.setValue(playerValue < 0 ? 0 : playerValue);
    }
});
