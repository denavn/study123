var Core = require('../../NGCore/Client/Core').Core;
var GLUI = require("../../NGGo/GLUI").GLUI;

var EPISODE_VERBOSE = false;

var EpisodeItem = Core.Class.subclass({
    classname: "EpisodeItem",

    _state: null,
    _id: null,
    _value: null,
    _position: null,
    _size: null,
    _imageSize: null,
    _imageURL: null,
    button: null,

    // _image: null,

    /**
     * @property {Object} params
     * {
     *   id: アイテムのID,
     *   imageURL: 画像ファイルのパス,
     *   position: { x:..., y:... },
     *   size: { w:..., h:... },
     *   imageSize: { w:..., h:... }
     * }
     */
    initialize: function(params) {
        this._trac("initialize");

        this._id = params.id;
        this._position = params.position;
        this._size = params.size;
        this._imageSize = params.imageSize;
        this._imageURL = params.imageURL;

        this._state = EpisodeItem.STATE.INACTIVE;

        this._initButton();
    },

    destroy: function() {
        this._trac("destroy");

        this.button.destroy();
        this.button = null;
    },

    active: function(depth) {
        this._trac("active");

        if (this._state === EpisodeItem.STATE.ACTIVE) {
            return;
        }

        this._state = EpisodeItem.STATE.ACTIVE;
        this._loadImage();

        this.button.getGLObject().setDepth(depth);
        this.button.getGLObject().setAlpha(1.0);
    },

    semiactive: function(depth) {
        this._trac("semiactive");

        if (this._state === EpisodeItem.STATE.SEMIACTIVE) {
            return;
        }

        this._state = EpisodeItem.STATE.SEMIACTIVE;
        this._loadImage();

        this.button.getGLObject().setDepth(depth);
        this.button.getGLObject().setAlpha(0.5);
    },

    inactive: function(depth) {
        this._trac("inactive");

        if (this._state === EpisodeItem.STATE.INACTIVE) {
            return;
        }

        this._state = EpisodeItem.STATE.INACTIVE;
        this._removeImage();
    },

    _initButton: function() {
        this._trac("initButton");

        this.button = new GLUI.Button();

        this.button.setFrame([
            this._position.x - (this._imageSize.w - this._size.w) / 2,
            this._position.y,
            this._imageSize.w, this._imageSize.h
        ]);
    },

    _loadImage: function() {
        if (!this.button.getImage()) {
            this.button.setImage(
                this._imageURL,
                GLUI.State.Normal,
                [this._imageSize.w, this._imageSize.h]
            );
        }
    },

    _removeImage: function() {
        if (this.button.getImage()) {
            this.button._internalGLObject.removeChild(this.button._imageObject.getGLObject());
            this.button._imageObject.destroy();
            this.button._imageObject = null;
        }
    },

    _log: function(message) {
        if (EPISODE_VERBOSE) {
            console.log(message);
        }
    },

    _trac: function(funcname) {
        this._log(this.classname + "." + funcname);
    }
});

EpisodeItem.STATE = {
    ACTIVE: "active",
    SEMIACTIVE: "semiactive",
    INACTIVE: "inactive"
};

var EpisodeList = Core.Class.subclass({
    classname: "EpisodeList",

    _area: null,
    _container: null,
    episodes: null,                 /** 表示するリストの元データ */
    _itemSize: null,             /** リストアイテムの実体のサイズ { w:..., h: ... } */
    _imageSize: null,            /** リストアイテムの画像のサイズ { w:..., h: ... } */
    _list: null,                 /** 表示するリストのモデル */
    _listX: null,                /** リストのx方向ずれ */
    _active: null,               /** 現在アクティブなアイテムのID */
    _prev: { x: null, y: null }, /** 前回取得時のマウス座標 */
    _diff: { x: null, y: null }, /** マウス移動の差分 */
    _state: null,
    _releaseTimer: null,
    _activeChangeListener: null, /** 最前面のアイテムが変化したときに呼ばれる */
    _activeClickListener: null,  /** 最前面のアイテムをクリックしたときに呼ばれる */
    _imageURLGenerator: null, /** エピソード画像生成ルール function(episode) { return url; }

    /**
     * @property {Object} params
     * {
     *   area: {Button} リストを表示する場所,
     *   touch: {TouchEvent},
     *   data: {Array} リストの元データ [Episode, ...],
     *   itemSize: {w:..., h:...},
     *   imageSize: {w:..., h:...},
     *   activeChageListener: function(episode) {}, アクティブな要素が変化したときに呼ばれる
     *   activeClickListener: function(episode) {}  アクティブな要素がクリックしたときに呼ばれる
     * }
     */
    initialize: function(params) {
        this._trac("initialize");

        var self = this;

        if (params === undefined) {
            params = {};
        }

        self._area = params.area;
        self._touch = params.touch;
        self._episodes = params.data;
        self._itemSize = { w: params.itemSize[0], h: params.itemSize[1] }; // [200, 300]
        self._imageSize = { w: params.imageSize[0], h: params.imageSize[0] }; // [512, 512]
        self._activeChangeListener = params.activeChangeListener;
        self._activeClickListener = params.activeClickListener;
        self._imageURLGenerator = params.imageURLGenerator;

        self._state = EpisodeList.STATE.NORMAL;
        self._listX = (320 - this._itemSize.w) / 2;

        self._initEvents();
        self._initList();

        self._update();
    },

    destroy: function() {
        this._trac("destroy");

        this._area = null;

        this._list.forEach(function(item) {
            item.destroy();
        });
        this._list = null;
    },

    /**
     * @property {Function} listener function(episode) { ... }
     */
    setActiveChangeListener: function(listener) {
        this._trac("setActiveChangeListener");

        this._activeChangeListener = listener;
    },

    /**
     * @property {Function} listener function(episode) { ... }
     */
    setActiveClickListener: function(listener) {
        this._trac("setActiveClickListener");

        this._activeClickListener = listener;
    },

    _initEvents: function() {
        this._trac("_initEvents");

        var self = this;

        self._touch.addEventListener("touchstart", function(event) {
            self._onDown(event);
        });

        self._touch.addEventListener("touchmove", function(event) {
            self._onMove(event);
        });

        self._touch.addEventListener("touchend", function(event) {
            self._onRelease(event);
        });

        self._touch.addEventListener("tap", function(event) {
            self._onTap(event);
        });
    },

    _initList: function() {
        this._trac("_initList");

        var i, item, imageURL;

        this._list = [];

        this._container = new GLUI.View();
        this._container.setFrame([
            0, 0,
            this._itemSize.w * this._episodes.length, this._itemSize.h
        ]);
        this._area.addChild(this._container.getGLObject());

        for (i = 0; i < this._episodes.length; ++i) {
            imageURL = this._imageURLGenerator(this._episodes[i]);

            item = new EpisodeItem({
                id: this._episodes[i].id,
                position: { x: this._itemSize.w * i, y: 0 },
                size: { w: this._itemSize.w, h: this._itemSize.h },
                imageSize: { w: this._imageSize.w, h: this._imageSize.h },
                imageURL: imageURL
            });

            this._list.push(item);
            this._container.getGLObject().addChild(item.button.getGLObject());
        };
    },

    _onItemClick: function() {
        if (this._activeClickListener) {
            this._activeClickListener(this._episodes[this._active]);
        }
    },

    _update: function() {
        this._trac("_update");

        var depth = this._list.length,
            newActive = this._calcActive(),
            item, i;

        if (this._active !== newActive) {
            this._active = newActive;

            if (this._activeChangeListener) {
                this._activeChangeListener(this._episodes[this._active]);
            }
        }

        for (i = 0; i < this._list.length; ++i) {
            if (i === this._active) {
                this._list[i].active(10);
            }
            else if (i - 1 === this._active || i + 1 === this._active) {
                this._list[i].semiactive(5);
            }
            else {
                this._list[i].inactive(0);
            }
        }

        this._container.setFrame([
            this._listX, 0,
            this._itemSize.w * this._list.length, this._itemSize.h
        ]);
    },

    // リストの表示位置から、中央に表示されているアイテムを求める
    _calcActive: function() {
        return -((this._listX - (320 - this._itemSize.w)) / this._itemSize.w) | 0;
    },

    _changeState: function(next) {
        this._trac("changeState");

        this._log(this._state + " -> " + next);
        this._state = next;
    },

    _onDown: function(pos) {
        this._trac("_onDown");

        this._changeState(EpisodeList.STATE.MOVE);
    },

    _onMove: function(pos) {
        var listXMax = (320 - this._itemSize.w) / 2,
            listXMin = (320 - this._itemSize.w) / 2 - (this._episodes.length - 1) * this._itemSize.w;

        this._trac("_onMove");

        if (this._state !== EpisodeList.STATE.MOVE) {
            return;
        }

        if (this._prev.x === null) {
            this._prev.x = pos.x;
            return;
        }

        this._diff.x = pos.x - this._prev.x;
        this._prev.x = pos.x;
        this._listX += this._diff.x;

        if (listXMax < this._listX) {
            this._listX = listXMax;
        }
        else if (this._listX < listXMin) {
            this._listX = listXMin;
        }

        this._update();
    },

    _onTap: function() {
        this._trac("_onTap");

        if (this._active !== null && this._activeClickListener) {
            this._activeClickListener(this._episodes[this._active]);
        }
    },

    _onRelease: function(pos) {
        this._trac("_onRelease");

        this._prev.x = null;
        this._changeState(EpisodeList.STATE.RELEASE);
    },

    _log: function(message) {
        if (EPISODE_VERBOSE) {
            console.log(message);
        }
    },

    _trac: function(funcname) {
        this._log(this.classname + "." + funcname);
    }
});

EpisodeList.STATE = {
    NORMAL  : "normal",
    MOVE    : "move",
    RELEASE : "release"
};

exports.EpisodeList = EpisodeList;
