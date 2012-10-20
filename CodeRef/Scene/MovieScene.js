var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var MovieController = require("../Controller/MovieController").MovieController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

/**
 * @example
 * ムービー再生後にEpisodeListSceneに移動
 * SceneDirector.transition("MovieScene", {
 *     swfPath: "Content/swf/m_a1-1_bk/",
 *     nextScene: "EpisodeListScene"
 * });
 * @example
 * ムービー再生後にpop
 * SceneDirector.push("MovieScene", {
 *     swfPath: "Content/swf/m_a1-1_bk/"
 * });
 * @example
 * 背景の指定
 * SceneDirector.push("MovieScene", {
 *     swfPath: "Content/swf/m_a1-1_bk/",
 *     backgroundPath: "Content/image/bg/mission_ring.png",
 *     backgroundFrame: [25, 100, 270, 214]
 * });
 */
exports.MovieScene = Scene.subclass({
    classname: "MovieScene",
    sceneName: "MovieScene",

    controller: null,

    _view: [{
        "name": "MovieView",
        "type": "view",
        "attrs": {
            "frame": [0, 0, 320, 480]
        },
        "children": [{
            "name": "FlashCantainer",
            "type": "node",
            "attrs": {
                "frame": [0, 0, null, null]
            }
        }, {
            "name": "TouchHandler",
            "type": "button",
            "attrs": {
                "frame": [0, 0, 320, 480]
            }
        }]
    }],

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var self = this;

        self.controller = new MovieController(option);

        GUIBuilder.loadConfigFromData(self._view, self.controller, function (e) {
            if (e & e.stack) {
                console.log("error:" + e);
            }

            Layer.addRootChild(self.controller.MovieView, Layer.Depth.TOP);

            self.controller.onSceneLoaded();
        });
    },

    onResume: function(prevScene, option) {
        NgLogD(this.classname + "::onResume");
    },

    onPause: function(nextScene, option) {
        NgLogD(this.classname + "::onPause");
    },

    onExit: function(nextScene, option) {
        NgLogD(this.classname + "::onExit");

        Layer.removeRootChild(this.controller.MovieView);
        this.controller.destroy();
        this.controller.destroyAll();
    }
});
