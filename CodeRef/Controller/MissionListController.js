var Core = require('../../NGCore/Client/Core').Core;
var GLUI = require("../../NGGo/GLUI").GLUI;
var Pool = require("../Pool").Pool;
var Global = require("../../Config/Global").Global;

var MissionListController = Core.Class.subclass({
    classname: "MissionListController",

    initialize: function(episode) {
        NgLogD(this.classname + ".initialize");

        Pool.mission = {
            episode: episode || {}, // 選択中のエピソードデータ
            selected: 0,            // 現在選択中のミッション
            result: null,           // ミッションの実行結果
            captureResult: null,    // 捕獲の実行結果
            isCommit: false,        // プロセス完了をコミットしたかどうか

            getMissions: function() {
                return Pool.mission.episode.missions;
            },
            getCurrentMission: function() {
                return Pool.mission.episode.missions[Pool.mission.selected];
            },
            setCurrentMission: function(index) {
                Pool.mission.selected = index;
            }
        };
    },

    destroy: function() {
    },

    deactive: function() {
        this.MissionListView.setTouchable(false);
    },

    active: function() {
        this.MissionListView.setTouchable(true);
    },

    onSceneLoaded: function(callback) {
        this.updateMissionList();
        callback();
    },

    updateMissionList: function(callback) {
        var self = this;

        GameAPI.Mission.getMissionList(Pool.mission.episode.id, function(episode) {
            Pool.mission.episode = episode;

            self._updateBackgronud();
            self._updateEpisodeTitle();
            self._updateBoss();
            self._updateBossButton();
            self._initMissionButtons();

            if (Pool.mission.episode.status.is_new) {
                Pool.mission.episode.status.is_new = false;

                SceneDirector.push("MovieScene", {
                    swfPath: self._buildStoryPath()
                });
            }

            if (typeof callback === "function") {
                callback();
            }
        });
    },

    action_missionClick: function(elem, param) {
        NgLogD(this.classname + ".action_missionClick");

        if (Pool.mission.getMissions()[param.index]) {
            Pool.mission.setCurrentMission(param.index);
            SceneDirector.push("MissionScene");
        }
    },

    action_bossClick: function(elem, param) {
        NgLogD(this.classname + ".action_bossClick");

        if (Pool.mission.episode.boss) {
            SceneDirector.push("BossAppearScene");
        }
    },

    // エピソード一覧
    action_episodeListClick: function(elem, param) {
        NgLogD(this.classname + ".action_episodeListClick");
        SceneDirector.transition("EpisodeListScene");
    },

    /**
     * エピソードの進行具合によって背景画像を切り替える
     */
    _updateBackgronud: function() {
        var url, count = Pool.mission.episode.status.count;

        switch (count) {
        case 1:
        case 2:
            url = Global.mission.background[count];
            break;
        case 3:
        default:
            url = Global.mission.background[3];
        }

        this.MissionListView.setImage(url, [320, 480], [0, 0]);
    },

    _updateEpisodeTitle: function() {
        this.EpisodeTitle.gluiobj.setImage(
            "Content/image/mission/episode_title_" + Pool.mission.episode.id + ".png",
            GLUI.State.Normal, [320, 105]
        );
    },

    _updateBoss: function() {
        this.Boss.gluiobj.setImage(
            "Content/image/npc/boss/" + Pool.mission.episode.id + ".png",
            GLUI.State.Normal, [512, 512]
        );
    },

    _updateBossButton: function() {
        this.BossBtn.gluiobj.setImage(
            Pool.mission.episode.boss
                    ? "Content/image/mission/btn_boss.png"
                    : "Content/image/mission/btn_boss_gray.png",
            GLUI.State.Normal, [126, 85]
        );
    },

    _initMissionButtons: function() {
        var self = this,
            num = Global.mission.num[Pool.mission.episode.status.count],
            jsonPath = "Content/view/MissionStep" + num + "View.json",
            viewName = "MissionStep" + num + "View";

        GUIBuilder.loadConfigFromFile(jsonPath, self, function() {
            self.MissionList.addChild(self[viewName]);
            var missions = Pool.mission.getMissions(), i;

            for (i = 0; i < missions.length; ++i) {
                if (100 <= missions[i].status.achievement_rate) {
                    self["MissionBtn" + i].gluiobj.setImage(
                        MissionListController.MISSION_BUTTON.CLEARED,
                        GLUI.State.Normal, [70, 70]
                    );
                }
            }

            for (i = missions.length; i < num; ++i) {
                self["MissionBtn" + i].gluiobj.setImage(
                    MissionListController.MISSION_BUTTON.LOCKED,
                    GLUI.State.Normal, [70, 70]
                );
                self["MissionBtn" + i].setTouchable(false);
            }
        });
    },

    _onMissionClick: function(index) {
        var mission;

        Pool.mission.setCurrentMission(index);
        SceneDirector.push("MissionScene");
    },

    _buildStoryPath: function() {
        var episode = Pool.mission.episode,
            mission = Pool.mission.getCurrentMission();

        // ディレクトリ名は
        // {episode.id}_{episode.status.count}_1

        // TODO: 現状episode.id == 1のものしかないので決め打ち
        // return "Content/swf/" + episode.id + "_" + episode.status.count + "_" + 1 + "/";
        return "Content/swf/1_" + episode.status.count + "_" + 1 + "/";
    }
});

MissionListController.MISSION_BUTTON = {
    NORMAL: "Content/image/mission/btn_mission.png",
    LOCKED: "Content/image/mission/btn_mission_next.png",
    CLEARED: "Content/image/mission/btn_mission_cleared.png"
};

exports.MissionListController = MissionListController;
