////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Harris K.
 *  @co-author: Gohar A., Taha S.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
//Only Elemenet require should be here, rest should be within their respective methods, this will decrease the global overhead of the application.
var Color = require('../../NGCore/Client/Core/Color').Color;
var Capabilities = require('../../NGCore/Client/Core/Capabilities').Capabilities;
var MessageListener = require('../../NGCore/Client/Core/MessageListener').MessageListener;
var Point = require('../../NGCore/Client/Core/Point').Point;
var Vector = require('../../NGCore/Client/Core/Vector').Vector;
var Node = require('../../NGCore/Client/GL2/Node').Node;
var TouchTarget = require('../../NGCore/Client/GL2/TouchTarget').TouchTarget;
var Element = require('./Element').Element;
var Rect = require('./ViewGeometry').Rect;
var UIRect = require('../../NGCore/Client/UI/ViewGeometry').Rect;
var Commands = require('./Commands').Commands;
var Util = require('./Util').Util;
exports.AbstractView = Element.subclass( /** @lends GLUI.AbstractView.prototype */
{
    classname: 'AbstractView',
    /**
     * @class The <code>AbstractView</code> class is a base class for derived classes that handle and manage GLUI views.<br><br>
     * <b>Caution!:</b> This base class is not exported in the GLUI module. Do not access it or subclass it at runtime.
     * Derived classes from <code>AbstractView</code> include:
     * <div class="ul">
     * <li>{@link GLUI.Button}</li>
     * <li>{@link GLUI.CellView}</li>
     * <li>{@link GLUI.CheckBox}</li>
     * <li>{@link GLUI.Image}</li>
     * <li>{@link GLUI.Label}</li>
     * <li>{@link GLUI.View}</li>
     * </div>
     * @constructs The default constructor.
     * @augments GLUI.Element
     * @param {$super} $super This parameter is a reference to the base class implementation and is stripped out during execution. Do not supply it.
     */
    initialize: function ($super)
    {
        $super();
        this._frame = [0, 0, 0, 0];
        this._target = null;
        this._anchor = null;
        this._fitMode = null;
        this._messageListener = null;
        this._clickCallBack = null;
        this._state = Commands.State.Normal;
        this._images = [];
        this._parent = null;
        this._position = null;
        this._alpha = 1.0;
        this.__bgAlpha = 1.0;
        this.__internalAlpha = 1.0;
        this.__ARGB = [];
        this._backgroundColor = null;
        this._parentNode = null;
        this._bgPrimitive = null;
        this._enabled = true;
        this._visible = true;
        this._parentEnabled = true;
        this._parentVisible = true;
        this._isPressed = false;
        this._clickable = true;
        this._isParentScrollView = false;
        this._OS = Capabilities.getPlatformOS().toLowerCase();
        this._hasMovedOutside = false;
        this._bgColorAlreadySet = false;
        this._gradient = [];
    },
    /**
     * @name GLUI.AbstractView#setAlpha
     * @function
     * @description Set the value of the <code>alpha</code> property. This property defines the level of alpha composting for a specified object when rendered.
     * @example this._node.setAlpha(1);
     * @param {Number} decimal Alpha value ranging between <code>(0.0-1.0)</code>.
     * @see GLUI.AbstractView#getAlpha
     * @type Float
     * @status Flash, Android
     */
    setAlpha: function (alphaValue)
    {
        if (isNaN(alphaValue))
        {
            throw new Error('Wrong arguments for \'alphaValue\' in setAlpha(alphaValue)');
        }
        this._alpha = alphaValue;
        this._updateAlpha();
        return this;
    },
    /**
     * @name GLUI.AbstractView#getAlpha
     * @function
     * @description Retrieve the value of the <code>alpha</code> property.
     * @returns {Number} Alpha value ranging between </code>(0.0-1.0)</code>.
     * @see GLUI.AbstractView#setAlpha
     * @type Float
     * @status Flash, Android
     */
    getAlpha: function ()
    {
        return this._alpha;
    },
    /**
     * @name GLUI.AbstractView#setFrame
     * @function
     * @description Set the value of the <code>frame</code> property. This property defines the size of <code>frame</code> objects.
     * @example var back = new GLUI.Button();
     * ...
     * back.setFrame([10, 10, 64, 64]);
     * @param {Array (Number), Rect} frame This parameter will pass in values in one of two ways:
     * <div class="ul">
     * <li>Single array containing the above four values.</li>
     * <li>A rect specifying the frame (see <code>{@link GLUI.ViewGeometry.Rect}</code>).</li>
     * </div>
     * @see UI.AbstractView#getFrame
     * @function
     */
    setFrame: function (frame)
    {
        if (frame instanceof Array)
        {
            frame = frame.slice(); //frame is okay.
        }
        else if (frame instanceof Rect || frame instanceof UIRect)
        {
            frame = frame.array();
        }
        else if (arguments && arguments.length >= 4)
        {
            frame = [arguments[0], arguments[1], arguments[2], arguments[3]];
        }
        else
        {
            throw new Error('Frame is not an array [x, y, w, h] in setFrame(frame) :: ' + this.classname);
        }
        if (frame.length < 4 || isNaN(frame[0]) || isNaN(frame[1]) || isNaN(frame[2]) || isNaN(frame[3]))
        {
            throw new Error('Length of frame is less than 4. Expected [x, y, w, h]  in setFrame(frame) in AbstractView.js');
        }
        this.__setFrame(frame);
    },
    /**
     * @private
     */
    __setFrame: function (frame)
    {
        //__setFrame method now implements the FRAME, and $super hierarchy should be followed upto AbstractView.
        //setFrame only splits the supplied arguments.
        this._frame = frame;
        this._position = [frame[0], frame[1]];
        this.getGLObject().setPosition(this._frame[0], this._frame[1]);
        if (this._backgroundColor)
        {
            this.__fillBackgroundColor();
        }
        if (this._target && this._target !== 1)
        {
            this.__setTouchableArea();
        }
    },
    /**
     * @name GLUI.AbstractView#getFrame
     * @description Retrieve the value of the <code>frame</code> property.
     * @returns {Array} An array of [x, y, w, h] for the frame of the object.
     * @see GLUI.AbstractView#setFrame
     * @function
     */
    getFrame: function ()
    {
        if (this._frame === null || this._frame === undefined)
        {
            return undefined;
        }
        else
        {
            return [this._frame[0], this._frame[1], this._frame[2], this._frame[3]];
        }
    },
    /**
     * @name GLUI.AbstractView#setOnClick
     * @description Set a function to call when the <code>click</code> event occurs. Do not use object.onClick = function() as that will not set up touch target for GLUI object.
     * @param {Function} clickCallback The new callback function. <br><br><b>Note:</b> The <code>click</code> callback is set to empty if the value of this parameter is not a function.
     * @example button.setOnClick(function() { console.log(this.classname + "is clicked");});
     * @see GLUI.AbstractView#event:getOnClick
     * @event
     */
    setOnClick: function (clickCallback)
    {
        if (typeof (clickCallback) !== "function")
        {
            if (clickCallback === "undefined" || clickCallback === null)
            {
                clickCallback = function ()
                {};
            }
            else
            {
                throw new Error(this.classname + " setOnClick expects (), (null), (function) but received " + clickCallback.type);
            }
        }
        this._clickCallBack = clickCallback;
        if (this._frame && !this._target)
        {
            this._setUpTouchTarget();
        }
    },
    /**
     * @name GLUI.AbstractView#getOnClick
     * @description Retrieve a function to call when the <code>click</code> event occurs.
     * @returns {Function} The current callback function.
     * @see GLUI.AbstractView#event:setOnClick
     * @event
     */
    getOnClick: function ()
    {
        return this._clickCallBack;
    },
    /**
     * Set view state.
     * @function
     * @example this.addState(GLUI.Commands.State.Disabled);
     * @param {GLUI.State} flags View state flags supported by the new view state.
     * @see GLUI.AbstractView#getState,
     * @see GLUI.AbstractView#setState,
     * @see GLUI.AbstractView#clearState
     */
    setState: function (flags)
    {
        this._state = flags;
        this._updateView();
    },
    /**
     * Get view state.
     * @function
     * @example this.addState(GLUI.Commands.State.Disabled);
     * @param {GLUI.State} flags View state flags supported by the new view state.
     * @see GLUI.AbstractView#getState,
     * @see GLUI.AbstractView#setState,
     * @see GLUI.AbstractView#clearState
     */
    getState: function ()
    {
        return this._state;
    },
    /**
     * Add a new view state.
     * @function
     * @example this.addState(GLUI.Commands.State.Disabled);
     * @param {GLUI.State} flags View state flags supported by the new view state.
     * @see GLUI.AbstractView#getState,
     * @see GLUI.AbstractView#setState,
     * @see GLUI.AbstractView#clearState
     */
    addState: function (flags)
    {
        this.setState(this._state | flags);
    },
    /**
     * Clear the view state and set view state flags to the default value.
     * @function
     * @example this.clearState(GLUI.Commands.State.Disabled);
     * @param {GLUI.State} flags
     * @see GLUI.AbstractView#getState,
     * @see GLUI.AbstractView#setState,
     * @see GLUI.AbstractView#addState
     */
    clearState: function (flags)
    {
        this.setState(this._state & ~flags);
    },
    /**
     * @name GLUI.AbstractView#setVisible
     * @description Set the visibility for this object.
     * @example SomeView = new GLUI.View();
     * ...
     * SomeView.setVisible(false);
     * @function
     * @param {boolean} <code>true</code> if this object is visible, <code>false</code> otherwise.
     * @see GLUI.AbstractView#getVisible
     */
    setVisible: function (boolValue)
    {
        if ((boolValue === true) || (boolValue === false))
        {
            this._visible = boolValue;
            this.getGLObject().setVisible(boolValue);
            this._setVisible(this._visible, true);
        }
        else
        {
            throw new Error('Expecting boolean value but found ' + typeof (boolValue) + ' for setVisible(boolValue)');
        }
    },
    /**
     * @name GLUI.AbstractView#getVisible
     * @description Retrieve the state of visibility for this object.
     * @function
     * @returns {boolean} Returns <code>true</code> if this object is visible.
     * @see GLUI.AbstractView#setVisible
     */
    getVisible: function ()
    {
        return this.getGLObject().getVisible();
    },
    /**
     * @name GLUI.AbstractView#setEnabled
     * @description Set the value for the <code>enabled</code> property. This property defines an object as active or inactive.
     * <br /><b>Note:</b> Object [state] is also set to GLUI.Commands.State.Disabled if setEnabled(false) is called. And cleared if setEnabled(true) is called.
     * @param {Boolean} enabled Set as <code>true</code> if this view state is enabled.
     * @see GLUI.AbstractView#getEnabled
     * @function
     */
    setEnabled: function (enabled)
    {
        if ((enabled === true) || (enabled === false))
        {
            this._enabled = enabled;
            if (enabled)
            {
                this.clearState(Commands.State.Disabled);
            }
            else
            {
                this.addState(Commands.State.Disabled);
            }
            this._setEnabled(this._enabled, true);
        }
        else
        {
            throw new Error('Expecting boolean value but found ' + typeof (enabled) + ' for setEnabled(enabled)');
        }
        return this;
    },
    /**
     * @name GLUI.AbstractView#getEnabled
     * @description Retrieve the value of the <code>enabled</code> property.
     * @returns {Boolean} Returns <code>true</code> if this view state is enabled.
     * @see GLUI.AbstractView#setEnabled
     * @function
     */
    getEnabled: function ()
    {
        return this._enabled;
    },
    /**
     * @name GLUI.AbstractView#setBackgroundColor
     * @description Set the value for the <code>backgroundColor</code> property. This property defines the color of the background for an object when rendered.
     * @example SomeView = new GLUI.View();
     * ...
     * SomeView.setBackgroundColor("FF000000");
     * @param {String} backgroundColor The new background color.
     * @see UI.AbstractView#getBackgroundColor
     * @type Color
     * @function
     */
    setBackgroundColor: function (color)
    {
        var container = this._internalGLObject.getParent();
        if (!this._parentNode)
        {
            this._parentNode = new Node();
        }
        if (!this._backgroundColor && container)
        {
            container.removeChild(this._internalGLObject);
            container.addChild(this._parentNode);
        }
        this.__ARGB = Util.hexToARGB(color);
        this._backgroundColor = color;
        if (!this._bgPrimitive)
        {
            this._bgColorAlreadySet = false;
            this._bgPrimitive = new Util.Rectangle();
        }
        if (!this._frame)
        {
            this._frame = [0, 0, 0, 0];
        }
        this.__fillBackgroundColor();
        this._updateAlpha();
        this.getGLObject().setVisible(this._visible);
        this._internalGLObject.setVisible(true);
        this.getGLObject().setVisible(this._visible);
        return this;
    },
    /**
     * @name GLUI.AbstractView#getBackgroundColor
     * @description Retrieve the value of the <code>backgroundColor</code> property.
     * @returns {String} The current background color.
     * @see GLUI.AbstractView#setBackgroundColor
     * @function
     */
    getBackgroundColor: function ()
    {
        return this._backgroundColor;
    },
    /**
     * @name GLUI.AbstractView#setGradient
     * @description Set the value of the <code>background</code> property using the first set of colors.
     * @example label.setGradient({
     *  gradient: ['FFFF8000 0.0', 'FF703300 1.0']
     * }, UI.State.Selected);
     * [corners] and [gradient] are not fully supported for GLUI elements. A plain background will be applied.
     * <br /><b>Note: </b> This property will tamper with the backgound property, as gradients are not supported in GLUI.
     * @param {Object} gradient The new gradient.
     * @param {GLUI.State} [flags=GLUI.State.Normal] The GLUI view state.
     * @see GLUI.AbstractView#getGradient
     * @function
     */
    setGradient: function (flags, state)
    {
        if (state === undefined)
        {
            state = Commands.State.Normal;
        }
        this._gradient[state + ''] = flags;
        this._updateView();
    },
    /**
     * @name GLUI.AbstractView#getGradient
     * @description Retrieve the value of the <code>gradient</code> property for a view state.
     * gradient is supported as a plain color background.
     * @param {GLUI.State} [flags=GLUI.State.Normal] The GLUI view state.
     * @returns {Object} The current gradient.
     * @see GLUI.AbstractView#setGradient
     * @function
     */
    getGradient: function (state)
    {
        if (state === undefined)
        {
            state = Commands.State.Normal;
        }
        return this._gradient[state];
    },
    /**
     * Add a node at the specified index to the specified parent node.
     * @example var myParent = new GLUI.View({
     *  ...
     * });
     * var childNode = new GLUI.View({
     *  ...
     * });
     * ...
     * childNode.addToParent(myParent);
     * @function
     * @param {Object} parentNode The parent node.
     * @param {Number} [index] The parent node index location. Index reflects the depth (z-index) of a node in that view.
     * @see GLUI.AbstractView#getParent,
     * @see GLUI.AbstractView#removeFromParent
     */
    addToParent: function (parentNode, index)
    {
        parentNode.addChild(this, index);
        this._parent = parentNode;
    },
    /**
     * Remove a node from the parent node.
     * @example childNode.removeFromParent(myParent);
     * @function
     * @returns {Element} This function returns <code>this</code> to support method invocation chaining.
     * @see GLUI.AbstractView#getParent,
     * @see GLUI.AbstractView#addToParent
     */
    removeFromParent: function ()
    {
        if (this._parent && this._parent.removeChild && this._parent instanceof Element)
        {
            this._parent.removeChild(this);
            this._parent = null;
        }
        return this;
    },
    /**
     * @function
     * @description Retrieve the parent node for this view.
     * @returns Returns the parent if this view is a child of another element. Otherwise, returns undefined.
     * @see GLUI.AbstractView#addToParent,
     * @see GLUI.AbstractView#removeFromParent
     */
    getParent: function ()
    {
        return this._parent;
    },
    /**
     * Retrieve the root node for this object.
     * @function
     * @returns Returns the root node if this is a child node. Otherwise, returns undefined.
     */
    getRoot: function ()
    {
        var retParent;
        var child = this;
        while (child._parent)
        {
            retParent = child._parent;
            child = child._parent;
        }
        return retParent;
    },
    /**
     * @function
     * @description Swallow touches, and will not let the touches to pass below the node. Useful for implementing Alert Dialogs. Works similar to setBlockTouchEvents, internal implementation is different from UI.setBlockTouchEvents.
     * @returns This function returns <code>this</code> to support method invocation chaining.
     */
    swallowTouches: function (booleanValue)
    {
        if (booleanValue === true || booleanValue === undefined || booleanValue === null)
        {
            if (!this._clickCallBack)
            {
                this.setOnClick(function ()
                {});
            }
            else
            {
                this._setUpTouchTarget();
            }
        }
        else
        {
            if (this._target instanceof TouchTarget)
            {
                this._target.destroy();
                this._target = null;
            }
        }
        return this;
    },
    destroy: function ($super)
    {
        if (this._parent)
        {
            this.removeFromParent();
            this._parent = null;
        }
        if (this._target && this._target !== 1)
        {
            this._target.destroy();
        }
        this._target = null;
        if (this._messageListener)
        {
            this._messageListener.destroy();
            this._messageListener = null;
        }
        if (this._bgPrimitive)
        {
            this._bgPrimitive.destroy();
            this._bgPrimitive = null;
        }
        if (this._parentNode)
        {
            this._parentNode.destroy();
            this._parentNode = null;
        }
        this._clickCallBack = null;
        this._alpha = null;
        this.__bgAlpha = null;
        this.__internalAlpha = null;
        this._frame = null;
        this._hasMovedOutside = null;
        this._anchor = null;
        this._fitMode = null;
        this._clickCallBack = null;
        this._state = null;
        if (this._images)
        {
            this._images.length = 0;
            this._images = null;
        }
        this._position = null;
        this._alpha = null;
        this.__bgAlpha = null;
        this.__internalAlpha = null;
        if (this.__ARGB)
        {
            this.__ARGB.length = 0;
            this.__ARGB = null;
        }
        this._enabled = null;
        this._parentEnabled = null;
        this._parentVisible = null;
        this._isPressed = null;
        this._isParentScrollView = null;
        this._OS = null;
        this._bgColorAlreadySet = null;
        this._backgroundColor = null;
        this._visible = null;
        this._clickable = null;
        $super();
    },
    /** @private */
    _updateView: function ()
    {
        //override this in the derived classes.
        var gradient = this._gradient[this._state];
        if (typeof gradient === 'object' && gradient.gradient instanceof Array)
        {
            var spc = gradient.gradient[0].indexOf(" ");
            if (spc > 0)
            {
                var color = gradient.gradient[0].substring(0, spc);
                this.setBackgroundColor(color);
            }
        }
    },
    _setUpTouchTarget: function ()
    {
        if (this._frame)
        {
            if (this._messageListener)
            {
                this._messageListener.destroy();
            }
            this._messageListener = new MessageListener();
            if (!this._target)
            {
                this._target = new TouchTarget();
            }
            this.__setTouchableArea();
            this._target.getTouchEmitter().addListener(this._messageListener, this._touchReceivedCallBack.bind(this));
            if (!this._backgroundColor)
            {
                var color = "00000000"; //transparent color
                this.setBackgroundColor(color); //this will create a parentNode with transparent area if no bg color is provided
            }
            this.getGLObject().addChild(this._target);
        }
    },
    __setTouchableArea: function ()
    {
        this._target.setAnchor(0, 0);
        this._target.setSize(this._frame[2], this._frame[3]);
        this._target.setPosition(0, 0);
        this._target.setDepth(-2);
    },
    _giveTouchesToChildren: function (touch, array)
    {
        var i = 0;
        if (array && array.length > 0)
        {
            for (i = array.length - 1; i >= 0; i--)
            {
                if (array[i]._isTouchInFrame(touch) && array[i]._enabled && array[i]._visible && array[i]._clickable)
                {
                    var retInstance = array[i]._touchReceivedCallBack(touch, true);
                    if (retInstance)
                    {
                        return retInstance;
                    }
                }
            }
        }
        return null;
    },
    _isTouchInFrame: function (touch)
    {
        if (!this._frame)
        {
            return false;
        }
        var position = touch.getPosition();
        var x = position.getX();
        var y = position.getY();
        var objStartPosition = this.getGLObject().localToScreen(new Vector(0, 0));
        var objMaxPosition = this.getGLObject().localToScreen(new Vector(this._frame[2], this._frame[3]));
        var xmin = objStartPosition.getX();
        var xmax = objMaxPosition.getX();
        var ymin = objStartPosition.getY();
        var ymax = objMaxPosition.getY();
        if (y >= ymin && y < ymax && x >= xmin && x < xmax)
        {
            return true;
        }
        else
        {
            return false;
        }
    },
    _touchReceivedCallBack: function (touch, isDelegating)
    {
        if ((touch.getId() !== 1 && this._OS === "android"))
        {
            if (isDelegating)
            {
                return null;
            }
            return true;
        }
        if (isDelegating === undefined || isDelegating === null)
        {
            isDelegating = false;
        }
        else if (isDelegating && this._children && this._children.length > 0)
        {
            var retInstance = this._giveTouchesToChildren(touch, this._children);
            if (retInstance)
            {
                return retInstance;
            }
        }
        switch (touch.getAction())
        {
            case touch.Action.Start:
                if (this._clickCallBack && this._isTouchInFrame(touch) && this._enabled && this._visible && this._parentEnabled && this._parentVisible && !(this.getState() & Commands.State.Disabled) && this._clickable)
                {
                    if (this.getState() & Commands.State.Pressed)
                    {
                        this._isPressed = true;
                    }
                    this.addState(Commands.State.Pressed);
                    this._hasMovedOutside = false;
                    if (isDelegating)
                    {
                        return this;
                    }
                    return true;
                }
                else
                {
                    return false;
                }
            case touch.Action.End:
                if (!this._isPressed)
                {
                    this.clearState(Commands.State.Pressed);
                }
                if (this._isTouchInFrame(touch) && this._enabled && this._visible && this._parentEnabled && this._parentVisible && !(this.getState() & Commands.State.Disabled) && !this._hasMovedOutside)
                {
                    this._click();
                    if (this._endTap)
                    {
                        this._endTap();
                    }
                }
                this._isPressed = false;
                this._hasMovedOutside = false;
                break;
            case touch.Action.Move:
                if (isDelegating) //here lower sensitivity of press
                {
                    if (!this._isPressed)
                    {
                        this.clearState(Commands.State.Pressed);
                    }
                    this._pressed = false;
                    this._hasMovedOutside = false;
                    return true;
                }
                else if (!this._isTouchInFrame(touch))
                {
                    this._hasMovedOutside = true;
                    if (!this._isPressed)
                    {
                        this.clearState(Commands.State.Pressed);
                    }
                }
                break;
            }
            return false;
    },
    _click: function ()
    {
        if (this._clickCallBack)
        {
            this._clickCallBack();
        }
    },
    _setClickable: function (clickable)
    {
        this._clickable = clickable;
    },
    _getClickable: function ()
    {
        return this._clickable;
    },
    _setVisible: function (visible, isSelf)
    {
        var i;
        if (this._children)
        {
            for (i = 0; i < this._children.length; i++)
            {
                this._children[i]._setVisible(visible, false);
            }
        }
        if (!isSelf)
        {
            this._parentVisible = visible;
        }
    },
    _setEnabled: function (enabled, isSelf)
    {
        if (this._children)
        {
            var i = 0;
            for (i = 0; i < this._children.length; i++)
            {
                this._children[i]._setEnabled(enabled, false);
            }
        }
        if (!isSelf)
        {
            this._parentEnabled = enabled;
        }
    },
    __fillBackgroundColor: function ()
    {
        this._bgPrimitive.setFrame([0, 0, this._frame[2], this._frame[3]]);
        this._bgPrimitive.setDepth(-1);
        this._parentNode.setPosition(this._frame[0], this._frame[1]);
        this.__bgAlpha = this.__ARGB[0];
        this._bgPrimitive.setColor(new Color(this.__ARGB[1], this.__ARGB[2], this.__ARGB[3]));
        if (!this._bgColorAlreadySet)
        {
            var parentPosition = this._parentNode.getPosition();
            var internalPosition = this._internalGLObject.getPosition();
            this._internalGLObject.setPosition(internalPosition.getX() - parentPosition.getX(), internalPosition.getY() - parentPosition.getY());
            this._internalGLObject.setDepth(0);
            this._parentNode.addChild(this._bgPrimitive);
            this._parentNode.addChild(this._internalGLObject);
            this._bgColorAlreadySet = true;
        }
        if (this._updateDepth)
        {
            this._updateDepth();
        }
    },
    _updateAlpha: function ()
    {
        var internalValue = 0;
        var bgValue = 0;
        internalValue = this.__internalAlpha * this._alpha;
        this._internalGLObject.setAlpha(internalValue);
        if (this._parentNode)
        {
            bgValue = this.__bgAlpha * this._alpha;
            this._bgPrimitive.setAlpha(bgValue);
        }
    },
    _endTap: function ()
    {
        //override in child classes;
    },
    _getInternalGLObjectPosition: function ()
    {
        var parentPosX = 0;
        var parentPosY = 0;
        if (this._parentNode)
        {
            var parentPosition = this._parentNode.getPosition();
            parentPosX = parentPosition.getX();
            parentPosY = parentPosition.getY();
        }
        //var internalPosition = this._internalGLObject.getPosition();
        var posX = -parentPosX;
        var posY = -parentPosY;
        posX += this._frame[0] + (this._frame[2] * this._anchor[0]);
        posY += this._frame[1] + (this._frame[3] * this._anchor[1]);
        return new Point(posX, posY);
    },
    /** @private */
    _registerSetters: function ($super)
    {
        $super();
        this._setters['alpha'] = this._setAlphaProperty;
        this._setters['frame'] = this._setFrameProperty;
        this._setters['onClick'] = this._setOnClickProperty;
        this._setters['visible'] = this._setVisibleProperty;
        this._setters['enabled'] = this._setEnabledProperty;
        this._setters['backgroundColor'] = this._setBackgroundColorProperty;
        this._setters['state'] = this._setStateProperty;
        this._setters['gradient'] = this._setGradientProperty;
    },
    /** @private */
    _registerGetters: function ($super)
    {
        $super();
        this._getters['alpha'] = this._getAlphaProperty;
        this._getters['frame'] = this._getFrameProperty;
        this._getters['onClick'] = this._getOnClickProperty;
        this._getters['visible'] = this._getVisibleProperty;
        this._getters['enabled'] = this._getEnabledProperty;
        this._getters['backgroundColor'] = this._getBackgroundColorProperty;
        this._getters['state'] = this._getStateProperty;
        this._getters['gradient'] = this._getGradientProperty;
    },
    /** @private */
    __setTouchableFalse: function ()
    {
        var i = 0;
        if (this._parentNode)
        {
            this._parentNode.setTouchable(false);
        }
        if (this._internalGLObject)
        {
            this._internalGLObject.setTouchable(false);
        }
        this._isParentScrollView = true;
        if (this._children)
        {
            for (i = 0; i < this._children.length; i++)
            {
                this._children[i].__setTouchableFalse();
            }
        }
    },
    /** @private */
    __setTouchableTrue: function ()
    {
        var i = 0;
        if (this._parentNode)
        {
            this._parentNode.setTouchable(true);
        }
        if (this._internalGLObject)
        {
            this._internalGLObject.setTouchable(true);
        }
        this._isParentScrollView = false;
        if (this._children)
        {
            for (i = 0; i < this._children.length; i++)
            {
                this._children[i].__setTouchableTrue();
            }
        }
    },
    /** @private Property accessors*/
    _setAlphaProperty: function (callee, args)
    {
       return callee.setAlpha(args);
    },
    _setFrameProperty: function (callee, args)
    {
       return callee.setFrame(args);
    },
    _setOnClickProperty: function (callee, args)
    {
       return callee.setOnClick(args);
    },
    _setVisibleProperty: function (callee, args)
    {
       return callee.setVisible(args);
    },
    _setEnabledProperty: function (callee, args)
    {
       return callee.setEnabled(args);
    },
    _setBackgroundColorProperty: function (callee, args)
    {
       return callee.setBackgroundColor(args);
    },
    _setStateProperty: function (callee, args)
    {
       return callee.setState(args);
    },
    _setGradientProperty: function (callee, args)
    {
       return callee.setGradient(args);
    },
    _getAlphaProperty: function (callee, args)
    {
       return callee.getAlpha(args);
    },
    _getFrameProperty: function (callee, args)
    {
       return callee.getFrame(args);
    },
    _getOnClickProperty: function (callee, args)
    {
       return callee.getOnClick(args);
    },
    _getVisibleProperty: function (callee, args)
    {
       return callee.getVisible(args);
    },
    _getEnabledProperty: function (callee, args)
    {
       return callee.getEnabled(args);
    },
    _getBackgroundColorProperty: function (callee, args)
    {
       return callee.getBackgroundColor(args);
    },
    _getStateProperty: function (callee, args)
    {
       return callee.getState(args);
    },
    _getGradientProperty: function (callee, args)
    {
       return callee.getGradient(args);
    },
    /////////////// Empty Functions /////////////////
    /**
     * @name GLUI.AbstractView#getOnAppear
     * @description Retrieve the function to call when the <code>appear</code> event occurs.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {Function} The current callback function.
     * @see GLUI.AbstractView#event:setOnAppear
     * @event
     * @status Android, Flash, Test
     */
    getOnAppear: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getOnAppear() in ' + this.classname);
    },
    /**
     * @name GLUI.AbstractView#getOnDisappear
     * @description Retrieve the function to call when the <code>disappear</code> event occurs.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {Function} The current callback function.
     * @see GLUI.AbstractView#event:setOnDisappear
     * @event
     * @status Android, Flash, Test
     */
    getOnDisappear: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getOnDisappear() ' + this.classname);
    },
    /**
     * @name GLUI.AbstractView#getOnLongPress
     * @description Retrieve the function to call when a <code>tap and hold</code> event occurs.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {Function} The current callback function.
     * @see GLUI.AbstractView#event:setOnLongPress
     * @event
     * @status Android, Flash, Test
     */
    getOnLongPress: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getOnLongPress() ' + this.classname);
    },
    /**
     * @name GLUI.AbstractView#getOnSwipe
     * @description Retrieve the function to call when the <code>swipe</code> event occurs.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {Function} The current callback function.
     * @see GLUI.AbstractView#event:setOnSwipe
     * @event
     * @status Android, Flash, Test
     */
    getOnSwipe: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getOnSwipe() ' + this.classname);
    },
    /**
     * @name GLUI.AbstractView#setOnAppear
     * @description Set a function to call when the <code>appear</code> event occurs.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {Function} appearCallback The new callback function. <br><br><b>Note:</b> The <code>appear</code> event is disabled if the value of this parameter is not a function.
     * @example function() { onAppear.appear = true; };
     * @see GLUI.AbstractView#event:getOnAppear
     * @event
     * @status Android, Flash, Test
     */
    setOnAppear: function (appearCallback)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setOnAppear(appearCallback) ' + this.classname);
    },
    /**
     * @name GLUI.AbstractView#setOnDisappear
     * @description Set a function to call when the <code>disappear</code> event occurs.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {Function} disappearCallback The new callback function. <br><br><b>Note:</b> The <code>disappear</code> event is disabled if the value of this parameter is not a function.
     * @example function() { onDisappear.disappear = true; };
     * @see GLUI.AbstractView#event:getOnDisappear
     * @event
     * @status Android, Flash, Test
     */
    setOnDisappear: function (disappearCallback)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setOnDisappear(disappearCallback) ' + this.classname);
    },
    /**
     * @name GLUI.AbstractView#setOnLongPress
     * @description Set a function to call when a user taps and holds on a view.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {Function} clickCallback The new callback function. <br><br><b>Note:</b> The event is disabled if the value of this parameter is not a function.
     * @example function() { onLongPress.longpress = true; };
     * @see GLUI.AbstractView#event:getOnLongPress
     * @event
     * @status Android, Flash, Test
     */
    setOnLongPress: function (clickCallback)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setOnLongPress(clickCallback) ' + this.classname);
    },
    /**
     * @name GLUI.AbstractView#setOnSwipe
     * @description Set a function to call when a swipe event occurs. This is when the user swipes a finger across this view, like how you indicate a "delete row" request on a table view. The function gets the GLUI.Commands.SwipeDirection from the first parameter.direction.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {Function} clickCallback The new callback function. <br><br><b>Note:</b> The <code>swipe</code> event is disabled if the value of this parameter is not a function.
     * @example view.setOnSwipe( function(params) { NgLogD("swipe code "+params.direction); });
     * @see GLUI.AbstractView#event:getOnSwipe
     * @event
     * @status Android, Flash, Test
     */
    setOnSwipe: function (clickCallback)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setOnSwipe(clickCallback) ' + this.classname);
    },
    /**
     * @name GLUI.AbstractView#getBlockTouchEvents
     * @description Retrieve the value of the <code>blockTouchEvents</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {Object} The current value of <code>blockTouchEvents.</code>
     * @see GLUI.AbstractView#setBlockTouchEvents
     * @function
     * @status Android, Flash, Test
     */
    getBlockTouchEvents: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getBlockTouchEvents() ' + this.classname);
    },
    /**
     * @name GLUI.AbstractView#setBlockTouchEvents
     * @description Set the value of the <code>blockTouchEvents</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {Object} blockTouchEvents The new value for <code>blockTouchEvents.</code>
     * @see GLUI.AbstractView#getBlockTouchEvents
     * @function
     * @status Android, Flash, Test
     */
    setBlockTouchEvents: function (blockTouchEvents)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation:  setBlockTouchEvents(blockTouchEvents) ' + this.classname);
    },
    get onclick()
    {
        //enables property get mode :  var a = object.onclick;
        return this.getOnClick();
    },
    set onclick(value)
    {
        //enables property set mode : object.onclick = function() {};
        this.setOnClick(value);
    }
});
