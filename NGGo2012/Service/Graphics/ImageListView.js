////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Taha Samad
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
var Node = require('../../../NGCore/Client/GL2/Node').Node;
var TouchTarget = require('../../../NGCore/Client/GL2/TouchTarget').TouchTarget;
var MessageListener = require('../../../NGCore/Client/Core/MessageListener').MessageListener;
var UpdateEmitter = require('../../../NGCore/Client/Core/UpdateEmitter').UpdateEmitter;
var Size = require('../../../NGCore/Client/Core/Size').Size;
var Rect = require('../../../NGCore/Client/Core/Rect').Rect;
var Vector = require('../../../NGCore/Client/Core/Vector').Vector;
var AbstractView = require('../../GLUI/AbstractView').AbstractView;
var GLUIUtil = require('../../GLUI/Util').Util; /** @private */
var Scrollbar = GLUIUtil.Rectangle.subclass(
{
    classname: "Scrollbar",
    initialize: function ($super)
    {
        $super();
        this.setColor([0.5, 0.5, 0.5]);
        this.setAlpha(0);
        this.setDepth(65535);
    },
    updateSize: function (mode, frame, contentSize)
    {
        var f_width = frame.getSize().getWidth();
        var f_height = frame.getSize().getHeight();
        var c_width = contentSize.getWidth();
        var c_height = contentSize.getHeight();
        var r;
        if(mode === exports.ImageListView.ScrollDirection.Horizontal)
        {
            if(f_width < c_width)
            {
                r = c_width === 0 ? 1 : (f_width / c_width);
                this.setFrame([0, f_height - 5, f_width * r, 5]);
            }
            else
            {
                this.setFrame([0, f_height - 5, f_width, 5]);
            }
        }
        else
        {
            if(f_height < c_height)
            {
                r = c_height === 0 ? 1 : (f_height / c_height);
                this.setFrame([f_width - 5, 0, 5, f_height * r]);
            }
            else
            {
                this.setFrame([f_width - 5, 0, 5, f_height]);
            }
        }
        this.mode = mode;
        this.frameSize = new Size([f_width, f_height]);
        this.contentSize = new Size([c_width, c_height]);
    },
    updateAlpha: function (momentum)
    {
        if(momentum.x === 0 && momentum.y === 0)
        {
            var alpha = this.getAlpha();
            if(alpha === 0)
            {
                return;
            }
            else
            {
                alpha -= 0.03;
                if(alpha < 0.01)
                {
                    alpha = 0;
                }
                this.setAlpha(alpha);
            }
        }
    },
    updatePosition: function (new_x, new_y)
    {
        this.setAlpha(1);
        if(!this.mode)
        {
            return;
        }
        var f_width = this.frameSize.getWidth();
        var f_height = this.frameSize.getHeight();
        var c_width = this.contentSize.getWidth();
        var c_height = this.contentSize.getHeight();
        if(this.mode === exports.ImageListView.ScrollDirection.Horizontal)
        {
            this.setPosition(-f_width * (new_x / c_width), f_height - 5);
        }
        else
        {
            this.setPosition(f_width - 5, -f_height * (new_y / c_height));
        }
    }
}); /** @private */
var DragListener = MessageListener.subclass(
{
    classname: 'DragListener',
    initialize: function (listview)
    {
        this._touch = null;
        this.listview = listview;
        this._target = new TouchTarget();
        this._target.getTouchEmitter().addListener(this, this.onTouch);
        UpdateEmitter.addListener(this, this.onUpdate);
        this._clickChild = null;
    },
    getTarget: function ()
    {
        return this._target;
    },
    getTouch: function ()
    {
        return this._touch;
    },
    onTouch: function (touch)
    {
        switch(touch.getAction())
        {
        case touch.Action.Start:
            if(this._touch)
            {
                return false;
            }
            this._touch = {
                id: touch.getId(),
                sx: touch.getPosition().getX(),
                sy: touch.getPosition().getY(),
                x: touch.getPosition().getX(),
                y: touch.getPosition().getY(),
                lx: touch.getPosition().getX(),
                ly: touch.getPosition().getY(),
                dx: 0,
                dy: 0,
                startTime: new Date().getTime(),
                endTime: 0,
                hasMoved: false,
                hasMovedOutside: false
            };
            this._touch.endTime = this._touch.startTime;
            this._clickChild = this.listview._giveTouchesToChildren(touch, this.listview._listitems);
            return true;
        case touch.Action.End:
            if(this._touch.id !== touch.getId())
            {
                return false;
            }
            if(this.listview._snap && this._touch.hasMoved)
            {
                this._touch.endTime = new Date().getTime();
                this.listview._evaluateSnapMomentum(this._touch);
            }
            if(this._clickChild)
            {
                this._clickChild._touchReceivedCallBack(touch);
                this._clickChild = null;
            }
            this._touch = null;
            break;
        case touch.Action.Move:
            if(this._touch.id !== touch.getId() || this.listview._scrollLock || this._touch.hasMovedOutside)
            {
                return false;
            }
            if(!touch.getIsInside(this._target))
            {
                this._touch.hasMovedOutside = true;
                if(this._clickChild)
                {
                    this._clickChild._touchReceivedCallBack(touch, true);
                    this._clickChild = null;
                }
            }
            else
            {
                var pos = touch.getPosition();
                if(this._touch === null || pos === undefined)
                {
                    break;
                }
                this._touch.x = pos.getX();
                this._touch.y = pos.getY();
                var moveDis = Math.pow(this._touch.x - this._touch.lx, 2) + Math.pow(this._touch.y - this._touch.ly, 2);
                var touchSensitivity = this.listview._feeling.touchSensitivity;
                if(moveDis <= (touchSensitivity * touchSensitivity))
                {
                    break;
                }
                this._touch.hasMoved = true;
                this._touch.dx += this._touch.x - this._touch.lx;
                this._touch.dy += this._touch.y - this._touch.ly;
                this._touch.lx = this._touch.x;
                this._touch.ly = this._touch.y;
                if(this._clickChild)
                {
                    this._clickChild._touchReceivedCallBack(touch, true);
                    this._clickChild = null;
                }
            }
            break;
        default:
            break;
        }
        return false;
    },
    onUpdate: function ()
    {
        var count = 0;
        var delta = {
            x: 0,
            y: 0
        };
        if(this._touch)
        {
            delta.x += this._touch.dx;
            delta.y += this._touch.dy;
            this._touch.dx = this._touch.dy = 0;
            ++count;
        }
        if(count > 1)
        {
            delta.x /= count;
            delta.y /= count;
        }
        // Tell our scroll area to update.
        this.listview._onUpdate(delta);
    },
    hasTouch: function ()
    {
        return(this._touch !== null);
    },
    destroy: function ()
    {
        this._target.getTouchEmitter().removeListener(this);
        this._target.destroy();
        this._target = null;
        UpdateEmitter.removeListener(this);
        this._clickChild = null;
        this._touch = null;
        this.listview = null;
    }
});
exports.ImageListView = Node.subclass( /** @lends Service.Graphics.ImageListView.prototype */
{
    classname: 'ImageListView',
    /**
     * @class ImageListView.
     * ImageListView supports vertical and horizontal list. It accepts <i>GL2 Node or GLUI objects</i> as list item.
     * 
     * @example
     * // Create Image List View; 
     * var listview = new ImageListView();
     * listview.setItemSize([200, 200]);
     * listview.setFrame([0, 0, 200, 200]);
     * listview.setScrollDirection(ImageListView.ScrollDirection.Horizontal);
     * GL2.Root.addChild(listview);
     *
     * // Create GLUI Item 
     * var listitem1 = new GLUI.View();
     * listitem1.setFrame([0,0,200,200]);
     * listitem1.setImage("./Content/listitem.png", null,[200, 200]);
     * var img1 = new GLUI.Image();
     * img1.setFrame([0,0,100,100]);
     * img1.setImage('./Content/image.png',null, [100, 100]);
     * listitem1.addChild(img1);
     *
     * // Create GL2 Item 
     * var listitem2 = new GL2.Sprite();
     * listitem2.setImage("./Content/listitem.png",[200, 200],[0.5,0.5]);
     * var img2 = new GL2.Sprite();
     * img2.setImage('./Content/image.png',[100,100],[0.5,0.5]);
     * listitem2.addChild(img2);     
     *
     * //Add Item. Second parameter is index where item is to be inserted.
     * listview.addItem(listitem1);
     * listview.addItem(listitem2,0);
     * @constructs The default constructor.
     * @augments GL2.Node
     */
    initialize: function ()
    {
        this._snap = false;
        this._frame = new Rect([0, 0, 0, 0]);
        this._itemSize = new Size();
        this._contentSize = new Size();
        this._content = new Node();
        this._content.setTouchable(false);
        this._content.setDepth(0);
        this.addChild(this._content);
        this._feeling = {
            friction: 0.9,
            smoothingFactor: 0.3,
            stretchDecay: 0.65,
            rangeFactor: 0.5,
            flickSpeed: 0.3,
            touchSensitivity: 2
        };
        this._momentum = {
            x: 0,
            y: 0
        };
        this._listitems = [];
        this._scrollbar = new Scrollbar();
        this.addChild(this._scrollbar);
        this._dragger = null;
        this._touchTarget = null;
        this._scrollLock = false;
        this.setClipRectEnabled(true);
        this._lastClipRectFrame = [0, 0, 0, 0];
        this.setScrollDirection(this.ScrollDirection.Horizontal);
        this._setters = [];
        this._registerSetters();
        this._preventContentSize = true;
    },
    /**
     * ScrollDirection.Horizontal or ScrollDirection.Vertical
     */
    ScrollDirection: {
        Horizontal: 1,
        Vertical: 2
    },
    /**
     * Sets Scroll Feeling.
     * @param {object} feeling Feeling object contains following keys: friction, smoothingFactor,rangeFactor, touchSensitivity, flickSpeed and stretchDecay. All values are Numbers.
     * </br> </br>
     * <div class="ul"> 
     * <li> friction  </li> Its default value is 0.9. For higher friction value ImageListView experiences less friction. 
     * <li>smoothingFactor</li> Its default value is 0.3. For higher smoothingFactor ImageListView moves more smoothly. 
     * <li>stretchDecay</li> Its default value is 0.65.  For high stretchDecay ImageListView returns slowly after being stretched beyond its bounds.
     * <li>rangeFactor</li> This factor sets the stretch range of ImageListView when stretched beyond its bounds. Its default value is 0.5. For higher rangeFactor ImageListView experiences large stretch.
     * <li>flickSpeed</li> This is useful only when setSnap of ImageListView is true. If swipe speed is greater than flickSpeed then ImageListView moves to next page even when distance moved is less than half the itemSize. Its default value is 0.3.
     * <li>touchSensitivity</li> ImageListView will handle touch move event after moving number of pixels equal to touchSensitivity. Its default value is 2.
     * </div>     
     * @example
     * // Create Image List View; 
     * var listview = new ImageListView();
     * listview.setScrollFeeling({touchSensitivity:10,flickSpeed:0.5}); //the values for keys, which are not present in the passed object remain unchanged.
     */
    setScrollFeeling: function (feeling)
    {
        if(feeling)
        {
            var key;
            for(key in this._feeling)
            {
                if(this._feeling.hasOwnProperty(key))
                {
                    this._feeling[key] = feeling[key] && typeof (feeling[key]) === "number" ? feeling[key] : this._feeling[key];
                }
            }
        }
        else
        {
            throw new Error("setScrollFeeling() got null or undefined.");
        }
    },
    /**
     * Returns feeling object.
     * @returns {object} feeling.
     */
    getScrollFeeling: function ()
    {
        return this._feeling;
    },
    /**
     * Sets item size. You need to set this property for proper functioning.
     * @param {Array} itemSize The size of each item. It can be an array like <i>[200, 200]</i>.
     */
    setItemSize: function (itemSize)
    {
        this._itemSize = new Size(itemSize);
        this._setContentSize();
    },
    /**
     * Returns Item Size.
     * @returns {Array} itemSize.
     */
    getItemSize: function ()
    {
        return [this._itemSize.getWidth(), this._itemSize.getHeight()];
    },
    /**
     * Sets frame. You need to set this property for proper functioning.
     * @param {Array} frame The frame of ImageListView. It can be an array like <i>[0, 0, 200, 200]</i>.
     */
    setFrame: function (frame)
    {
        this._frame = new Rect(frame);
        var origin = this._frame.getOrigin();
        var size = this._frame.getSize();
        this.setPosition(origin.getX(), origin.getY());
        if(this._touchTarget)
        {
            this.removeChild(this._touchTarget);
            this._touchTarget = null;
        }
        if(this._dragger)
        {
            this._dragger.destroy();
        }
        this._dragger = new DragListener(this);
        this._touchTarget = this._dragger.getTarget();
        this._touchTarget.setSize(size);
        this._touchTarget.setPosition(0, 0);
        this._touchTarget.setDepth(1);
        this.addChild(this._touchTarget);
        this._setContentSize();
        this._updateClipRect();
    },
    /**
     * Returns frame of ImageListView.
     * @returns {Array} Frame of ImageListView 
     */
    getFrame: function ()
    {
        var origin = this._frame.getOrigin();
        var size = this._frame.getSize();
        return [origin.getX(), origin.getY(), size.getWidth(), size.getHeight()];
    },
    /**
     * Sets Scroll Direction.
     * @param {Number} dir Scrolling Direction.
     */
    setScrollDirection: function (dir)
    {
        switch(dir)
        {
        case this.ScrollDirection.Horizontal:
        case this.ScrollDirection.Vertical:
            this._scroll = dir;
            this._content.setPosition(0, 0);
            this._setContentSize();
            break;
        default:
            throw new Error("at setScrollDirection() invalid value: " + dir);
        }
    },
    /**
     * Returns Scroll Direction.
     * @returns {Number} Scroll Direction.
     */
    getScrollDirection: function ()
    {
        return this._scroll;
    },
    /**
     * Sets Snap mode on/off.
     * @param {bool} bool true = snapping/paging is turned ON. false = snapping/paging is turned OFF.
     */
    setSnap: function (bool)
    {
        this._snap = Boolean(bool);
        this._content.setPosition(0, 0);
    },
    /**
     * Returns Snapping/Paging Mode Status.
     * @returns {boolean} returns whether snap/paging mode is ON(true) or OFF(false).
     */
    getSnap: function ()
    {
        return this._snap;
    },
    /**
     * Sets Scroll Lock on/off. 
     * @param {boolean}
     */
    setScrollLock: function (lock)
    {
        if(typeof (lock) === "boolean")
        {
            this._scrollLock = lock;
        }
        else
        {
            throw new Error("setScrollLock(lock) expects boolean got " + typeof (lock) + ".");
        }
    },
    /**
     * Returns Status of Scroll Lock.
     * @returns {boolean} Status of Scroll Lock.
     */
    getScrollLock: function ()
    {
        return this._scrollLock;
    },
    /**
     * Sets Scroll Position.
     * @param {number} pos Scroll Position.
     */
    setScrollPosition: function (pos)
    {
        if(typeof (pos) === "number")
        {
            switch(this._scroll)
            {
            case this.ScrollDirection.Horizontal:
                this._content.setPosition(-pos, 0);
                break;
            case this.ScrollDirection.Vertical:
                this._content.setPosition(0, -pos);
                break;
            }
        }
        else
        {
            throw new Error('setScrollPosition(pos) expects pos to be a number. Got ' + typeof (pos) + ".");
        }
    },
    /**
     * Returns Scroll Position.
     * @returns {Array} Current Scroll Position.
     */
    getScrollPosition: function ()
    {
        return [-this._content.getPosition().getX(), -this._content.getPosition().getY()];
    },
    /**
     * Add Item to ImageListView.
     * @param {GL2 Node or GLUI object} childItem
     * @param {number} index optional parameter, index where you want to insert an item.
     */
    addItem: function (childItem, index)
    {
        if(!(childItem instanceof AbstractView || childItem instanceof Node))
        {
            throw new Error("childItem should be an instanceof GLUI.AbstractView or GL2.Node.");
        }

        if(this._listitems.indexOf(childItem) >= 0)
        {
            this.removeItem(childItem);
        }

        if(typeof (index) === "number" && index >= 0 && index < this._listitems.length)
        {
            this._listitems.splice(index, 0, childItem);
        }
        else
        {
            this._listitems.push(childItem);
        }

        var item = childItem;
        if(childItem instanceof AbstractView)
        {
            childItem._parent = this;
            item = childItem.getGLObject();
        }
        this._content.addChild(item);

        if (this._getPreventContentSize()) {
            this._setContentSize();
        }
    },

    /**
     * 
     */
    beginAddItem: function ()
    {
        this._setPreventContentSize(false);
    },

    /**
     * 
     */
    endAddItem: function ()
    {
        this._setPreventContentSize(true);
        this._setContentSize();
    },

    /**
     * @private
     * @param {boolean} value Sets of preventContentSize flag.
     */
    _setPreventContentSize: function(value)
    {
        this._preventContentSize = !! value;
    },

    /**
     * @private
     * @return {boolean} Returns of preventContentSize flag.
     */
    _getPreventContentSize: function()
    {
        return this._preventContentSize;
    },

    /**
     * Returns length of list items array.
     * @returns {number} get length of list items array. This is also the number of items in ImageListView.
     */
    get length()
    {
        return this._listitems.length;
    },
    /**
     * length is readonly.
     */
    set length(value)
    {
        throw new Error("length is readonly");
    },
    /**
     * Removes list item.
     * @param {GLUI object or GL2 Node} childItem item to be removed.
     */
    removeItem: function (childItem)
    {
        if(childItem instanceof AbstractView || childItem instanceof Node)
        {
            var index = this._listitems.indexOf(childItem);
            if(index >= 0)
            {
                this._listitems.splice(index, 1);
                if(childItem instanceof AbstractView)
                {
                    this._content.removeChild(childItem.getGLObject());
                    childItem._parent = null;
                }
                else
                {
                    this._content.removeChild(childItem);
                }
                if (this._getPreventContentSize()) {
                    this._setContentSize();
                }
            }
            else
            {
                throw new Error("Trying to remove an Object which is not a child of this ImageListView.");
            }
        }
        else
        {
            throw new Error("childItem should be an instanceof GLUI.AbstractView or GL2.Node.");
        }
    },
    /**
     * Removes all list items.
     */
    clearItems: function ()
    {
        var i;
        var children = this._listitems.slice();
        var length = this._listitems.length;

        this._setPreventContentSize(false);
        for(i = 0; i < length; i++)
        {
            this.removeItem(children[i]);
        }
        this._setPreventContentSize(true);

        children.length = 0;
        children = null;
        this._listitems = [];
        this._contentSize = new Size();
        this._setContentSize();
    },
    /**
     * Default Destroy
     */
    destroy: function ()
    {
        this.clearItems();
        this._scrollbar.destroy();
        this._scrollbar = null;
        this._content.destroy();
        this._content = null;
        this._dragger.destroy();
        this._dragger = null;
        this._touchTarget = null;
        this._snap = null;
        this._frame = null;
        this._itemSize = null;
        this._contentSize = null;
        this._feeling = null;
        this._momentum = null;
        this._listitems = null;
        this._scrollLock = null;
        this._setters.length = 0;
        this._setters = null;
        this._lastClipRectFrame.length = 0;
        this._lastClipRectFrame = null;
    },
    /** @private */
    _setContentSize: function ()
    {
        var i, item, width, height, anchor, anchorH, anchorV, bias;
        if(this._scroll === this.ScrollDirection.Horizontal)
        {
            width = this._itemSize.getWidth();
            height = this._frame.getSize().getHeight();
            bias = (this._frame.getSize().getHeight() - this._itemSize.getHeight()) / 2;
            this._contentSize.setHeight(this._frame.getSize().getHeight());
            this._contentSize.setWidth(width * this._listitems.length);
            var left = 0;
            for(i = 0; i < this._listitems.length; i++)
            {
                item = this._listitems[i];
                if(item instanceof AbstractView)
                {
                    item.setFrame([left, bias, width, this._itemSize.getHeight()]);
                }
                else
                {
                    if(item.getAnchor)
                    {
                        anchor = item.getAnchor();
                    }
                    else if(item._animation && item._animation.getFrame(0))
                    {
                        anchor = GLUIUtil.getAnchor(item);
                    }
                    else
                    {
                        anchor = new Vector(0, 0);
                    }
                    anchorH = width * anchor.getX();
                    anchorV = this._itemSize.getHeight() * anchor.getY();
                    item.setPosition(left + anchorH, bias + anchorV);
                }
                left += width;
            }
        }
        else
        {
            width = this._frame.getSize().getWidth();
            height = this._itemSize.getHeight();
            bias = (this._frame.getSize().getWidth() - this._itemSize.getWidth()) / 2;
            this._contentSize.setWidth(this._frame.getSize().getWidth());
            this._contentSize.setHeight(height * this._listitems.length);
            var top = 0;
            for(i = 0; i < this._listitems.length; i++)
            {
                item = this._listitems[i];
                if(item instanceof AbstractView)
                {
                    item.setFrame([bias, top, this._itemSize.getWidth(), height]);
                }
                else
                {
                    if(item.getAnchor)
                    {
                        anchor = item.getAnchor();
                    }
                    else if(item._animation && item._animation.getFrame(0))
                    {
                        anchor = GLUIUtil.getAnchor(item);
                    }
                    else
                    {
                        anchor = new Vector(0, 0);
                    }
                    anchorH = this._itemSize.getWidth() * anchor.getX();
                    anchorV = height * anchor.getY();
                    item.setPosition(bias + anchorH, top + anchorV);
                }
                top += height;
            }
        }
        this._scrollbar.updateSize(this._scroll, this._frame, this._contentSize);
    },
    /** @private */
    _setAttributes: function (properties)
    {
        var key;
        for(key in properties)
        {
            if(properties.hasOwnProperty(key))
            {
                var func = this._setters[key];
                if(func)
                {
                    func(properties[key]);
                }
                else
                {
                    func = this["set" + key.charAt(0).toUpperCase() + key.substring(1)];
                    if(typeof func === "function")
                    {
                        var fn = func.bind(this);
                        fn(properties[key]);
                    }
                    else
                    {
                        console.log("Setter for '" + key + "' not found for " + this.classname);
                    }
                }
            }
        }
        return this;
    },
    _registerSetters: function ()
    {
        this._setters.scrollFeeling = this.setScrollFeeling.bind(this);
        this._setters.itemSize = this.setItemSize.bind(this);
        this._setters.frame = this.setFrame.bind(this);
        this._setters.scrollDirection = this.setScrollDirection.bind(this);
        this._setters.snap = this.setSnap.bind(this);
        this._setters.scrollLock = this.setScrollLock.bind(this);
        this._setters.scrollPosition = this.setScrollPosition.bind(this);
    },
    /** @private
     * This function calculates application of deltas over the range of positions.
     */
    _applyRange: function (position, delta, lower, upper)
    {
        if(delta === 0)
        {
            return position;
        }
        //Handle positive delta
        if(delta > 0)
        {
            //If we're below our lower bound, only move by range factor.
            if(position < lower)
            {
                position += delta * this._feeling.rangeFactor;
                //If we've moved into range, apply the delta into range and save the remainder.
                if(position >= lower)
                {
                    delta = (position - lower) / this._feeling.rangeFactor;
                    position = lower;
                }
                else
                {
                    return position;
                }
            }
            //If we're inside our bounds, apply the delta
            if(position < upper)
            {
                //if the delta will place us out of range, apply it and save the remainder.
                if(position + delta > upper)
                {
                    delta -= (upper - position);
                    position = upper;
                    delta *= this._feeling.rangeFactor;
                }
            }
            //We're out of range, so only apply by range factor.
            else
            {
                delta *= this._feeling.rangeFactor;
            }
        }
        //Handle negative delta; same thing, just bounds reversed.
        else if(delta < 0)
        {
            if(position > upper)
            {
                position += delta * this._feeling.rangeFactor;
                if(position <= upper)
                {
                    delta = (position - upper) / this._feeling.rangeFactor;
                    position = upper;
                }
                else
                {
                    return position;
                }
            }
            if(position > lower)
            {
                if(position + delta < lower)
                {
                    delta -= (lower - position);
                    position = lower;
                    delta *= this._feeling.rangeFactor;
                }
            }
            else
            {
                delta *= this._feeling.rangeFactor;
            }
        }
        return position + delta;
    },
    /** @private */
    _giveTouchesToChildren: function (touch, array)
    {
        var i = 0;
        if(array && array.length > 0)
        {
            for(i = array.length - 1; i >= 0; i--)
            {
                var arrayItem = array[i];
                if(arrayItem instanceof AbstractView && arrayItem._isTouchInFrame(touch) && arrayItem._enabled && arrayItem._visible && arrayItem._clickable)
                {
                    var retInstance = arrayItem._touchReceivedCallBack(touch, true);
                    if(retInstance)
                    {
                        return retInstance;
                    }
                }
            }
        }
        return null;
    },
    /** @private */
    _updateClipRect: function ()
    {
        var pos = this.localToScreen(new Vector(0, 0));
        var size = this._frame.getSize();
        size = new Vector(size.getWidth(), size.getHeight());
        var adjustedSize = this.localToScreen(size);
        if(pos && adjustedSize)
        {
            var x = pos.getX();
            var y = pos.getY();
            var w = (adjustedSize.getX() - x);
            var h = (adjustedSize.getY() - y);
            if(x === this._lastClipRectFrame[0] && y === this._lastClipRectFrame[1] && w === this._lastClipRectFrame[2] && h === this._lastClipRectFrame[3])
            {
                return true;
            }
            this._lastClipRectFrame = [x, y, w, h];
            this.setClipRect(this._lastClipRectFrame);
            return true;
        }
        else
        {
            return false;
        }
    },
    /** @private */
    _onUpdate: function (delta)
    {
        this._updateClipRect();
        var sf = this._feeling.smoothingFactor;
        var hasTouch = this._dragger.hasTouch();
        //Our ranges are negative because we push the origin up/left from the start position.
        var h_upper = 0;
        var h_lower = this._frame.getSize().getWidth() - this._contentSize.getWidth();
        if(h_lower > -1)
        {
            h_lower = -1;
        }
        var v_upper = 0;
        var v_lower = this._frame.getSize().getHeight() - this._contentSize.getHeight();
        if(v_lower > -1)
        {
            v_lower = -1;
        }
        var new_x = this._content.getPosition().getX();
        var new_y = this._content.getPosition().getY();

        //if we're in bounds and we have no movement, don't bother updating
        if(delta.x === 0 && delta.y === 0)
        {
            if(this._momentum.x === 0 && this._momentum.y === 0)
            {
                if(hasTouch || ((new_x >= h_lower) && (new_x <= h_upper) && (new_y >= v_lower) && (new_y <= h_upper)))
                {
                    this._scrollbar.updateAlpha(this._momentum);
                    return;
                }
            }
        }
        //If we have touches accumulate momentum
        if(hasTouch)
        {
            if(this._snap)
            {
                if(this._dragger.getTouch().hasMoved)
                {
                    this._momentum.x = sf * delta.x + (1 - sf) * this._momentum.x;
                    this._momentum.y = sf * delta.y + (1 - sf) * this._momentum.y;
                }
            }
            else
            {
                //Use exponential smoothing to approximate the current momentum
                this._momentum.x = sf * delta.x + (1 - sf) * this._momentum.x;
                this._momentum.y = sf * delta.y + (1 - sf) * this._momentum.y;
            }
        }
        //Otherwise, consume the momentum.
        else if(this._snap)
        {
            delta.x += this._momentum.x * sf;
            delta.y += this._momentum.y * sf;
            if(this._momentum.x < 5 && this._momentum.x > -5)
            {
                delta.x = this._momentum.x;
                this._momentum.x = 0;
            }
            if(this._momentum.y < 5 && this._momentum.y > -5)
            {
                delta.y = this._momentum.y;
                this._momentum.y = 0;
            }
            this._momentum.x = this._momentum.x * (1 - sf);
            this._momentum.y = this._momentum.y * (1 - sf);
        }
        else
        {
            delta.x += this._momentum.x;
            delta.y += this._momentum.y;
            //Apply friction, stop if we're below a small threshold.
            this._momentum.x *= this._feeling.friction;
            this._momentum.y *= this._feeling.friction;
            if(this._momentum.x < 1 && this._momentum.x > -1)
            {
                this._momentum.x = 0;
            }
            if(this._momentum.y < 1 && this._momentum.y > -1)
            {
                this._momentum.y = 0;
            }
        }
        //Handle any deltas
        if(this._scroll === this.ScrollDirection.Horizontal)
        {
            new_x = this._applyRange(new_x, delta.x, h_lower, h_upper);
        }
        else
        {
            new_y = this._applyRange(new_y, delta.y, v_lower, v_upper);
        }
        //Without touches to anchor us, we should slide back into range.
        if(!hasTouch)
        {
            if(new_x < h_lower)
            {
                new_x = h_lower - (h_lower - new_x) * this._feeling.stretchDecay;
                if(h_lower - new_x < 1)
                {
                    new_x = h_lower;
                }
            }
            else if(new_x > h_upper)
            {
                new_x = h_upper + (new_x - h_upper) * this._feeling.stretchDecay;
                if(new_x - h_upper < 1)
                {
                    new_x = h_upper;
                }
            }
            if(new_y < v_lower)
            {
                new_y = v_lower - (v_lower - new_y) * this._feeling.stretchDecay;
                if(v_lower - new_y < 1)
                {
                    new_y = v_lower;
                }
            }
            else if(new_y > h_upper)
            {
                new_y = v_upper + (new_y - v_upper) * this._feeling.stretchDecay;
                if(new_y - v_upper < 1)
                {
                    new_y = v_upper;
                }
            }
        }
        this._content.setPosition(new_x, new_y);
        this._scrollbar.updatePosition(new_x, new_y);
    },
    /** @private */
    _evaluateSnapMomentum: function (touch)
    {
        var mod, xSpeed, ySpeed;
        xSpeed = (touch.x - touch.sx) / (touch.endTime - touch.startTime);
        ySpeed = (touch.y - touch.sy) / (touch.endTime - touch.startTime);
        if(isNaN(xSpeed))
        {
            xSpeed = 0;
        }
        if(isNaN(ySpeed))
        {
            ySpeed = 0;
        }
        switch(this._scroll)
        {
        case this.ScrollDirection.Horizontal:
            mod = (-this._content.getPosition().getX()) % this._itemSize.getWidth();
            if(mod > 0)
            {
                if(((xSpeed < 0) && (mod >= this._itemSize.getWidth() / 2)) || (xSpeed <= -this._feeling.flickSpeed))
                {
                    this._momentum = {
                        x: -this._itemSize.getWidth() + mod,
                        y: 0
                    };
                }
                else if(((xSpeed > 0) && (mod < this._itemSize.getWidth() / 2)) || (xSpeed >= this._feeling.flickSpeed))
                {
                    this._momentum = {
                        x: mod,
                        y: 0
                    };
                }
                else if(xSpeed < 0) //not enough movement to scroll forward
                {
                    this._momentum = {
                        x: mod,
                        y: 0
                    };
                }
                else //not enough movement back to scroll back
                {
                    this._momentum = {
                        x: -this._itemSize.getWidth() + mod,
                        y: 0
                    };
                }
            }
            break;
        case this.ScrollDirection.Vertical:
            mod = (-this._content.getPosition().getY()) % this._itemSize.getHeight();
            if(mod > 0)
            {
                if(((ySpeed < 0) && (mod >= this._itemSize.getHeight() / 2)) || (ySpeed <= -this._feeling.flickSpeed))
                {
                    this._momentum = {
                        x: 0,
                        y: -this._itemSize.getHeight() + mod
                    };
                }
                else if(((ySpeed > 0) && (mod < this._itemSize.getHeight() / 2)) || (ySpeed >= this._feeling.flickSpeed))
                {
                    this._momentum = {
                        x: 0,
                        y: mod
                    };
                }
                else if(ySpeed < 0) //not enough movement to scroll up
                {
                    this._momentum = {
                        x: 0,
                        y: mod
                    };
                }
                else //not enough movementto scroll down
                {
                    this._momentum = {
                        x: 0,
                        y: -this._itemSize.getHeight() + mod
                    };
                }
            }
            break;
        }
    }
});