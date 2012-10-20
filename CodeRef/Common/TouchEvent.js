var Core = require('../../NGCore/Client/Core').Core;
var GL2 = require('../../NGCore/Client/GL2').GL2;

/**
 * タッチイベントを取得するためのクラス。
 * @example
 * var touchEvent = new TouchEvent();
 *
 * // タッチサイズを拾う範囲
 * touchEvent.touchTarget.setSize([width, height]);
 * touchEvent.touchTarget.setPosition([-width / 2, -height / 2]);
 * touchEvent.touchTarget.setDepth(depth);
 *
 * // イベントリスナの設定
 * touchEvent.addEventListener("touchstart", self.onTouchStart);
 * touchEvent.addEventListener("touchend", self.onTouchEnd);
 * touchEvent.addEventListener("touchmove", self.onTouchMove);
 * touchEvent.addEventListener("tap", self.onTap);
 *
 * // タッチイベントを拾いたいノードにaddChildする
 * view.addChild(touchEvent.touchTarget);
 */

exports.TouchEvent = Core.MessageListener.subclass({
    classname: 'TouchEvent',

    touchTarget: null,

    touchStartListener: null,
    touchEndListener: null,
    touchMoveListener: null,
    tapListener: null,

    _prev: null,

    EVENT_TYPES: {
        touchstart : 1,
        touchend   : 2,
        touchmove  : 3,
        tap        : 4
    },

    initialize: function() {
        var self = this;

        self.touchTarget = new GL2.TouchTarget();
        self.touchTarget.getTouchEmitter().addListener(self, self.onTouch);
    },

    /**
     * イベント発生時に呼ばれるリスナーの登録
     * @property {String} type "touchstart" || "touchend" || "touchmove"
     * @property {Function} callback function(point) {...} // point = { x:..., y:... }
     */
    addEventListener: function(type, callback) {
        switch (this.EVENT_TYPES[type]) {
        case this.EVENT_TYPES.touchend:
            this.touchEndListener = callback;
            break;
        case this.EVENT_TYPES.touchstart:
            this.touchStartListener = callback;
            break;
        case this.EVENT_TYPES.touchmove:
            this.touchMoveListener = callback;
            break;
        case this.EVENT_TYPES.tap:
            this.tapListener = callback;
            break;
        }
    },

    onTouch: function(touch) {
        var self = this, point;

        switch (touch.getAction()) {
        case touch.Action.Start:
            point = self._getPoint(touch);

            self._prev = point;
            self.touchStartListener && self.touchStartListener(point);

            return true;
        case touch.Action.End:
            point = self._getPoint(touch);

            if (self._prev) {
                self.tapListener && self.tapListener(point);
            }
            else {
                self.touchEndListener && self.touchEndListener(point);
            }

            self._prev = null;

            break;
        case touch.Action.Move:
            point = self._getPoint(touch);

            self.touchMoveListener && self.touchMoveListener(point);

            if (self._prev && 16 < self._calcTapDiff(point)) {
                self._prev = null;
            }

            break;
        }

        return false;
    },

    _calcTapDiff: function(point) {
        return (point.x - this._prev.x) * (point.x - this._prev.x) +
               (point.y - this._prev.y) * (point.y - this._prev.y);
    },

    _getPoint: function(touch) {
        return {
            x: touch.getPosition().getX(),
            y: touch.getPosition().getY()
        };
    }
});
