var Core = require("../../NGCore/Client/Core").Core;
var GLUI = require("../../NGGo/GLUI").GLUI;
var TouchEvent = require("../Common/TouchEvent").TouchEvent;
var EpisodeList = require("../Common/EpisodeList").EpisodeList;
var GameAPI = require('../GameAPI').GameAPI;

exports.EpisodeListController = Core.Class.subclass({
    classname: "EpisodeListController",

    _touchEvent: null,
    _episodeList: null,

    initialize: function() {
    },

    destroy: function() {
        if (this._episodeList) {
            this._episodeList.destroy();
            this._episodeList = null;
        }
    },

    deactive: function() {
        this.EpisodeListView.setTouchable(false);
    },

    active: function() {
        this.EpisodeListView.setTouchable(true);
    },

    onSceneLoaded: function(callback) {
        this._initTouch();
        this._initList(callback);
    },

    onEpisodeSelect: function(episode) {
        SceneDirector.transition("MissionListScene", { episode: episode });
    },

    _initTouch: function() {
        var self = this,
            frame = this.TouchTarget.gluiobj.getFrame();

        self.touchEvent = new TouchEvent();
        self.touchEvent.touchTarget.setSize([frame[2], frame[3]]);
        self.touchEvent.touchTarget.setPosition(- frame[0] / 2, -frame[1] / 2);
        self.touchEvent.touchTarget.setDepth(Layer.Depth.TOP);

        self.TouchTarget.addChild(self.touchEvent.touchTarget);
    },

    _initList: function(callback) {
        var self = this;

        GameAPI.Mission.getEpisodeList(function(episodes) {
            self._episodeList = new EpisodeList({
                area: self.Episodes,
                touch: self.touchEvent,
                data: episodes,
                itemSize: [200, 300],
                imageSize: [512, 512],
                activeChangeListener: function(episode) {
                    self._onActiveChange(episode);
                },
                activeClickListener: function(episode) {
                    self._onActiveClick(episode);
                },
                imageURLGenerator: function(episode) {
                    if (episode.status.lock) {
                        return "Content/image/hero/silhouette.png";
                    }
                    else {
                        return "Content/image/npc/boss/" + episode.id + ".png";
                    }
                }
            });

            callback();
        });
    },

    _onActiveChange: function(episode) {
        this._updateEpisodeTitle(episode);
        this._updateEpisodeGauge(episode);
    },

    _onActiveClick: function(episode) {
        if (episode.status.lock) {
            return;
        }

        this.onEpisodeSelect(episode);
    },

    _updateEpisodeTitle: function(episode) {
        this.EpisodeTitle.setImage(
            episode.status.lock
                ? "Content/image/mission/prt_key.png"
                : "Content/image/mission/episode_title_" + episode.id + ".png",
            [320, 105], [0, 0]
        );
    },

    _updateEpisodeGauge: function(episode) {
        var value = 0;

        if (episode.status.lock) {
            value = 0;
        }
        else if (episode.status.is_cleared) {
            value = 1;
        }
        else {
            value = episode.status.count / 4;
        }

        this.ProgressGauge.gluiobj.setValue(value);
    }
});
