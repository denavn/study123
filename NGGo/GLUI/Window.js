////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Mizuno T.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Class           = require('../../NGCore/Client/Core/Class').Class;
var Capabilities    = require('../../NGCore/Client/Core/Capabilities').Capabilities;
var MessageListener = require('../../NGCore/Client/Core/MessageListener').MessageListener;
var UICommands      = require('../../NGCore/Client/UI/Commands').Commands;
var LayoutEmitter   = require('../../NGCore/Client/Device/LayoutEmitter').LayoutEmitter;
var Device          = require('../../NGCore/Client/Device').Device;
var Root            = require('../../NGCore/Client/GL2/Root').Root;
var Rect            = require('./ViewGeometry').Rect;
var Commands        = require('./Commands').Commands;
var WindowLayer     = require('./WindowLayer').WindowLayer;

var Window = Class.singleton( /** @lends GLUI.Window.prototype */
{
    classname: 'Window',
    _outerWidth: 0,
    _outerHeight: 0,
    _width: 0,
    _height: 0,

    /**
     * @class The <code>Window</code> class constructs a singleton object that manages application access to GLUI.<br><br>
     * <b>Note:</b> An application should never directly allocate a singleton.
     * @name GLUI.Window
     * @augments Core.Class
     * @see GLUI.Window#document
     * @constructs The default constructor.
     */
    initialize: function ()
    {
        if (!this._outerWidth || !this._outerHeight)
        {
            this.setWidthAndHeight(Capabilities.getScreenWidth(), Capabilities.getScreenHeight());
        }
        if (!this._width || !this._height)
        {
            this._setWidthAndHeight(Capabilities.getScreenWidth(), Capabilities.getScreenHeight());
        }
        Commands.instantiate();
        var LayoutListener = MessageListener.subclass(
        {
            initialize: function ()
            {
                Device.LayoutEmitter.addListener(this, this.onUpdate);
            },
            onUpdate: function (layout)
            {
                Window._setWidthAndHeight(layout.width, layout.height);
            }
        });
        var layout = null;
        layout = new LayoutListener();

    },

    setStatusBarHidden: function (value)
    {
        UICommands.setStatusBarHidden(value);
        this._outerHeight = Capabilities.getScreenHeight() - (value ? 0 : (Capabilities.getStatusBarHeight() || 0));
    },
    log: function (object)
    {
        console.log(object.toString());
    },
    /**
     * Return the available screen width, with respect to orientation and system status bars.
     * @returns {Number} The currently available width in pixels that can be drawn to.
     * @type Number
     * @status Android, Flash
     */
    getWidth: function ()
    {
        return this._width;
    },
    /**
     * Return the available screen height, with respect to orientation and system status bars.
     * @returns {Number} The currently available height in pixels that can be drawn to.
     * @type Number
     * @status Android, Flash
     */
    getHeight: function ()
    {
        return this._height;
    },
    getOuterWidth: function ()
    {
        return this._outerWidth;
    },
    getOuterHeight: function ()
    {
        return this._outerHeight;
    },
    getFrame: function ()
    {
        return new Rect(0, 0, this._width, this._height);
    },
    destroy: function ()
    {},
    document: WindowLayer.singleton(
    {
        'type': 'document',
        'classname': 'WindowLayer'
    }),
    _layers: {},
    _getLayer: function (level)
    {
        if( !this._layers[level] )
        {
            this._layers[level] = new WindowLayer(
        {
            'level': level || 0
                });
        }
        return this._layers[level];
    }
});

Window.__defineGetter__("outerWidth", function ()
{
    return this.getOuterWidth();
});
Window.__defineGetter__("outerHeight", function ()
{
    return this.getOuterHeight();
});
Window._setWidthAndHeight = function (width, height)
{
    this._width = width;
    this._height = height;
};
Window.setWidthAndHeight = function (width, height)
{
    this._outerWidth = width;
    this._outerHeight = height;
};

exports.Window = Window;
