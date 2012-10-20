////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Taha S, Jabbar M
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
var Rect = require('../../NGCore/Client/Core/Rect').Rect;
var Size = require('../../NGCore/Client/Core/Size').Size;
var Capabilities = require('../../NGCore/Client/Core/Capabilities').Capabilities;
var Vector = require('../../NGCore/Client/Core/Vector').Vector;
var MessageListener = require('../../NGCore/Client/Core/MessageListener').MessageListener;
var UpdateEmitter = require('../../NGCore/Client/Core/UpdateEmitter').UpdateEmitter;
var Point = require('../../NGCore/Client/Core/Point').Point;
var OrientationEmitter = require('../../NGCore/Client/Device/OrientationEmitter').OrientationEmitter;
var TouchTarget = require('../../NGCore/Client/GL2/TouchTarget').TouchTarget;
var Root = require('../../NGCore/Client/GL2/Root').Root;
var Node = require('../../NGCore/Client/GL2/Node').Node;
var Util = require('./Util').Util;
var View = require('./View').View;
var AbstractView = require('./AbstractView').AbstractView;
var WindowLayer = require('./WindowLayer').WindowLayer;
var Commands = require('./Commands').Commands;
var Button = require('./Button').Button;
////////////////////////        UI Components       /////////////////////
var EditText = require('../../NGCore/Client/UI/EditText').EditText;
var EditTextArea = require('../../NGCore/Client/UI/EditTextArea').EditTextArea;
var WebView = require('../../NGCore/Client/UI/WebView').WebView;
var MapView = require('../../NGCore/Client/UI/MapView').MapView;
var UIWindow = require('../../NGCore/Client/UI/Window').Window;
/** @private
 *class not to be accessed from out side
 *
 */
var Scrollbar = Util.Rectangle.subclass( /** @lends Scrollbar.prototype */
{
    initialize: function ($super)
    {
        $super();
        this.setColor([0.5, 0.5, 0.5]);
        this.setAlpha(0);
        this.setDepth(65535);
    },
    updateSize: function (mode, frame, contentSize)
    {
        var r;
        var f_width = frame.getSize().getWidth();
        var f_height = frame.getSize().getHeight();
        var c_width = contentSize.getWidth();
        var c_height = contentSize.getHeight();
        if(mode === exports.ScrollView.ScrollDirection.Horizontal)
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
        if(this.mode === exports.ScrollView.ScrollDirection.Horizontal)
        {
            this.setPosition(-f_width * (new_x / c_width), f_height - 5);
        }
        else
        {
            this.setPosition(f_width - 5, -f_height * (new_y / c_height));
        }
    }
});
/** @private
 *class not to be accessed from out side
 *
 */
var DragListener = MessageListener.subclass( /** @lends DragListener.prototype */
{
    classname: 'DragListener',
    DRAGTHRESHOLD: 15,
    initialize: function (listview)
    {
        this._touch = null;
        this.listview = listview;
        this._target = new TouchTarget();
        this._target.getTouchEmitter().addListener(this, this.onTouch);
        this._clickChild = null;
    },
    getTarget: function ()
    {
        return this._target;
    },
    onTouch: function (touch)
    {
        switch(touch.getAction())
        {
        case touch.Action.Start:
            if(this._touch || (this.listview._OS === "android" && touch.getId() !== 1) || !this.listview._enabled || !this.listview._visible || !this.listview._parentEnabled || !this.listview._touchable || !this.listview._parentTouchable || !this.listview._parentVisible || (this.listview.getState() & Commands.State.Disabled))
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
                hasMovedOutside: false,
                initialState: this.listview.getState()
            };
            this.listview.setState(Commands.State.Pressed);
            this._clickChild = this.listview._giveTouchesToChildren(touch, this.listview._visibleArray);
            if(!this._clickChild instanceof AbstractView)
            {
                this._clickChild = null;
            }
            return true;
        case touch.Action.End:
            if(!this._touch || this._touch.id !== touch.getId())
            {
                return false;
            }
            if(!this._touch.hasMovedOutside)
            {
                if(!(this._touch.initialState & Commands.State.Pressed))
                {
                    this.listview.clearState(Commands.State.Pressed);
                }
                if(this._clickChild)
                {
                    this._clickChild._touchReceivedCallBack(touch);
                    this._clickChild = null;
                }
                else
                {
                    this.listview._endTap();
                }
            }
            this._touch = null;
            break;
        case touch.Action.Move:
            if(!this._touch || this._touch.id !== touch.getId() || this.listview._scrollLock)
            {
                return false;
            }
            if(!this.listview._isTouchInFrame(touch) && !this._touch.hasMovedOutside)
            {
                this._touch.hasMovedOutside = true;
                if(!(this._touch.initialState & Commands.State.Pressed))
                {
                    this.listview.clearState(Commands.State.Pressed);
                }
                if(this._clickChild)
                {
                    this._clickChild._touchReceivedCallBack(touch, true);
                    this._clickChild = null;
                }
            }
            var pos = touch.getPosition();
            if(this._touch === null || pos === undefined)
            {
                break;
            }
            this._touch.x = pos.getX();
            this._touch.y = pos.getY();
            var moveDis = 0;
            if(this.listview)
            {
                if(this.listview.getScrollDirection() === this.listview.ScrollDirection.Horizontal)
                {
                    moveDis = Math.abs(this._touch.x - this._touch.lx);
                }
                else if(this.listview.getScrollDirection() === this.listview.ScrollDirection.Vertical)
                {
                    moveDis = Math.abs(this._touch.y - this._touch.ly);
                }
            }
            if(moveDis <= this.DRAGTHRESHOLD)
            {
                if(this._clickChild)
                {
                    this._clickChild._touchReceivedCallBack(touch);
                }
                break;
            }
            this._touch.dx += this._touch.x - this._touch.lx;
            this._touch.dy += this._touch.y - this._touch.ly;
            this._touch.lx = this._touch.x;
            this._touch.ly = this._touch.y;
            if(this._clickChild)
            {
                this._clickChild._touchReceivedCallBack(touch, true);
                this._clickChild = null;
            }
            if(this.listview._onScrollCallBack)
            {
                this.listview._onScrollCallBack();
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
        this.listview._onUpdate(delta);
    },
    hasTouch: function ()
    {
        return(this._touch !== null);
    },
    __addDragListenerToUpdateEmitter: function ()
    {
        UpdateEmitter.addListener(this, this.onUpdate);
    },
    destroy: function ($super)
    {
        if(this._target)
        {
            this._target.destroy();
            this._target = null;
        }
        this._touch = null;
        this.listview = null;
        this._clickChild = null;
        $super();
    }
});
exports.ScrollView = View.subclass( /** @lends GLUI.ScrollView.prototype */
{
    classname: 'ScrollView',
    /**
     * @class The <code>ScrollView</code> class constructs objects that handle views in a scrolling list (see <code>{@link GLUI.ListView}</code>). 
     * You can define these views as scrolling vertically or horizontially.<br><br>
     * <b>Note:</b> Android devices can only scroll in one direction at a time.
     * @name GLUI.ScrollView
     * @augments GLUI.View
     */
    ScrollDirection: {
        Horizontal: 1,
        Vertical: 2
    },
    /**
     * @constructs The default constructor.
     * @augments GLUI.View
     * @param {$super} $super This parameter is a reference to the base class implementation and is stripped out during execution. Do not supply it.
     * @param {String} properties Object properties.
     */
    initialize: function ($super, properties)
    {
        $super();
        this._myFrame = new Rect();
        this._contentSize = new Size();
        this._userFrame = null;
        this._content = new Node();
        this._content.setTouchable(false);
        this._scrollPosition = [0, 0];
        this._internalGLObject.addChild(this._content);
        this._content.setDepth(1);
        this._feeling = {
            friction: 0.90,
            smoothingFactor: 0.5,
            stretchDecay: 0.65,
            rangeFactor: 0.5
        };
        this.setScrollDirection(this.ScrollDirection.Vertical);
        this._momentum = {
            x: 0,
            y: 0
        };
        this._visibleArray = [];
        this._buttons = [];
        this._scrollbar = new Scrollbar();
        this._needUpdateScrollView = false;
        this._needEvaluateMarginalLimits = false;
        this._internalGLObject.addChild(this._scrollbar);
        this._internalGLObject.setClipRectEnabled(true);
        this._target = 1;
        this._lastClipRectFrame = [0, 0, 0, 0];
        this.setAttributes(properties);
    },
    /**
     * Add a child node to this <code>ScrollView</code> at the specified index.
     * @example var scrollView = new GLUI.ScrollView();
     * ...
     * var childView = new UI.View();
     * ...
     * scrollView.addChild(childView);
     * @param {GL2.Node} childNode The child node to add.
     * @param {Number} index The specified index.
     * @returns This function returns <code>this</code> to support method invocation chaining.
     * @throws {this.type + ".addChild: " + childNode + " is not a view!"} Specified node is not attached to a scrollView.
     * @see GLUI.ScrollView#removeChild
     * @status Android, Test
     * @private 
     */
    addChild: function (childNode, index)
    {
        if(childNode instanceof AbstractView)
        {
            if(childNode._parent)
            {
                childNode.removeFromParent();
            }
            if(this._children)
            {
                if((index === 0 || index > 0) && index < this._children.length)
                {
                    index = +index;
                    this._children.splice(index, 0, childNode);
                }
                else
                {
                    index = this._children.length;
                    this._children.push(childNode);
                }
            }
            // Must populate parent before setting visibility
            childNode._parent = this;
            childNode._setEnabled(this._enabled && this._parentEnabled, false);
            childNode._setVisible(this._visible && this._parentVisible, false);
            childNode._setTouchable(this._touchable && this._parentTouchable, false);
            this._updateUIChildrenState(true, childNode);
            this._content.addChild(childNode.getGLObject());
            this._needUpdateScrollView = true;
            this._updateDepth();
            var WindowLayer = require('./WindowLayer').WindowLayer;
            if(this.getRoot() instanceof WindowLayer)
            {
                childNode._callAppearanceEvent(false);
            }
            if(childNode instanceof View && !(childNode instanceof Button) && this._isAddedToParent)
            {
                childNode._addedToParent();
            }
        }
        else if((childNode instanceof EditText) || (childNode instanceof EditTextArea) || (childNode instanceof WebView) || (childNode instanceof MapView))
        {
            if(this._uiChildren.indexOf(childNode) === -1)
            {
                this._uiChildren.push(childNode); // maintaining array
                if(childNode._parent)
                {
                    childNode.removeFromParent();
                }
                this._updateUIChildrenState(true, childNode);
                if(this._isAddedToParent) // if node is already pushed into stack so its UIchildren must become visible at time of addChild
                {
                    UIWindow.document.addChild(childNode);
                }
                // getting frame and alpha values of editText
                this._addSettersGettersForUIComponents(childNode);
            }
        }
        else
        {
            throw new Error("message:" + this.type + ".addChild: " + childNode + " is not a view!");
        }
        return this;
    },
    /**
     * Remove a child node from this <code>scrollView</code>.
     * @example scrollView.removeChild(ChildView);
     * @param {GL2.Node} childNode The child node to remove.
     * @throws Any Exception occured with {Node.js} while removing a child node.
     * @see GLUI.ScrollView#addChild
     * @status Android, Test
     * @private 
     */
    removeChild: function (childNode)
    {
        var nodeIndex;
        if(childNode instanceof AbstractView)
        {
            try
            {
                nodeIndex = this._children.indexOf(childNode);
                if(nodeIndex !== -1)
                {
                    this._updateUIChildrenState(false, childNode);
                    this._children.splice(nodeIndex, 1);
                }
                var WindowLayer = require('./WindowLayer').WindowLayer;
                if(this.getRoot() instanceof WindowLayer)
                {
                    childNode._callAppearanceEvent(true);
                }
                this._content.removeChild(childNode.getGLObject());
                childNode._parent = null;
                childNode._setEnabled(true, false);
                childNode._setVisible(true, false);
                childNode._setTouchable(true, false);
                this._needUpdateScrollView = true;
                this._updateDepth();
                if(childNode instanceof View && !(childNode instanceof Button) && this._isAddedToParent)
                {
                    childNode._removedFromParent();
                }
            }
            catch(ex)
            {
                throw new Error(ex);
            }
        }
        else if((childNode instanceof EditText) || (childNode instanceof EditTextArea) || (childNode instanceof WebView) || (childNode instanceof MapView))
        {
            nodeIndex = this._uiChildren.indexOf(childNode);
            if(nodeIndex !== -1)
            {
                this._updateUIChildrenState(false, childNode);
                this._uiChildren.splice(nodeIndex, 1);
            }
            if(this._isAddedToParent)
            {
                UIWindow.document.removeChild(childNode);
            }
            this._removeSettersGettersForUIComponents(childNode);
            childNode._parent = null;
        }
        else
        {
            throw new Error("message:" + this.type + ".addChild: " + childNode + " is not a view!");
        }
    },
    /**
     * @name GLUI.ScrollView#setFrame
     * @function 
     * @description Set the value of the <code>frame</code> property. This property defines the size of ViewAble area of the ScrollView.
     * @example var scrollView = new GLUI.ScrollView();
     * ...
     * scrollView.setFrame([10, 10, 64, 64]);
     * @param {Number, Array (Number), Object} arg0 This parameter will pass in values in one of three ways:
     * <div class="ul">
     * <li>Four float values (<i>x</i>, <i>y</i>, <i>w</i>, <i>h</i>).</li>
     * <li>Single array containing the above four values.</li>
     * <li>A rect specifying the frame (see <code>{@link UI.ViewGeometry.Rect}</code>).</li>
     * </div>
     * <b>Note:</b>  Clipping is not supported on Flash.
     * @see GLUI.ScrollVIew#getFrame
     * @private
     */
    __setFrame: function ($super, frame)
    {
        $super(frame);
        this._userFrame = this._frame;
        this._evaluateScrollDirection();
        if(this._scroll === this.ScrollDirection.Horizontal)
        {
            if(frame[0] > 0)
            {
                console.log("Clipping is not supported for GLUI.ScrollView on FLASH, Horizontal recommended frame is: [0,y,w,h] provided frame: " + JSON.stringify(frame));
            }
            this._frame = [this._frame[0], this._frame[1], /*Util.getOrientationSreenWidth()*/ this._frame[2], this._frame[3]];
        }
        else
        {
            if(frame[1] > 0)
            {
                console.log("Clipping is not supported for GLUI.ScrollView on FLASH, Vertical recommended frame is: [x,0,w,h] provided frame: " + JSON.stringify(frame));
            }
            this._frame = [this._frame[0], this._frame[1], this._frame[2], this._frame[3] /*, Util.getOrientationSreenHeight()*/ ];
        }
        this._myFrame = new Rect(this._frame);
        var origin = this._myFrame.getOrigin();
        var size = this._myFrame.getSize();
        this.getGLObject().setPosition(origin.getX(), origin.getY());
        if(this._touchTarget)
        {
            this._internalGLObject.removeChild(this._touchTarget);
            this._touchTarget = null;
        }
        if(this._dragger)
        {
            this._dragger.destroy();
            this._dragger = null;
        }
        this._dragger = new DragListener(this);
        this._dragger.__addDragListenerToUpdateEmitter();
        this._touchTarget = this._dragger.getTarget();
        this._touchTarget.setSize(size);
        this._touchTarget.setPosition(0, 0);
        this._touchTarget.setDepth(2);
        this._internalGLObject.addChild(this._touchTarget);
        this._updateScrollBar();
        this._needUpdateScrollView = true;
        this._needEvaluateMarginalLimits = true;
    },
    _setFrameUI: function ()
    {
        if(this._hasUIChildren === true)
        {
            var x, j;
            if(this._uiChildren)
            {
                var uiChildrenLength = this._uiChildren.length;
                for(x = 0; x < uiChildrenLength; x++)
                {
                    var childFrame = this._uiChildren[x].getFrame();
                    if(childFrame)
                    {
                        this._uiChildren[x].setFrame(childFrame);
                    }
                }
            }
            if(this._visibleArray)
            {
                var gluiChildrenLength = this._visibleArray.length;
                for(j = 0; j < gluiChildrenLength; j++)
                {
                    if(this._visibleArray[j] instanceof View && !(this._visibleArray[j] instanceof Button))
                    {
                        this._visibleArray[j]._setFrameUI();
                    }
                }
            }
        }
    },
    /**
     * @name GLUI.ScrollView#getFrame
     * @description Retrieve the value of the <code>frame</code> property set by user.
     * @param {Number, Array (Number)} frame Individual components or a component array (<i>x</i>,<i>y</i>,<i>w</i>,<i>h</i>).
     * @see GLUI.ScrollView#setFrame
     * @private
     */
    getFrame: function ()
    {
        return this._userFrame;
    },
    /**
     * @name GLUI.ScrollView#setContentSize
     * @description Set the value for the <code>contentSize</code> property. This property defines the size of a scroll area.
     * @example var dialog = {
     *  width: screen.width * sizeRate.width / 100,
     *  height: screen.height * sizeRate.height / 100
     * };
     * ...
     * this.scrollView.setContentSize([dialog.width, 600]);
     * @params {Number, Array (Number, String)} Individual components or a component array.
     * @see GLUI.ScrollView#getContentSize
     * @function
     * @status Android, Test
     */
    setContentSize: function (contentSize)
    {
        if(contentSize instanceof Size)
        {
            contentSize = [contentSize.getWidth(), contentSize.getHeight()];
        }
        if(contentSize.length === 2)
        {
            if(isNaN(contentSize[0]) || isNaN(contentSize[1]))
            {
                throw new Error(this.classname + 'contentSize() expects numeric Array. getting [' + typeof (contentSize[0]) + ',' + typeof (contentSize[1]) + ']');
            }
            else
            {
                this._contentSizeArray = contentSize;
                this._setContentSize();
                this._evaluateScrollDirection();
            }
        }
        else
        {
            throw new Error(this.classname + 'contentSize() expects Array(2) or Core.Size(). eg [1200,300] or new Core.Size(200,1000)');
        }
    },
    /**
     * @name GLUI.ScrollView#getContentSize
     * @description Retrieve the value of the <code>contentSize</code> property.
     * @returns {Number, Array (Number, String)} The current value of <code>contentSize</code>.
     * @see GLUI.ScrollView#setContentSize
     * @function
     * @status Android, Test
     */
    getContentSize: function ()
    {
        return this._contentSizeArray;
    },
    /**
     * @name GLUI.ScrollView#setOnScroll
     * @description Set a function to call when the <code>scroll</code> event occurs.
     * @param {Function} scrollCallback The new callback function.<br><br>
     * <b>Note:</b> The <code>pageevent</code> event is disabled if the value of this parameter is not a function.
     * @see GLUI.ScrollView#event:getOnScroll
     * @event
     * @status Android, Test
     */
    /**
     * @name GLUI.ScrollView#getOnScroll
     * @description Retrieve the function to call when the <code>scroll</code> event occurs.
     * @returns {Function} The current callback function.
     * @see GLUI.ScrollView#event:setOnScroll
     * @event
     * @status Android, Test
     */
    setOnScroll: function (onScrollCallBack)
    {
        if(typeof (onScrollCallBack) === "function")
        {
            this._onScrollCallBack = onScrollCallBack;
        }
    },
    getOnScroll: function ()
    {
        return this._onScrollCallBack;
    },
    /**
     * @name GLUI.ScrollView#setScrollPosition
     * @description Set the value for the <code>scrollPosition</code> property.
     * @example var hscroller = new GLUI.ScrollView();
     * ...
     * hscroller.setScrollPosition([0.5,0]);
     * @param {Number, Array (Number)} Individual components or a component array.
     * @see GLUI.ScrollView#getScrollPosition
     * @function
     * @status Android, Test
     */
    setScrollPosition: function (vector)
    {
        if(arguments && arguments.length === 1)
        {
            vector = new Vector(vector);
        }
        else if(arguments.length === 2)
        {
            vector = new Vector(arguments[0], arguments[1]);
        }
        else
        {
            throw new Error("Too many or too few arguments for setScrollPosition | " + typeof (vector) + this.classname);
        }
        if(vector.getX() === undefined || vector.getX() === null || vector.getY() === undefined || vector.getY() === null)
        {
            return;
        }
        //var h_upper = 0;
        var h_lower = this._myFrame.getSize().getWidth() - this._contentSize.getWidth();
        if(h_lower > -1)
        {
            h_lower = -1;
        }
        //var v_upper = 0;
        var v_lower = this._myFrame.getSize().getHeight() - this._contentSize.getHeight();
        if(v_lower > -1)
        {
            v_lower = -1;
        }
        this._content.setPosition(-vector.getX(), -vector.getY());
        this._scrollPosition = [vector.getX(), vector.getY()];
        this._needUpdateScrollView = true;
    },
    /**
     * @name GLUI.ScrollView#getScrollPosition
     * @description Retrieve the value of the <code>scrollPosition</code> property.
     * @returns {Number, Array (Number)} The current value of <code>scrollPosition</code>.
     * @see GLUI.ScrollView#setScrollPosition
     * @function
     * @status Android, Test
     */
    getScrollPosition: function ()
    {
        return this._scrollPosition;
    },
    destroy: function ($super)
    {
        this._removeAllChildren();
        this._userFrame = null;
        this._myFrame = null;
        this._contentSize = null;
        if(this._visibleArray !== null)
        {
            this._visibleArray.length = 0;
            this._visibleArray = null;
        }
        if(this._buttons !== null)
        {
            this._buttons.length = 0;
            this._buttons = null;
        }
        if(this._feeling !== null)
        {
            this._feeling.length = 0;
            this._feeling = null;
        }
        this._scrollbar.destroy();
        this._scrollbar = null;
        this._content.destroy();
        this._content = null;
        if(this._touchTarget)
        {
            this._internalGLObject.removeChild(this._touchTarget);
            this._touchTarget = null;
        }
        if(this._dragger)
        {
            this._dragger.destroy();
            this._dragger = null;
        }
        this._needUpdateScrollView = null;
        this._needEvaluateMarginalLimits = null;
        this._scrollPosition = null;
        this._momentum = null;
        this._lastClipRectFrame.length = 0;
        this._lastClipRectFrame = null;
        $super();
    },
    /** @private */
    setBackgroundColor: function ($super, color)
    {
        var isParentNode = this._parentNode;
        $super(color);
        if(!isParentNode)
        {
            this._internalGLObject.setClipRectEnabled(false);
            this._parentNode.setClipRectEnabled(true);
            this._parentNode.setClipRect(this._lastClipRectFrame);
        }
        return this;
    },
    /** @private */
    _registerSetters: function ($super)
    {
        $super();
        this._setters.contentSize = this.setContentSize.bind(this);
        this._setters.scroll = this.setOnScroll.bind(this);
        this._setters.scrollPosition = this.setScrollPosition.bind(this);
    },
    _registerGetters: function ($super)
    {
        $super();
        this._getters.contentSize = this.getContentSize.bind(this);
        this._getters.scroll = this.getOnScroll.bind(this);
        this._getters.scrollPosition = this.getScrollPosition.bind(this);
    },
    _updateScrollingView: function ()
    {
        var i;
        if(this._children)
        {
            var length = this._children.length;
            for(i = 0; i < length; i++)
            {
                var listItem = this._children[i];
                var itemIndex = this._visibleArray.indexOf(listItem);
                if(this._isInsideScreen(listItem))
                {
                    if(itemIndex === -1)
                    {
                        this._visibleArray.push(listItem);
                    }
                }
                else
                {
                    if(itemIndex !== -1)
                    {
                        this._visibleArray.splice(itemIndex, 1);
                    }
                }
            }
        }
    },
    _isInsideScreen: function (listItem)
    {
        var screenSize = this._getScreenSize();
        var screenWidth = screenSize[0];
        var screenHeight = screenSize[1];
        var frame = listItem.getFrame();
        var x = listItem.getGLObject().getPosition().getX();
        var y = listItem.getGLObject().getPosition().getY();
        var itemWidth = frame[2];
        var itemHeight = frame[3];
        var convertedPos = this._content.localToScreen(new Point(x, y));
        if(convertedPos === null || convertedPos === undefined)
        {
            return undefined;
        }
        if(this._scroll === this.ScrollDirection.Horizontal)
        {
            if((convertedPos.getX() >= 0 && convertedPos.getX() <= screenWidth) || (convertedPos.getX() < 0 && convertedPos.getX() + itemWidth > 0))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            if((convertedPos.getY() >= 0 && convertedPos.getY() <= screenHeight) || (convertedPos.getY() < 0 && convertedPos.getY() + itemHeight > 0))
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    },
    setScrollFeeling: function (feeling)
    {
        var key;
        for(key in this._feeling)
        {
            if(this._feeling.hasOwnProperty(key))
            {
                this._feeling[key] = feeling[key] || this._feeling[key];
            }
        }
    },
    setScrollDirection: function (dir)
    {
        switch(dir)
        {
        case this.ScrollDirection.Horizontal:
            this._scroll = dir;
            if(this._scrollPosition[1] > 0)
            {
                this._content.setPosition(this._scrollPosition[0], this._scrollPosition[1]);
            }
            break;
        case this.ScrollDirection.Vertical:
            this._scroll = dir;
            this._content.setPosition(this._scrollPosition[0], this._scrollPosition[1]);
            break;
        default:
            break;
        }
    },
    getScrollDirection: function ()
    {
        return this._scroll;
    },
    setScrollLock: function (lock)
    {
        this._scrollLock = lock;
    },
    getScrollLock: function ()
    {
        return this._scrollLock;
    },
    _setContentSize: function ()
    {
        if(this._contentSizeArray)
        {
            this._contentSize.setWidth(this._contentSizeArray[0]);
            this._contentSize.setHeight(this._contentSizeArray[1]);
        }
        else
        {
            this._contentSize.setHeight(0);
            this._contentSize.setWidth(0);
        }
        this._updateScrollBar();
    },
    _evaluateScrollDirection: function ()
    {
        if(!this._userFrame || !this._contentSizeArray)
        {
            return;
        }
        var w = this._userFrame[2] ? this._userFrame[2] : 1;
        var h = this._userFrame[3] ? this._userFrame[3] : 1;
        if((this._contentSizeArray[0] / w) > (this._contentSizeArray[1] / h))
        {
            this.setScrollDirection(this.ScrollDirection.Horizontal);
        }
        else
        {
            this.setScrollDirection(this.ScrollDirection.Vertical);
        }
        this._updateScrollBar();
    },
    _updateScrollBar: function ()
    {
        this._scrollbar.updateSize(this._scroll, this._myFrame, this._contentSize);
    },
    _endTap: function ()
    {
        if(this._clickCallBack)
        {
            this._clickCallBack();
        }
    },
    _applyRange: function (position, delta, lower, upper)
    {
        if(delta === 0)
        {
            return position;
        }
        if(delta > 0)
        {
            if(position < lower)
            {
                position += delta * this._feeling.rangeFactor;
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
    _getGLRoot: function ()
    {
        var child = this.getGLObject(),
            parent = null;
        while(child.getParent)
        {
            parent = child.getParent();
            if(parent)
            {
                child = parent;
            }
            else
            {
                break;
            }
        }
        return parent;
    },
    _onUpdate: function (delta)
    {
        var theRoot = null;
        var theGLRoot = null;
        if(this._needUpdateScrollView)
        {
            theRoot = this.getRoot();
            theGLRoot = this._getGLRoot();
        }
        if((theRoot && theRoot.type === "document") || (theGLRoot && theGLRoot === Root))
        {
            this._updateScrollingView();
            this._needUpdateScrollView = false;
        }
        this._clipRect();
        //addcontentsize check
        var sf = this._feeling.smoothingFactor;
        var hasTouch = this._dragger.hasTouch();
        //Our ranges are negative because we push the origin up/left from the start position.
        var h_upper = 0;
        var h_lower = this._myFrame.getSize().getWidth() - this._contentSize.getWidth();
        if(h_lower > -1)
        {
            h_lower = -1;
        }
        var v_upper = 0;
        var v_lower = this._myFrame.getSize().getHeight() - this._contentSize.getHeight();
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
                    this._scrollbar.updatePosition(this._scrollPosition);
                    this._scrollbar.updateAlpha(this._momentum);
                    return;
                }
            }
        }
        //If we have touches accumulate momentum
        if(hasTouch)
        {
            //Use exponential smoothing to approximate the current momentum
            this._momentum.x = sf * delta.x + (1 - sf) * this._momentum.x;
            this._momentum.y = sf * delta.y + (1 - sf) * this._momentum.y;
        }
        //Otherwise, consume the momentum.
        else
        {
            if(this.getOnScroll())
            {
                this._onScrollCallBack();
            }
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
        this._setFrameUI();
        this._myCurrPos = this._content.getPosition();
        this._scrollPosition = [Math.floor(-new_x), Math.floor(-new_y)];
        this._scrollbar.updatePosition(new_x, new_y);
        this._updateScrollingView();
    },
    /**
     * @private
     */
    _getScreenSize: function ()
    {
        switch(OrientationEmitter.getInterfaceOrientation())
        {
        case OrientationEmitter.Orientation.LandscapeLeft:
        case OrientationEmitter.Orientation.LandscapeRight:
            return [Capabilities.getScreenHeight(), Capabilities.getScreenWidth()];
        default:
            return [Capabilities.getScreenWidth(), Capabilities.getScreenHeight()];
        }
    },
    _clipRect: function ()
    {
        var glNode = this.getGLObject();
        var pos = glNode.localToScreen(new Vector(0, 0));
        var size = new Vector(this._frame[2], this._frame[3]);
        var adjustedSize = glNode.localToScreen(size);
        if(pos && adjustedSize)
        {
            var x = pos.getX();
            var y = pos.getY();
            var w = (adjustedSize.getX() - x);
            var h = (adjustedSize.getY() - y);
            if(x === this._lastClipRectFrame[0] && y === this._lastClipRectFrame[1] && w === this._lastClipRectFrame[2] && h === this._lastClipRectFrame[3])
            {
                return;
            }
            this._lastClipRectFrame = [x, y, w, h];
            glNode.setClipRect(this._lastClipRectFrame);
        }
    }
});