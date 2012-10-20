var Core = require('../../NGCore/Client/Core').Core;
var Times = require('../Common/Util/Times').Times;
var TestEnv = require('../../Config/TestEnv').TestEnv;
var CreateGo = require("../Common/CreateGo").CreateGo;
var CreateCore = require("../Common/CreateCore").CreateCore;
var Pool = require("../Pool").Pool;
var Dump = require('../Common/Dump').Dump;

exports.StatusController = Core.Class.subclass({
    classname: "StatusController",

    // transport datas
    _data: {
        tag: {
            a: { id: 1, status: { seq_id: 1 } },
            b: { id: 3, status: { seq_id: 3 } }
        },
        kkd: 0,                 // KKDゲージの溜り具合(0~100)
        level: 0,               // ユーザのレベル
        exp_rate: 0,            // EXPゲージの溜り具合(0~100)
        nickname: "",           // ニックネーム
        combined_point: 0,      // 合成ポイント
        battle_heal_sec: 0,     // 2000 * 180 + 10; // BPが1回復するまで3分。BPの最大は青天井
                                //   -> BPの最大値が2000のとき、
                                //      0から2000まで回復するために必要な待ち時間は "100:00:00" です
        mission_heal_sec: 0,    // スタミナが1回復するまで3分。スタミナの最大は100です
                                //   -> 0から100まで回復するために必要な待ち時間は "05:00:00" です
        battle_stamina: 0,      // バトルポイント
        mission_stamina: 0,     // スタミナ
        max_battle_stamina: 0,  // バトルポイントの最大値
        max_mission_stamina: 0  // スタミナの最大値
    },
    _debugData: {
        kkd: 100,
        level: 100,
        exp_rate: 100,
        nickname: "テストユーザ",
        combined_point: 1234567890,
        battle_heal_sec: 180 * 20,      // 3分(180) * 20(MAX)
        mission_heal_sec: 180 * 20,     // 3分(180) * 20(MAX)
        battle_stamina: 0,
        mission_stamina: 0,
        max_battle_stamina: 20,         // MAX20
        max_mission_stamina: 20         // MAX20
    },

    _staticNodes: {},       // 変化しないノードの集合
    _dynamicNodes: {},      // 適時更新する必要のあるノードの集合

    _dynamicNodeArray: [    // 更新対象のノード名の配列
        "battle_heal_sec",
        "mission_heal_sec",
        "exp_gauge",
        "bp_gauge",
        "st_gauge",
        "bp_gauge_value_shadow",
        "bp_gauge_value",
        "st_gauge_value_shadow",
        "st_gauge_value"
    ],
    _intervalTimerID: null, // タイマーID, 回復時間を表示するために利用します

    // Poolから情報を取得します
    fetchInfo: function() {
        this._data.tag.a = Pool.Mine.tag.a;
        this._data.tag.b = Pool.Mine.tag.b;

        for (var prop in Pool.Mine) {
            this._data[prop] = Pool.Mine[prop];
        }
        // ダミーデータで上書き
        if (TestEnv.useDummyData) {
            for (prop in this._debugData) {
                this._data[prop] = this._debugData[prop];
            }
        }
    },

    initialize: function() {
        NgLogD(this.classname+"::initialize");
    },

    action_close: function(elem, param) {
        NgLogD(this.classname+"::action_close sceneName=" + SceneDirector.currentScene.sceneName);

        if (SceneDirector.currentScene.sceneName === 'StatusScene') {
            SceneDirector.pop();
        } else {
            alert("SCENE TRANSITION FAILED");
            alert("FORCE SCENE TRANSITION");
            SceneDirector.pop();
        }
    },

    action_click: function(elem, param) {
        NgLogD(this.classname+"::action_click. param=" + param);

        switch (param) {
        case "tag":
            // TODO:
            //      本来 pop() しなくても transition() だけで動作するが、
            //      pop() せずに transition() すると、
            //      シーン切り替え中に、MyPage が一瞬表示されてしまう。
            //      MyPageを表示しないためには 本来不要(?)な pop() を行なっている

            // pop() -> 現在のシーン(StatusView)を削除し,
            //          親のシーン(MyPageView)に戻る
            SceneDirector.pop();

            // transition() -> 現在のシーンを削除し,
            //                 新しい兄弟シーン(TagView)を追加し、
            //                 そちら(TagView)に処理を移す
            SceneDirector.transition("TagScene");
            break;

        case "item1":
            try {
                SceneDirector.push("ShopItemScene", { item: 1, scene: "Status" });
            } catch (err) {
                NgLogE('StatusController#action_click - SceneDirector.push("ShopItemScene", { item: 1, scene: "Status" }) fail');
            }
            break;

        case "item2":
            try {
                SceneDirector.push("ShopItemScene", { item: 2, scene: "Status" });
            } catch (err) {
                NgLogE('StatusController#action_click - SceneDirector.push("ShopItemScene", { item: 2, scene: "Status" }) fail');
            }
        }
    },

    deactive: function() {
        NgLogD("StatusController#deactive");
        this.StatusView.setTouchable(false);
    },

    active: function() {
        NgLogD("StatusController#active");
        this.StatusView.setTouchable(true);
    },

    // Hero-A と Hero-B を返す
    getHeros: function() { // @return Hero
        return [this._data.tag.a, this._data.tag.b];
    },
    getKKD: function() {
        return this._data.kkd;
    },
    getLevel: function() {
        return this._data.level;
    },
    getNickName: function() {
        return this._data.nickname;
    },
    getFriendPoint: function() {
        return this._data.mission_point;
    },
    getMusclePoint: function() {
        return this._data.combined_point;
    },
    getBattleInfo: function() {
        return { win: 0, lose: 0, draw: 0 };
    },
    getCollectHeros: function() {
        return 0;
    },
    getExp: function() {
        return this._data.exp_rate;
    },
    getBattleHealInfo: function() { // @return { sec, point, max }
        return {
            sec:    this._data.battle_heal_sec,
            point:  this._data.battle_stamina,
            max:    this._data.max_battle_stamina
        };
    },
    getStaminaHealInfo: function() { // @return { sec, point, max }
        return {
            sec:    this._data.mission_heal_sec,
            point:  this._data.mission_stamina,
            max:    this._data.max_mission_stamina
        };
    },
    calcBattleHealInfo: function() { // @return { sec, point, max, time }
        var heal  = this.getBattleHealInfo(), // { sec, point, max }
            sec   = heal.heal,
            point = heal.point,
            max   = heal.max,
            time  = "00:00:00";

        if (sec) {
            if ((sec % 180) === 0) { // 3分で point + 1
                if (++point > max) {
                    point = max;
                }
            }
            if (--sec < 0) {
                sec = 0;
                point = max;
            }
        }
        this._data.battle_heal_sec    = sec;
        this._data.battle_stamina     = point;
        this._data.max_battle_stamina = max;

        // 回復可能なら残り時間を設定, 最大まで回復済みなら残り時間を"00:00:00"に
        if (point < max) {
            time = Times.toDigitString(sec);
        }
        return { sec: sec, point: point, max: max, time: time };
    },
    calcStaminaHealInfo: function() { // @return { sec, point, max, time }
        var heal  = this.getStaminaHealInfo(), // { sec, point, max }
            sec   = heal.heal,
            point = heal.point,
            max   = heal.max,
            time  = "00:00:00";

        if (sec) {
            if ((sec % 180) === 0) { // 3分で point + 1
                if (++point > max) {
                    point = max;
                }
            }
            if (--sec < 0) {
                sec = 0;
                point = max;
            }
        }
        this._data.mission_heal_sec     = sec;
        this._data.mission_stamina      = point;
        this._data.max_mission_stamina  = max;

        // 回復可能なら残り時間を設定, 最大まで回復済みなら残り時間を"00:00:00"に
        if (point < max) {
            time = Times.toDigitString(sec);
        }
        return { sec: sec, point: point, max: max, time: time };
    },

    buildNodes: function() {

Dump.d(Pool.Mine, { depth: 7 });

        this.fetchInfo();

        this.buildStaticNodes(this.StatusView);
        this.buildDynamicNodes(this.StatusView, this._dynamicNodeArray);

        this.kkd.gluiobj.replace({ kkd: this.getKKD() });
        this.level.gluiobj.replace({ level: this.getLevel() });
        this.nickname_bold.gluiobj.replace({ nickname: this.getNickName() });
        this.nickname.gluiobj.replace({ nickname: this.getNickName() });
        this.fp.gluiobj.replace({ fp: this.getFriendPoint() });
        this.mp.gluiobj.replace({ mp: this.getMusclePoint() });
        this.battle.gluiobj.replace(this.getBattleInfo());
        this.collect_heros.gluiobj.replace({ heros: this.getCollectHeros() });
    },
    startUpdateTimer: function() {
        var _self = this;

        if (!this._intervalTimerID) {
            this._intervalTimerID = setInterval(function() {
                _self.buildDynamicNodes(_self.StatusView, _self._dynamicNodeArray);
            }, TestEnv.debug ? 50 : 1000);
        }
    },
    endUpdateTimer: function() {
        if (this._intervalTimerID) {
            clearInterval(this._intervalTimerID);
            this._intervalTimerID = null;
        }
    },
    buildStaticNodes: function(parentNode) { // @param Node:
        this.buildStaticNodesImpl();

        var name, node;

        for (name in this._staticNodes) {
            if (this._staticNodes[name].getGLObject) {
                node = this._staticNodes[name].getGLObject();
            } else {
                node = this._staticNodes[name];
            }
            parentNode.addChild(node);
        }
    },
    buildDynamicNodes: function(parentNode,      // @param Node:
                                nodeNameArray) { // @param NodeNameStringArray: [nodeName, ...]
        this.buildDynamicNodesImpl(nodeNameArray);

        var name, node;

        for (name in this._dynamicNodes) {
            if (this._dynamicNodes[name].getGLObject) {
                node = this._dynamicNodes[name].getGLObject();
            } else {
                node = this._dynamicNodes[name];
            }
            parentNode.addChild(node);
        }
    },
    destroyNodes: function() {
        var nodes, node;

        nodes = this._staticNodes;
        for (node in nodes) {
            nodes[node].destroy();
            nodes[node] = null;
            delete nodes[node];
        }

        nodes = this._dynamicNodes;
        for (node in nodes) {
            nodes[node].destroy();
            nodes[node] = null;
            delete nodes[node];
        }
    },

    buildStaticNodesImpl: function() {
        this._staticNodes = {
            hero1: Pool.Mine.tag.a.getUpperSprite([80, 80], [0, 0]),
            hero2: Pool.Mine.tag.b.getUpperSprite([80, 80], [0, 0])
        };
        this._staticNodes.hero1.setPosition( 30, 110);
        this._staticNodes.hero2.setPosition(105, 110);

        // TODO: avatar
        if (0) {
            var avatar = Pool.Mine.getAvatarSprite([64, 64]);
            avatar.setPosition(39, 84);
            this._staticNodes.avatar = avatar;
        }
    },
    buildDynamicNodesImpl: function(nodeNameArray) { // @param NodeNameStringArray: [nodeName, ...]

        var nodes = this._dynamicNodes;
        var btInfo = this.getBattleHealInfo();
        var stInfo = this.getStaminaHealInfo();
        var _self = this;

        nodeNameArray.forEach(function(nodeName) {
            var num = 0, sec = 0, point = 0, max = 0,
                // 影描画用
                color = "FFFFFF", offsetX = 0, offsetY = 0;

            switch (nodeName) {

            // バトルポイント回復残り時間
            case "battle_heal_sec":
                btInfo = _self.calcBattleHealInfo();
                nodes[nodeName] && nodes[nodeName].destroy();
                nodes[nodeName] = CreateGo.label({
                        text:  btInfo.time,
                        frame: [235, 240, 60, 20],
                        size:  10,
                        align: "left"
                    });
                break;

            // スタミナ回復残り時間
            case "mission_heal_sec":
                stInfo = _self.calcStaminaHealInfo();
                nodes[nodeName] && nodes[nodeName].destroy();
                nodes[nodeName] = CreateGo.label({
                        text:  stInfo.time,
                        frame: [235, 260, 60, 20],
                        size:  10,
                        align: "left"
                    });
                break;

            // Expゲージ
            case "exp_gauge":
                point = _self.getExp();
                max   = 100;
                num   = (point / max) * 53; // Content/image/mypage/st_expgauge.png -> 58x17 (53x13)
                nodes[nodeName] && nodes[nodeName].destroy();
                nodes[nodeName] = CreateCore.image({
                        url: "Content/image/common/parts_exp.png",
                        frame: [218, 134, num, 10]
                    });
                break;

            // バトルポイントゲージ
            case "bp_gauge":
                point = btInfo.point;
                max   = btInfo.max;

                if (!max) {
                    num = max = point = 0;
                } else {
                    num = (point / max) * 58;
                    num = Math.ceil(num); // 切り上げ
                }
                // Content/image/mypage/box_gauge.png -> 55x17 (50x15)
                nodes[nodeName] && nodes[nodeName].destroy();
                nodes[nodeName] = CreateCore.image({
                        url: "Content/image/common/parts_bp.png",
                        frame: [166, 238, num, 13]
                    });
                break;

            // スタミナゲージ
            case "st_gauge":
                point = stInfo.point;
                max   = stInfo.max;

                if (!max) {
                    num = max = point = 0;
                } else {
                    num = (point / max) * 58;
                    num = Math.ceil(num); // 切り上げ
                }
                // Content/image/mypage/box_gauge.png -> 55x17 (50x15)
                nodes[nodeName] && nodes[nodeName].destroy();
                nodes[nodeName] = CreateCore.image({
                        url: "Content/image/common/parts_stamina.png",
                        frame: [166, 258, num, 13]
                    });
                break;

            // バトルポイントゲージ上の数字(+影)
            case "bp_gauge_value_shadow":
                offsetX = 1;
                offsetY = 1;
                color = "333333";
            case "bp_gauge_value":
                point = btInfo.point;
                max   = btInfo.max;
                num   = point + "/" + max;

                nodes[nodeName] && nodes[nodeName].destroy();
                nodes[nodeName] = CreateGo.label({
                        text: num,
                        frame: [167 + 5 + offsetX, 240 + offsetY, 60, 20],
                        size: 10,
                        align: "left",
                        color: color
                    });
                color = "FFFFFF";
                offsetX = 0;
                offsetY = 0;
                break;

            // スタミナゲージ上の数字(+影)
            case "st_gauge_value_shadow":
                offsetX = 1;
                offsetY = 1;
                color = "333333";
            case "st_gauge_value":
                point = btInfo.point;
                max   = btInfo.max;
                num   = point + "/" + max;
                nodes[nodeName] && nodes[nodeName].destroy();
                nodes[nodeName] = CreateGo.label({
                        text: num,
                        frame: [167 + 5 + offsetX, 260 + offsetY, 60, 20],
                        size: 10,
                        align: "left",
                        color: color
                    });
                color = "FFFFFF";
                offsetX = 0;
                offsetY = 0;
            }
        });
    }

});
