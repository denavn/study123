var Scene = require("../../NGGo/Framework/Scene/Scene").Scene;
var MovieScene = require("./MovieScene").MovieScene;
var MissionMovieController = require("../Controller/MissionMovieController").MissionMovieController;
var GUIBuilder = require("../../NGGo/Framework/GUIBuilder").GUIBuilder;
var Layer = require("../Layer").Layer;

exports.MissionMovieScene = MovieScene.subclass({
    classname: "MissionMovieScene",
    sceneName: "MissionMovieScene",

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
        }, {
            "name": "EffectContainer",
            "type": "node",
            "attrs": {
                "frame": [0, 150, null, null]
            }
        }]
    }],

    initialize: function($super) {
        $super();
    },

    onEnter: function(prevScene, option) {
        NgLogD(this.classname+"::onEnter");

        var _self = this;

        _self.controller = new MissionMovieController(option);
        GUIBuilder.loadConfigFromData(_self._view, _self.controller, function (e) {
            Layer.addRootChild(_self.controller.MovieView, Layer.Depth.TOP);
            _self.controller.onSceneLoaded();
        });
    }
});
