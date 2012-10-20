////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Shamas S, Harris K
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
var Node = require('../../NGCore/Client/GL2/Node').Node;
var Point = require('../../NGCore/Client/Core/Point').Point;
var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;
var Image = require('./Image').Image;
////////////        UI Components       //////////////
var EditText = require('../../NGCore/Client/UI/EditText').EditText;
var EditTextArea = require('../../NGCore/Client/UI/EditTextArea').EditTextArea;
var WebView = require('../../NGCore/Client/UI/WebView').WebView;
var MapView = require('../../NGCore/Client/UI/MapView').MapView;
var UIWindow = require('../../NGCore/Client/UI/Window').Window;
exports.View = AbstractView.subclass( /** @lends GLUI.View.prototype */
{
    type: 'View',
    classname: 'View',
    /**  
     * @class The <code>View</code> class is a base class for derived classes that handle application views. Derived classes from <code>View</code> include:
     * <div class="ul">
     * <li>{@link GLUI.ScrollView}</li>
     * <li>{@link GLUI.Button}</li>
     * <li>{@link GLUI.CellView}</li>
     * </div>
     * @constructs The default constructor. 
     * @param {$super} $super This parameter is a reference to the base class implementation and is stripped out during execution. Do not supply it.
     * @param {String} properties Object properties.
     * @augments GLUI.AbstractView
     */
    initialize: function ($super, properties)
    {
        $super();
        this._children = [];
        this._uiChildren = [];
        this._internalGLObject = new Node();
        this._sprite = null;
        this._imageURL = null;
        this._imageObject = null;
        this._isAddedToParent = false;
        this._hasUIChildren = false;
        if(properties)
        {
            this.setAttributes(properties);
        }
        return this;
    },
    /**
     * Add a child node to this <code>View</code> at the specified index.
     * Index is treated as Depth (z-index) of the child too.
     * @example var mainView = new UI.View();
     * ...
     * var errorView = new UI.View();
     * ...
     * mainView.addChild(errorView);
     * @param {GLUI.AbstractView | UI.EditText | UI.EditTextArea | UI.MapView | UI.WebView } childNode The child which should be a derived class of GLUI.AbstractView | UI.EditText | UI.EditTextArea | UI.MapView | UI.WebView to add.
     * @param {Number} index The specified index.
     * @throws {"message:" + this.type + ".addChild: " + childNode + " is not a view!"} Specified child is not an instance of GLUI.AbstractView | UI.EditText | UI.EditTextArea | UI.MapView | UI.WebView.
     * @returns This function returns <code>this</code> to support method invocation chaining.
     * @see GLUI.View#removeChild
     * @status Android, Test
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
            this._internalGLObject.addChild(childNode.getGLObject());
            this._updateDepth();
            this._updateUIChildrenState(true, childNode);
            var Button = require('./Button').Button;
            var WindowLayer = require('./WindowLayer').WindowLayer;
            if(this.getRoot() instanceof WindowLayer)
            {
                childNode._callAppearanceEvent(false);
            }
            if(childNode instanceof exports.View && !(childNode instanceof Button) && this._isAddedToParent)
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
                if(this._isAddedToParent)
                {
                    UIWindow.document.addChild(childNode);
                }
                this._addSettersGettersForUIComponents(childNode);
            }
        }
        else
        {
            var errorMsg = [];
            errorMsg.push("message:");
            errorMsg.push(this.type);
            errorMsg.push(".addChild: ");
            errorMsg.push(childNode);
            errorMsg.push(" is not a view!");
            throw new Error(errorMsg.join());
        }
        return this;
    },
    /**
     * Remove a child from this <code>View</code>.
     * @example mainView.removeChild(errorView);
     * @param {GLUI.AbstractView | UI.EditText | UI.EditTextArea | UI.MapView | UI.WebView} childNode The child node to remove.
     * @throws {"message:" + this.type + ".addChild: " + childNode + " is not a view!"} Specified child is not an instance of GLUI.AbstractView | UI.EditText | UI.EditTextArea | UI.MapView | UI.WebView.
     * @returns The child node that was removed.
     * @see GLUI.View#addChild
     * @status Android, Test
     */
    removeChild: function (childNode)
    {
        var nodeIndex;
        if(childNode instanceof AbstractView)
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
            this._internalGLObject.removeChild(childNode.getGLObject());
            childNode._parent = null;
            childNode._setEnabled(true, false);
            childNode._setVisible(true, false);
            childNode._setTouchable(true, false);
            this._updateDepth();
            var Button = require('./Button').Button;
            if(childNode instanceof exports.View && !(childNode instanceof Button) && this._isAddedToParent)
            {
                childNode._removedFromParent();
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
            var errorMsg = [];
            errorMsg.push("message:");
            errorMsg.push(this.type);
            errorMsg.push(".addChild: ");
            errorMsg.push(childNode);
            errorMsg.push(" is not a view!");
            throw new Error(errorMsg.join());
        }
        return childNode;
    },
    /**
     * Retrieve a count of the child nodes attached to this <code>View</code>.
     * @return {Number} The current number of child nodes.
     * @status Android, Flash
     */
    getChildCount: function ()
    {
        var length = 0;
        if(this._children)
        {
            length = this._children.length;
        }
        if(this._uiChildren)
        {
            length = (length + this._uiChildren.length);
        }
        return length;
    },
    /**
     * @function
     * @return {Array} A copy of array containing children (sub-views) of a View.
     */
    getChildren: function ()
    {
        var childrenArray = [];
        if(this._children)
        {
            childrenArray = this._children.slice(); //using slice, it is returning the copy instead of original reference
        }
        if(this._uiChildren)
        {
            childrenArray = childrenArray.concat(this._uiChildren.slice());
        }
        return childrenArray;
    },
    /**
     * @name GLUI.View#setImage
     * @description Set an image URL for a view state. This property defines a remote image resource to use in arbitrary contexts.
     * <br /><b>Note: </b> Images must be in powers of two and/or mentioned under <code>"textures":</code> key in manifests.
     * <br />URL is also supported, and the image will be converted to power of two.
     * <br />Local image auto conversion will be supported later.
     * @example var someSprite = new GLUI.View();        
     * someSprite.setImage('./Content/mySprite.png', GLUI.State.Normal, [w, h], UVS );
     * someSprite.setImage('http://www.example.com/somepicture80x92.png', GLUI.State.Normal, [200, 110], [0, 0, 0.5, 0.5]);
     * @see GLUI.View#getImage
     * @param {String} imageURL The new image URL.
     * @param {GLUI.State} [flags=GLUI.State.Normal] A set of flags describing the view state(s) for using this URL.
     * @param {Array} imageSize an array for the size of image. [w, h]
     * @param {Array} [uvs=[0, 0, 1, 1]] The region within the image to display. Specified in UV
	 *		coordinates ranging from 0 to 1, which represent a percentage of the original image's 
	 *		width and height. The four coordinates represent the U origin, the V origin, the U 
	 *		width, and the V height, in that order. By default, the entire image is displayed.
     * @status iOS, Android, Test
     * @function 
     */
    setImage: function (imageURL, flags, imageSize, uvs)
    {
        if(!this._imageObject)
        {
            this._imageObject = new Image();
            this._internalGLObject.addChild(this._imageObject.getGLObject());
            this._imageObject.getGLObject().setDepth(0);
            this._imageObject._setClickable(false);
        }
        this._adjustFrameForBgImage();
        this._imageObject.setImage(imageURL, flags, imageSize, uvs);
    },
    /**
     * @name GLUI.View#getImage
     * @description Retrieve the <code>image</code> URL for a view state.
     * @param {GLUI.State} [flags=GLUI.State.Normal] The GLUI view state.
     * @returns {String} The current image URL for the specified view state.
     * @see GLUI.View#setImage
     * @status Android, Flash, Test
     * @function
     */
    getImage: function (flags)
    {
        if(this._imageObject)
        {
            var val = this._imageObject.getImage(flags);
            return val;
        }
        else
        {
            return undefined;
        }
    },
    /**
     * @name GLUI.View#setImageFit
     * @description Set the value of the <code>imageFit</code> property. This property defines the scaling of bitmap images to fit within the bounds of a control 
     * @example var someSprite = new GLUI.View();
     * ...
     * someSprite.setImageFit(GLUI.FitMode.None);
     * @param {Number} imageFit The new value for <code>imageFit</code>.
     * @see GLUI.View#getImageFit
     * @function
     */
    setImageFit: function (fitMode)
    {
        if(this._imageObject)
        {
            this._imageObject.setImageFit(fitMode);
        }
    },
    /**
     * @name GLUI.View#getImageFit
     * @description Retrieve the value of the <code>imageFit</code> property.
     * @returns {Number} The current value of <code>imageFit</code>.
     * @see GLUI.View#setImageFit
     * @function
     * @status 
     */
    getImageFit: function ()
    {
        if(this._imageObject)
        {
            return this._imageObject.getImageFit();
        }
        return Commands.FitMode.Inside;
    },
    /**
     * @name GLUI.View#setImageGravity
     * @description Set the value of the <code>imageGravity</code> property. This property defines how an image is positioned within a viewable area.
     * @example var someSprite = new GLUI.View();
     * ...
     * someSprite.setImageGravity([0.5, 0.0]);
     * @param {Number} imageGravity The new value for <code>imageGravity</code> (expressed as two floats). Currently clipping is not supported for values greater than 1.0 or less than 0.0
     * @see GLUI.View#getImageGravity
     * @function
     * @status iOS, Android, Test
     */
    setImageGravity: function (imageGravity)
    {
        if(arguments)
        {
            if(arguments.length >= 2)
            {
                imageGravity = [arguments[0], arguments[1]];
            }
            this.__setImageGravity(imageGravity);
        }
        else
        {
            throw new Error("Too few arguments for setImageGravity in " + this.classname);
        }
    },
    /**
        @private
    */
    __setImageGravity: function (imageGravity)
    {
        imageGravity = (imageGravity && imageGravity.length === 2 && !isNaN(imageGravity[0]) && !isNaN(imageGravity[1])) ? [imageGravity[0], imageGravity[1]] : [0.5, 0.5];
        if(this._imageObject)
        {
            this._imageObject._imageGravity = imageGravity;
            this._imageObject._anchor = imageGravity;
            this._imageObject._adjustImageGravity();
            this._imageObject.setImageFit(this.getImageFit());
        }
    },
    /**
     * @name GLUI.View#getImageGravity
     * @description Retrieve the value of the <code>imageGravity</code> property.
     * @returns {Number} The current value of <code>imageGravity</code> (expressed as two floats).
     * @see GLUI.View#setImageGravity
     * @function
     * @status Android, Flash, Test
     */
    getImageGravity: function ()
    {
        if(this._imageObject)
        {
            return this._imageObject.getImageGravity();
        }
        return undefined;
    },
    /*private methods*/
    _registerSetters: function ($super)
    {
        $super();
        Commands._registerSettersForImage(this);
    },
    _registerGetters: function ($super)
    {
        $super();
        Commands._registerGettersForImage(this);
    },
    _updateDepth: function ()
    {
        var i;
        if(this._children)
        {
            for(i = 0; i < this._children.length; i++)
            {
                if(this._children[i])
                {
                    this._children[i].getGLObject().setDepth(i + 1);
                }
            }
        }
    },
    _updateView: function ($super)
    {
        $super();
        /*in UI.View, if you do not specify the image for normal state, then Image will not be shown for any state
         * so its better to return from there*/
        if(this._imageObject)
        {
            this._imageObject.setState(this._state);
        }
    },
    /**
     * @private
     * */
    _addedToParent: function ()
    {
        this._showUIChildren();
        var Button = require('./Button').Button;
        var children = this._children;
        var i;
        if(children)
        {
            var length = children.length;
            for(i = 0; i < length; i++)
            {
                var child = children[i];
                if(child instanceof exports.View && !(child instanceof Button))
                {
                    child._addedToParent();
                }
            }
        }
        this._isAddedToParent = true;
    },
    /**
     * @private
     * */
    _removedFromParent: function ()
    {
        this._hideUIChildren();
        var Button = require('./Button').Button;
        var children = this._children;
        if(children)
        {
            var i = 0;
            var length = children.length;
            for(i = 0; i < length; i++)
            {
                var child = children[i];
                if(child instanceof exports.View && !(child instanceof Button))
                {
                    child._removedFromParent();
                }
            }
        }
        this._isAddedToParent = false;
    },
    /**
     * @private
     * */
    _showUIChildren: function ()
    {
        var i = 0;
        if(this._uiChildren)
        {
            var length = this._uiChildren.length;
            for(i = 0; i < length; i++)
            {
                var child = this._uiChildren[i];
                child._parent = null;
                UIWindow.document.addChild(child);
                child._parent = this;
                var frame = child.getFrame();
                if(frame)
                {
                    child.setFrame(frame);
                }
                child.setAlpha(child.getAlpha());
                child.setVisible(child.getVisible());
                child.setEnabled(child.getEnabled());
                child.setTouchable(child.getTouchable());
            }
        }
    },
    /**
     * @private
     * */
    _hideUIChildren: function ()
    {
        var i = 0;
        if(this._uiChildren)
        {
            var length = this._uiChildren.length;
            for(i = 0; i < length; i++)
            {
                var child = this._uiChildren[i];
                UIWindow.document.removeChild(child);
                child._parent = this;
            }
        }
    },
    /**
     * @private
     * */
    _setFrameForUIChildren: function (targetFrame)
    {
        if(targetFrame)
        {
            var frame;
            if(targetFrame instanceof Array)
            {
                frame = targetFrame.slice(); //frame is okay.
            }
            else if(targetFrame.array)
            {
                frame = targetFrame.array();
            }
            else if(arguments && arguments.length >= 4)
            {
                frame = [arguments[0], arguments[1], arguments[2], arguments[3]];
            }
            else
            {
                throw new Error('Frame is not an array [x, y, w, h] in setFrame(frame) :: ' + this.classname);
            }
            this._gluiFrame = frame.slice();
            var point;
            var ScrollView = require('./ScrollView').ScrollView;
            if(this._parent instanceof ScrollView)
            {
                point = this._parent._content.localToScreen(new Point(frame[0], frame[1]));
            }
            else
            {
                point = this._parent.getGLObject().localToScreen(new Point(frame[0], frame[1]));
            }
            if(point)
            {
                this._setFrame([point.getX(), point.getY(), frame[2], frame[3]]);
            }
            else
            {
                this._setFrame(frame);
            }
        }
    },
    /**
     * @private
     * */
    _getFrameForUIChildren: function ()
    {
        return this._gluiFrame;
    },
    /**
     * @private
     * */
    _setAlphaForUIChildren: function (alpha)
    {
        if(alpha === undefined || alpha === null)
        {
            alpha = 1;
        }
        else if(isNaN(alpha))
        {
            throw new Error('Wrong arguments for \'alphaValue\' in setAlpha(alpha)');
        }
        var parent = this._parent;
        var targetAlpha = 1;
        var alp = 1;
        var WindowLayer = require('./WindowLayer').WindowLayer;
        while(parent && !(parent instanceof WindowLayer))
        {
            var __alpha = 1;
            if(!isNaN(parent.getAlpha()))
            {
                __alpha = parent.getAlpha();
                if(__alpha > 1)
                {
                    __alpha = 1;
                }
                if(__alpha < 0)
                {
                    __alpha = 0;
                }
            }
            targetAlpha *= __alpha;
            parent = parent._parent;
        }
        if(!isNaN(alpha))
        {
            alp = alpha;
            if(alp > 1)
            {
                alp = 1;
            }
            if(alp < 0)
            {
                alp = 0;
            }
        }
        targetAlpha *= alp;
        this._setAlpha(targetAlpha);
        this._gluiAlpha = alpha;
    },
    /**
     * @private
     * */
    _getAlphaForUIChildren: function ()
    {
        return this._gluiAlpha;
    },
    /**
     * @private
     * */
    _setVisibleForUIChildren: function (flag)
    {
        if(flag === undefined || flag === null)
        {
            flag = true;
        }
        else if((flag !== true) && (flag !== false))
        {
            throw new Error('Expecting boolean value but found ' + typeof (flag) + ' for setVisible(boolValue)');
        }
        var parent = this._parent;
        var targetFlag = true;
        var flg = true;
        var WindowLayer = require('./WindowLayer').WindowLayer;
        while(parent && !(parent instanceof WindowLayer))
        {
            var __flag = true;
            if(parent.getVisible() === false)
            {
                __flag = parent.getVisible();
            }
            targetFlag = targetFlag && __flag;
            parent = parent._parent;
        }
        if(flag === false)
        {
            flg = flag;
        }
        targetFlag = targetFlag && flg;
        this._gluiSetVisible(targetFlag);
        this._gluiIsVisible = flg;
    },
    /**
     * @private
     * */
    _getVisibleForUIChildren: function ()
    {
        return this._gluiIsVisible;
    },
    /**
     * @private
     * */
    _setEnabledForUIChildren: function (flag)
    {
        if(flag === undefined || flag === null)
        {
            flag = true;
        }
        else if((flag !== true) && (flag !== false))
        {
            throw new Error('Expecting boolean value but found ' + typeof (flag) + ' for setEnabled(boolValue)');
        }
        var parent = this._parent;
        var targetFlag = true;
        var flg = true;
        var WindowLayer = require('./WindowLayer').WindowLayer;
        while(parent && !(parent instanceof WindowLayer))
        {
            var __flag = true;
            if(parent.getEnabled() === false)
            {
                __flag = parent.getEnabled();
            }
            targetFlag = targetFlag && __flag;
            parent = parent._parent;
        }
        if(flag === false)
        {
            flg = flag;
        }
        targetFlag = targetFlag && flg;
        this._setEnabled(targetFlag);
        this._gluiIsEnable = flg;
    },
    /**
     * @private
     * */
    _getEnabledForUIChildren: function ()
    {
        return this._gluiIsEnable;
    },
    _setTouchableForUIChildren: function (flag)
    {
        if(flag === undefined || flag === null)
        {
            flag = true;
        }
        else if((flag !== true) && (flag !== false))
        {
            throw new Error('Expecting boolean value but found ' + typeof (flag) + ' for setTouchable(boolValue)');
        }
        var parent = this._parent;
        var targetFlag = true;
        var flg = true;
        var WindowLayer = require('./WindowLayer').WindowLayer;
        while(parent && !(parent instanceof WindowLayer))
        {
            var __flag = true;
            if(parent.getTouchable() === false)
            {
                __flag = parent.getTouchable();
            }
            targetFlag = targetFlag && __flag;
            parent = parent._parent;
        }
        if(flag === false)
        {
            flg = flag;
        }
        targetFlag = targetFlag && flg;
        this._setTouchable(targetFlag);
        this._gluiIsTouchable = flg;
    },
    _getTouchableForUIChildren: function ()
    {
        return this._gluiIsTouchable;
    },
    /**
     * @private
     * */
    _addSettersGettersForUIComponents: function (childNode)
    {
        var frame = childNode.getFrame();
        var alpha = childNode.getAlpha();
        var visibleFlag = childNode.getVisible();
        var enableFlag = childNode.getEnabled();
        var touchableFlag = childNode.getTouchable();
        childNode._parent = this;
        childNode._setFrame = childNode.setFrame;
        childNode.setFrame = this._setFrameForUIChildren;
        childNode._getFrame = childNode.getFrame;
        childNode.getFrame = this._getFrameForUIChildren;
        if(frame)
        {
            childNode.setFrame(frame);
        }
        childNode._setAlpha = childNode.setAlpha;
        childNode.setAlpha = this._setAlphaForUIChildren;
        childNode._getAlpha = childNode.getAlpha;
        childNode.getAlpha = this._getAlphaForUIChildren;
        childNode.setAlpha(alpha);
        childNode._gluiSetVisible = childNode.setVisible;
        childNode.setVisible = this._setVisibleForUIChildren;
        childNode._gluiGetVisible = childNode.getVisible;
        childNode.getVisible = this._getVisibleForUIChildren;
        childNode.setVisible(visibleFlag);
        childNode._setEnabled = childNode.setEnabled;
        childNode.setEnabled = this._setEnabledForUIChildren;
        childNode._getEnabled = childNode.getEnabled;
        childNode.getEnabled = this._getEnabledForUIChildren;
        childNode.setEnabled(enableFlag);
        //////////////////////  Touchable Code //////////////////////////////
        childNode._setTouchable = childNode.setTouchable;
        childNode.setTouchable = this._setTouchableForUIChildren;
        childNode._getTouchable = childNode.getTouchable;
        childNode.getTouchable = this._getTouchableForUIChildren;
        childNode.setTouchable(touchableFlag);
    },
    /**
     * @private
     * */
    _removeSettersGettersForUIComponents: function (childNode)
    {
        var frame = childNode.getFrame();
        var alpha = childNode.getAlpha();
        var visibleFlag = childNode.getVisible();
        var enableFlag = childNode.getEnabled();
        var touchableFlag = childNode.getTouchable();
        childNode.setFrame = childNode._setFrame;
        delete childNode._setFrame;
        childNode.setFrame(frame);
        childNode.getFrame = childNode._getFrame;
        delete childNode._getFrame;
        delete childNode._gluiFrame;
        childNode.setAlpha = childNode._setAlpha;
        delete childNode._setAlpha;
        childNode.setAlpha(alpha);
        childNode.getAlpha = childNode._getAlpha;
        delete childNode._getAlpha;
        delete childNode._gluiAlpha;
        childNode.setVisible = childNode._gluiSetVisible;
        delete childNode._gluiSetVisible;
        childNode.setVisible(visibleFlag);
        childNode.getVisible = childNode._gluiGetVisible;
        delete childNode._gluiGetVisible;
        delete childNode._gluiIsVisible;
        childNode.setEnabled = childNode._setEnabled;
        delete childNode._setEnabled;
        childNode.setEnabled(enableFlag);
        childNode.getEnabled = childNode._getEnabled;
        delete childNode._getEnabled;
        delete childNode._gluiIsEnable;
        ///////////////////////////Touchable Code ///////////////////////////////
        childNode.setTouchable = childNode._setTouchable;
        delete childNode._setTouchable;
        childNode.setTouchable(touchableFlag);
        childNode.getTouchable = childNode._getTouchable;
        delete childNode._getTouchable;
        delete childNode._gluiIsTouchable;
    },
    /**
     * @private
     * */
    setVisible: function ($super, flag)
    {
        $super(flag);
        this._setVisibleUI();
    },
    /**
     * @private
     * */
    setEnabled: function ($super, flag)
    {
        $super(flag);
        this._setEnabledUI();
    },
    /**
     * @private
     * */
    setAlpha: function ($super, flag)
    {
        $super(flag);
        this._setAlphaUI();
    },
    /**
     * @private
     * */
    setTouchable: function ($super, touchable)
    {
        $super(touchable);
        this._setTouchableUI();
    },
    /**
     * @private
     * */
    _setTouchableUI: function ()
    {
        if(this._hasUIChildren === true)
        {
            var x, y;
            if(this._uiChildren)
            {
                var uiChildrenLength = this._uiChildren.length;
                for(x = 0; x < uiChildrenLength; x++)
                {
                    this._uiChildren[x].setTouchable(this._uiChildren[x].getTouchable());
                }
            }
            if(this._children)
            {
                var Button = require('./Button').Button;
                var gluiChildrenLength = this._children.length;
                for(y = 0; y < gluiChildrenLength; y++)
                {
                    var childNode = this._children[y];
                    if(childNode instanceof exports.View && !(childNode instanceof Button))
                    {
                        childNode._setTouchableUI();
                    }
                }
            }
        }
    },
    /**
     * @private
     * */
    _setVisibleUI: function ()
    {
        if(this._hasUIChildren === true)
        {
            var x, y;
            if(this._uiChildren)
            {
                var uiChildrenLength = this._uiChildren.length;
                for(x = 0; x < uiChildrenLength; x++)
                {
                    this._uiChildren[x].setVisible(this._uiChildren[x].getVisible());
                }
            }
            if(this._children)
            {
                var Button = require('./Button').Button;
                var gluiChildrenLength = this._children.length;
                for(y = 0; y < gluiChildrenLength; y++)
                {
                    var childNode = this._children[y];
                    if(childNode instanceof exports.View && !(childNode instanceof Button))
                    {
                        childNode._setVisibleUI();
                    }
                }
            }
        }
    },
    /**
     * @private
     * */
    _setEnabledUI: function ()
    {
        if(this._hasUIChildren === true)
        {
            var x, y;
            if(this._uiChildren)
            {
                var uiChildrenLength = this._uiChildren.length;
                for(x = 0; x < uiChildrenLength; x++)
                {
                    this._uiChildren[x].setEnabled(this._uiChildren[x].getEnabled());
                }
            }
            if(this._children)
            {
                var Button = require('./Button').Button;
                var gluiChildrenLength = this._children.length;
                for(y = 0; y < gluiChildrenLength; y++)
                {
                    var childNode = this._children[y];
                    if(childNode instanceof exports.View && !(childNode instanceof Button))
                    {
                        childNode._setEnabledUI();
                    }
                }
            }
        }
    },
    /**
     * @private
     * */
    _setAlphaUI: function ()
    {
        if(this._hasUIChildren === true)
        {
            var x, y;
            if(this._uiChildren)
            {
                var uiChildrenLength = this._uiChildren.length;
                for(x = 0; x < uiChildrenLength; x++)
                {
                    this._uiChildren[x].setAlpha(this._uiChildren[x].getAlpha());
                }
            }
            if(this._children)
            {
                var Button = require('./Button').Button;
                var gluiChildrenLength = this._children.length;
                for(y = 0; y < gluiChildrenLength; y++)
                {
                    var childNode = this._children[y];
                    if(childNode instanceof exports.View && !(childNode instanceof Button))
                    {
                        childNode._setAlphaUI();
                    }
                }
            }
        }
    },
    /**
     * @private
     * */
    _setFrameUI: function ()
    {
        if(this._hasUIChildren === true)
        {
            var x, y;
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
            if(this._children)
            {
                var Button = require('./Button').Button;
                var gluiChildrenLength = this._children.length;
                for(y = 0; y < gluiChildrenLength; y++)
                {
                    var childNode = this._children[y];
                    if(childNode instanceof exports.View && !(childNode instanceof Button))
                    {
                        childNode._setFrameUI();
                    }
                }
            }
        }
    },
    /**
     * @private
     * */
    __setFrame: function ($super, frame)
    {
        $super(frame); //after this step, this._frame will have a valid frame - exception handling done with super. 
        this.getGLObject().setPosition(this._frame[0], this._frame[1]);
        this._adjustFrameForBgImage();
        this._setFrameUI();
    },
    /**
     * @private
     * */
    setAnchor: function (anchor)
    {
        this._anchor = anchor;
    },
    /**
     * @private
     * */
    _updateUIChildrenState: function (boolValue, childNode)
    {
        var parent = this;
        var WindowLayer = require('./WindowLayer').WindowLayer;
        if(boolValue === true && ((childNode instanceof EditText) || (childNode instanceof EditTextArea) || (childNode instanceof WebView) || (childNode instanceof MapView) || childNode._hasUIChildren === true))
        {
            while(parent && !(parent instanceof WindowLayer))
            {
                parent._hasUIChildren = true;
                parent = parent._parent;
            }
        }
        else if(boolValue === false)
        {
            var hasParentOtherUIChildren = false;
            var siblings = parent.getChildren();
            var sibLength = siblings.length;
            var i;
            for(i = 0; i < sibLength; i++)
            {
                if(childNode !== siblings[i])
                {
                    if((siblings[i] instanceof EditText) || (siblings[i] instanceof EditTextArea) || (siblings[i] instanceof WebView) || (siblings[i] instanceof MapView))
                    {
                        hasParentOtherUIChildren = true;
                    }
                    else
                    {
                        if(siblings[i]._hasUIChildren === true || siblings[i]._hasUIChildren === false)
                        {
                            hasParentOtherUIChildren = siblings[i]._hasUIChildren || hasParentOtherUIChildren;
                            if(hasParentOtherUIChildren === true)
                            {
                                break;
                            }
                        }
                    }
                }
            }
            if(hasParentOtherUIChildren === false)
            {
                parent._hasUIChildren = false;
                if(parent._parent && parent._parent instanceof AbstractView && !(parent._parent instanceof WindowLayer))
                {
                    parent._parent._updateUIChildrenState(false, this);
                }
            }
        }
    },
    /**
     * @private
     * */
    _adjustFrameForBgImage: function ()
    {
        if(this._imageObject)
        {
            var frameForBgImage = [0, 0, this._frame[2], this._frame[3]]; //hence it is a child node of view, its position should be 0, 0 locally as this is a background.
            this._imageObject.setFrame(frameForBgImage);
        }
    },
    /**
     * @private
     * */
    _removeAllChildren: function ()
    {
        if(this._children && this.removeChild)
        {
            while(this._children.length)
            {
                this.removeChild(this._children[0]);
            }
        }
        if(this._uiChildren && this.removeChild)
        {
            while(this._uiChildren.length)
            {
                this.removeChild(this._uiChildren[0]);
            }
        }
    },
    destroy: function ($super)
    {
        this._removeAllChildren();
        if(this._sprite)
        {
            this._sprite.destroy();
            this._sprite = null;
        }
        if(this._children)
        {
            delete this._children;
            this._children = null;
        }
        if(this._uiChildren)
        {
            delete this._uiChildren;
            this._uiChildren = null;
        }
        if(this._imageObject)
        {
            this._imageObject.destroy();
            this._imageObject = null;
        }
        this._imageURL = null;
        $super();
    },
    ///////////// Empty Functions/////////////
    /**
     * @name GLUI.View#layoutSubviews
     * @description Override this for custom view subclass layout code.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @function
     * @status Android, Flash, Test
     */
    layoutSubviews: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: layoutSubviews() ' + this.classname);
    },
    /**
     * @name GLUI.View#getImageBorder
     * @description Retrieve the value of the <code>imageBorder</code> property for a view state.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {GLUI.State} [flags Optional, Default: GLUI.Commands.State.Normal] The GLUI view state.
     * @returns {Object} The current value of <code>imageBorder.</code>
     * @see GLUI.View#setImageBorder
     * @function
     * @status Android, Flash, Test
     */
    getImageBorder: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getImageBorder() ' + this.classname);
    },
    /**
     * @name GLUI.View#setImageBorder
     * @description Set the value of the <code>imageBorder</code> property for a view state. This property defines a border for images used in the specified view state.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {Object} imageBorder The new value for <code>imageBorder</code>.
     * @param {GLUI.State} [flags Optional, Default: UI.State.Normal] The GLUI view state.
     * @see GLUI.View#getImageBorder
     * @function
     * @status Android, Flash, Test
     */
    setImageBorder: function (imageBorder, flags)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setImageBorder(imageBorder, flags) ' + this.classname);
    },
    /**
     * @name GLUI.View#getStyle
     * @description Retrieve the style for this <code>View.</code>
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {GLUI.Style} The current <code>View</code> style.
     * @see GLUI.View#setStyle
     * @function
     * @status Android, Flash, Test
     */
    getStyle: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: getStyle() ' + this.classname);
    },
    /**
     * @name GLUI.View#setStyle
     * @description Set the style for this <code>View.</code> This call allows custom view objects to process and update their styles more easily.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @param {GLUI.Style} style The new  <code>View</code> style.
     * @see GLUI.View#getStyle
     * @function
     * @status Android, Flash, Test
     */
    setStyle: function (style)
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setStyle(style) ' + this.classname);
    }
});