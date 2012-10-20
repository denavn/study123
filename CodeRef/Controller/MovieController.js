var Core = require('../../NGCore/Client/Core').Core;
var Flash = require('../../ExGame/Flash').Flash;
var GLUI = require("../../NGGo/GLUI").GLUI;

var MovieController = Core.Class.subclass({
    classname: "MovieController",

    _swfPath: null,
    _nextScene: null,
    _backgroundPath: null,
    _backgroundFrame: null,
    _takeover: null,

    _flashPlayer: null,
    _background: null,

    _state: null,

    initialize: function(option) {
        NgLogD(this.classname + ".initialize");

        if (!option || !option.swfPath) {
            throw new Error("MovieScene must receive option.swfPath");
        }

        this._swfPath = option.swfPath;                 /** swfディレクトリのパス */
        this._nextScene = option.nextScene;             /** ムービー再生後に移動するシーン名 指定がなければ pop する */
        this._backgroundPath = option.backgroundPath;   /** 背景画像のパス 省略可 */
        this._backgroundFrame = option.backgroundFrame; /** 背景画像のフレーム 省略した場合は [0, 0, 320, 480] */

        if (this._backgroundPath && !this._backgroundFrame) {
            this._backgroundFrame = [0, 0, 320, 480];
        }

        this._state = MovieController.STATE.INIT;

        delete option.swfPath;
        delete option.nextScene;
        delete option.backgroundPath;
        this._takeover = option; /** ムービー再生後に移動するシーンに渡すオプション */
    },

    destroy: function() {
        if (this._background) {
            this._background.destroy();
            this._background = null;
        }

        if (this._flashPlayer) {
            this._flashPlayer.destroy();
            this._flashPlayer = null;
        }
    },

    onSceneLoaded: function() {
        var self = this;

        if (self._backgroundPath) {
            self._background = new GLUI.View();
            self._background.setFrame(this._backgroundFrame);
            self._background.setImage(
                self._backgroundPath,
                GLUI.State.Normal,
                [this._backgroundFrame[2], this._backgroundFrame[3]]
            );

            self.MovieView.addChild(self._background.getGLObject());
        }

        self.MovieView.setTouchable(false);
        self.TouchHandler.gluiobj.setOnClick(function() {
            self._onClick(self._nextScene);
        });

        self._playMovie();
    },

    _playMovie: function() {
        var self = this;

        self._flashPlayer = new Flash.Player(self._swfPath);
        self._flashPlayer.setScale(1.0, 1.0);
        self._flashPlayer.setTouchable(false);
        self._flashPlayer.onFSCommand2 = function(args) {
            switch(args[0]) {
            case "pause" :
                self._onMoviePause();
                break;
            case "finish" :
                self._onMovieFinish();
                break;
            }
        };
        self._flashPlayer.play();
        self._state = MovieController.STATE.PLAY;

        self.FlashCantainer.addChild(self._flashPlayer);
    },

    _onMoviePause: function() {
        this._state = MovieController.STATE.PAUSE;
        this.MovieView.setTouchable(true);
    },

    _onMovieFinish: function() {
        this._state = MovieController.STATE.FINISH;
        this.MovieView.setTouchable(true);
    },

    _onClick: function() {
        switch (this._state) {
        case MovieController.STATE.PAUSE:
            this.MovieView.setTouchable(false);
            this._flashPlayer.play();
            break;
        case MovieController.STATE.FINISH:
            if (this._nextScene) {
                NgLogD(this.classname + "::_onClick transit to " + this._nextScene);
                SceneDirector.transition(this._nextScene, this._takeover);
            }
            else {
                NgLogD(this.classname + "::_onClick pop");
                SceneDirector.pop(this._takeover);
            }
            break;
        }
    }
});

MovieController.STATE = {
    INIT: 1,
    PLAY: 2,
    PAUSE: 3,
    FINISH: 4
};

exports.MovieController = MovieController;
