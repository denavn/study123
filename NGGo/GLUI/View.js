////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Harris K.
 *  @co-author: Shamas S.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Node = require('../../NGCore/Client/GL2/Node').Node;
var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;
var Image = require('./Image').Image;

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
        this._internalGLObject = new Node();
        this._sprite = null;
        this._imageURL = null;
        this._imageObject = null;
        if (properties)
        {
            this.setAttributes(properties);
        }
        return this;
    },

    __setFrame: function ($super, frame)
    {
        $super(frame); //after this step, this._frame will have a valid frame - exception handling done with super. 
        this.getGLObject().setPosition(this._frame[0], this._frame[1]);
        this._adjustFrameForBgImage();
    },
    setAnchor: function (anchor)
    {
        this._anchor = anchor;
    },
    /**
     * Add a child node to this <code>View</code> at the specified index.
     * Index is treated as Depth (z-index) of the child too.
     * @example var mainView = new UI.View();
     * ...
     * var errorView = new UI.View();
     * ...
     * mainView.addChild(errorView);
     * @param {GLUI.AbstractView} childNode The child which should be a derived class of GLUI.AbstractView to add.
     * @param {Number} index The specified index.
     * @throws {"message:" + this.type + ".addChild: " + childNode + " is not a view!"} Specified child is not an instance of Abstract View.
     * @returns This function returns <code>this</code> to support method invocation chaining.
     * @see GLUI.View#removeChild
     * @status Android, Test
     */

    addChild: function (childNode, index)
    {

        if (childNode instanceof AbstractView)
        {
            if (childNode._parent)
            {
                childNode.removeFromParent();
            }
            if (this._children)
            {
                if ((index === 0 || index > 0) && index < this._children.length)
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
            childNode._setEnabled(this._enabled, false);
            childNode._setVisible(this._visible, false);
            if (this._isParentScrollView)
            {
                childNode.__setTouchableFalse();
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

        this._internalGLObject.addChild(childNode.getGLObject());
        this._updateDepth();
        return this;
    },
    /**
     * Remove a child from this <code>View</code>.
     * @example mainView.removeChild(errorView);
     * @param {GLUI.AbstractView} childNode The child node to remove.
     * @throws {"message:" + this.type + ".addChild: " + childNode + " is not a view!"} Specified child is not an instance of Abstract View.
     * @returns The child node that was removed.
     * @see GLUI.View#addChild
     * @status Android, Test
     */
    removeChild: function (childNode)
    {
        if (childNode instanceof AbstractView)
        {
            var nodeIndex = this._children.indexOf(childNode);
            if (nodeIndex !== -1)
            {
                this._children.splice(nodeIndex, 1);
            }
            this._internalGLObject.removeChild(childNode.getGLObject());
            childNode._parent = null;
            childNode._setEnabled(true, false);
            childNode._setVisible(true, false);
            if (this._isParentScrollView)
            {
                childNode.__setTouchableTrue();
            }
            this._updateDepth();
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
        return this._children.length;
    },
    /**
     * @function
     * @return {Array} A copy of array containing children (sub-views) of a View.
     */
    getChildren: function ()
    {
        return this._children.slice(); //using slice, it is returning the copy instead of original reference
    },

    /**
     * @name GLUI.View#setImage
     * @description Set an image URL for a view state. This property defines a remote image resource to use in arbitrary contexts.
     * <br /><b>Note: </b> Images must be in powers of two and/or mentioned under <code>"textures":</code> key in manifests.
     * <br />URL is also supported, and the image will be converted to power of two.
     * <br />Local image auto conversion will be supported later.
     * @example var someSprite = new GLUI.View();        
     * someSprite.setImage('./Content/mySprite.png', GLUI.State.Normal, [w, h]);
     * someSprite.setImage('http://www.example.com/somepicture80x92.png', GLUI.State.Normal, [200, 110]);
     * @see GLUI.View#getImage
     * @param {String} imageURL The new image URL.
     * @param {GLUI.State} [flags=GLUI.State.Normal] A set of flags describing the view state(s) for using this URL.
     * @param {Array} imageSize an array for the size of image. [w, h]
     * @status iOS, Android, Test
     * @function 
     */
    setImage: function (imageURL, flags, imageSize)
    {
        if (!this._imageObject)
        {
            this._imageObject = new Image();
            this._internalGLObject.addChild(this._imageObject.getGLObject());
            this._imageObject.getGLObject().setDepth(0);
            this._imageObject._setClickable(false);
        }
        this._adjustFrameForBgImage();
        this._imageObject.setImage(imageURL, flags, imageSize);

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
        if (this._imageObject)
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
        if (this._imageObject)
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
        if (this._imageObject)
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
        if (arguments)
        {
            if (arguments.length >= 2)
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
    
        if (this._imageObject)
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
        if (this._imageObject)
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
        if (this._children)
        {
            for (i = 0; i < this._children.length; i++)
            {
                if (this._children[i])
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
        if (this._imageObject)
        {
            this._imageObject.setState(this._state);
        }
    },

    _adjustFrameForBgImage: function ()
    {
        if (this._imageObject)
        {
            var frameForBgImage = [0, 0, this._frame[2], this._frame[3]]; //hence it is a child node of view, its position should be 0, 0 locally as this is a background.
            this._imageObject.setFrame(frameForBgImage);
        }
    },
    _removeAllChildren: function()
    {
        if (this._children && this.removeChild)
        {
            while(this._children.length)
            {
                this.removeChild(this._children[0]);
            }
        }
    },
    destroy: function ($super)
    {
        this._removeAllChildren();
        if (this._sprite)
        {
            this._sprite.destroy();
            this._sprite = null;
        }
        if (this._children)
        {
            delete this._children;
            this._children = null;
        }

        if (this._imageObject)
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
    layoutSubviews: function(){
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
    getImageBorder: function(){
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
    setImageBorder: function(imageBorder, flags){
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
    getStyle: function(){
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
    setStyle: function(style){
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation: setStyle(style) ' + this.classname);
    }   
});
