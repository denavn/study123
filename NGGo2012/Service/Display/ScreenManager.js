////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////
// Require Block
var Class = require('../../../NGCore/Client/Core/Class').Class;
var ViewGeometry = require('../../../NGCore/Client/UI/ViewGeometry');
var ServerSync   = require('../Data/ServerSync').ServerSync;
var Origin =
{
    Offset: 1,
    Center: 2
};
var LetterBoxType =
{
    GL2: 0,
    UI: 1
};
var Rect = ViewGeometry.Rect.subclass( /** @lends Service.Display.ScreenManager.Rect.prototype */
{
    classname: 'Rect',
    /**
     * @class This class is compatible class of <code>UI.ViewGeometry.Rect</code>, but it can handle scaling and offset of logical screen.
     * @constructs
     * @augments UI.ViewGeometry.Rect
     * @name Service.Display.ScreenManager.Rect
     */
    initialize: function ($super, arg0, offset, scale)
    {
        $super(arg0);
        if (arg0 instanceof Rect)
        {
            this._offset = arg0._offset;
            this._scale = arg0._scale;
        }
        else
        {
            this._offset = offset;
            this._scale = scale;
        }
    },
    /**
     * Retuns Array which includes converted parameter of x, y, h, z.
     * @returns {Number[]} Converted coordinate array.
     */
    array: function ()
    {
        var offsetX = this._offset[0];
        var offsetY = this._offset[1];
        var scale = this._scale;
        return [this.x * scale + offsetX, this.y * scale + offsetY, this.w * scale, this.h * scale];
    }
});
exports.Rect = Rect;
var ScreenSetting = Class.subclass( /** @lends Service.Display.ScreenManager.ScreenSetting.prototype */
{
    classname: 'ScreenSetting',
    /**
     * @class This class is a base class of following setting classes:
     * <ul>
     * <li><b>-</b> <code>LetterBoxSetting</code></li>
     * <li><b>-</b> <code>PanAndScanSetting</code></li>
     * <li><b>-</b> <code>FixSetting</code></li>
     * <li><b>-</b> <code>FixWidthSetting</code></li>
     * <li><b>-</b> <code>FixHeightSetting</code></li>
     * </ul>
     * These classes provide methods/properties of this class.
     * <br><br>
     * You can't create object directry. You can create by
     * <code>ScreenManager.register()</code> method and access via
     * <code>ScreenManager.settings</code> property. If you set one
     * setting as default, you can access this class's features via
     * <code>ScreenManager</code>'s methods/properties.
     * <pre class="code">
     * // Creates setting
     * ScreenManager.register({
     *     type:"LetterBox",
     *     name:"field",
     *     logicalSize:[480,320]
     * });
     * // Access via ScreenManager.settings
     * var pos = ScreenManager.settings.field.convert([100, 120]);
     * // Uses setDefault. Result is as same as above one.
     * ScreenManager.setDefault("field");
     * var pos2 = ScreenManager.convert([100, 120]);
     * </pre>
     * @property {Number[]} offset (readonly) Offset Returns offset of the logical origin point for physical screen.
     * <br><br>
     * If the setting type is not "LetterBox" or "PanAndScan",  it become [0, 0].
     * @property {String} name (readonly) Name of this setting.
     * @property {Number[]} logicalSize (readonly) Logical screen resolution of this setting.
     * @property {Number} scale (readonly) Scale value between the logical resolution and the physical resolution.
     * @property {Number[]} offset (readonly) Offset in physical resolution.
     * @constructs The default constructor.
     * @name Service.Display.ScreenManager.ScreenSetting
     * @augments Core.Class
     */
    initialize: function (screen, setting)
    {
        this._name = setting.name;
        var physicalSize = [screen.width, screen.height];
        this._logicalSize = setting.logicalSize || physicalSize;
        this._root = null;
        this._screen = screen;
        this._letterboxFrames = [];
        this._offset = [0, 0];
    },
    get name()
    {
        return this._name;
    },
    set name(value)
    {
        throw new Error("name property is readonly");
    },
    get logicalSize()
    {
        return this._logicalSize;
    },
    set logicalSize(value)
    {
        throw new Error("logicalSize property is readonly");
    },
    get scale()
    {
        return this._scale;
    },
    set scale(value)
    {
        throw new Error("scale property is readonly");
    },
    get offset()
    {
        return this._offset;
    },
    set offset(value)
    {
        throw new Error("offset property is readonly");
    },
    /**
     * Creates root node for GL2. You don't have to convert all positions
     * if you add nodes as children of this. This node is set proper offset
     * and scale already.
     * <pre class="code">
     * // Create settings
     * ScreenManager.register({
     *     type: "LetterBox",
     *     name: "field",
     *     logicalSize: [800, 480]
     * });
     * ScreenManager.setDefault("field");
     * var screenRoot = ScreenManager.getRootNode();
     * // You don't have to convert coordinates!
     * screenRoot.addChild(background);
     * </pre>
     * @returns {GL2.Node} Root node for GL2 nodes.
     */
    getRootNode: function ()
    {
        if (!this._root)
        {
            var Node = require('../../../NGCore/Client/GL2/Node').Node;
            var Root = require('../../../NGCore/Client/GL2/Root').Root;
            var root = this._root = new Node();
            root.setPosition(this._offset);
            root.setScale([this._scale, this._scale]);
            Root.addChild(root);
        }
        return this._root;
    },
    /**
     * Converts one number with <code>scale</code>.
     * It is useful for UI.Label's text size or so on.
     * <pre class="code">
     * var textSize = Screen.settings.ui.convertNumber(10);
     * label.setTextSize(~~(textSize));
     * </pre>
     * @param {Number} number Input value for calulation.
     * @returns {Number} Converted value.
     */
    convertNumber: function (number)
    {
        return ~~ (number * this._scale);
    },
    /**
     * Converts array which has 2 numbers with <code>scale</code>.
     * It is useful for position or size.
     * <br><br>
     * The origin point is changed if the second parameter is passed:<br><br>
     * <ul>
     * <li><b>-</b> <code><a href="Service.Display.ScreenManager%23Origin.html#Offset">Origin.Offset</a></code>: Add offset value. It is good for root item in LetterBox and PanAndScan.
     * <li><b>-</b> <code><a href="Service.Display.ScreenManager%23Origin.html#Center">Origin.Center</a></code>: Center of Screen become origin.
     * </ul>
     * If you pass the negative coordinate, the origin point moves opposite side.
     * <br><br>
     * <pre class="code">
     * var textSize = Screen.settings.ui.convertNumber(10);
     * label.setTextSize(~~(textSize));
     * </pre>
     * @param {Number[]} coordinate Input position
     * @returns {Number[]} Converted coordinate.
     */
    convert: function (coordinate, origin)
    {
        var offset, originX, originY;
        var scale = this._scale;
        var originEnum = Origin;
        if (!(coordinate instanceof Array))
        {
            var errorMsg = "Input of ScreenManager must be Array, but not: " + String(coordinate);
            console.log((new Error()).stack);
            console.log(errorMsg);
            throw new Error(errorMsg);
        }
        if (coordinate.length === 4)
        {
            var result = this.convert(coordinate.slice(0, 2), origin);
            result.push(this.convertNumber(coordinate[2]));
            result.push(this.convertNumber(coordinate[3]));
            return result;
        }
        var x = coordinate[0];
        var y = coordinate[1];
        switch (origin)
        {
        case originEnum.Center:
        case "center":
            originX = ~~ (this.logicalSize[0] * scale * 0.5);
            originY = ~~ (this.logicalSize[1] * scale * 0.5);
            break;
        case originEnum.Offset:
        case "offset":
            originX = this._offset[0];
            originY = this._offset[1];
            x = (x < 0) ? ~~ (this.logicalSize[0] + x) : x;
            y = (y < 0) ? ~~ (this.logicalSize[1] + y) : y;
            break;
        case originEnum.Center | originEnum.Offset:
        case "offset|center":
        case "center|offset":
            originX = ~~ (this.logicalSize[0] * scale * 0.5) + this._offset[0];
            originY = ~~ (this.logicalSize[1] * scale * 0.5) + this._offset[1];
            break;
        default:
            originX = 0;
            originY = 0;
            x = (x < 0) ? this.logicalSize[0] + x : x;
            y = (y < 0) ? this.logicalSize[1] + y : y;
            break;
        }
        return [originX + scale * x,
                originY + scale * y];
    },
    /**
     * Converts rectangle's position and size with <code>scale</code>.
     * <br><br>
     * Second parameter effects the origin point. It is as same as <code>convert()</code>'s sencond parameter:<br><br>
     * <ul>
     * <li><b>-</b> <code><a href="Service.Display.ScreenManager%23Origin.html#Offset">Origin.Offset</a></code>: Add offset value. It is good for root item in LetterBox and PanAndScan.
     * <li><b>-</b> <code><a href="Service.Display.ScreenManager%23Origin.html#Center">Origin.Center</a></code>: Center of Screen become origin.
     * </ul>
     * If you pass the negative coordinate, the origin point moves opposite side.
     * <br><br>
     * <pre class="code">
     * var rect = Screen.Manager.settings.field.convertRect({x:120, y:120, w:200, h:200}, ScreenManager.Origin.Offset);
     * label.setFrame(rect.array());
     * </pre>
     * @param {Object} rect Logical rectangle frame.
     * @param {Service.Display.ScreenManager#Origin} origin Opition parameter about origin point.
     * @returns {UI.ViewGeometry.Rect} Converted rect.
     */
    convertRect: function (rect, origin)
    {
        if (rect instanceof Array && rect.length === 4)
        {
            rect = {
                x: rect[0],
                y: rect[1],
                w: rect[2],
                h: rect[3]
            };
        }
        else if (isNaN(rect.x) || isNaN(rect.y) || isNaN(rect.w) || isNaN(rect.h))
        {
            console.log((new Error()).stack);
            throw new Error("ScreenManager: parameter of convertRect() should be object or 4 length array.");
        }
        var scale = this._scale;
        var position = this.convert([rect.x, rect.y], origin);
        rect = [position[0], position[1], ~~ (scale * rect.w), ~~ (scale * rect.h)];
        return new ViewGeometry.Rect(rect);
    },
    /**
     * Create <code>UI.ViewGeometry.Rect</code> like class it knows <code>scale</code>, and <code>offset</code>.
     * <br><br>
     * It is used for UI object. This object's <code>sliceVertical()</code>, <code>sliceHorizontal()</code>, <code>inset()</code>
     * works properly with logical size.
     * <br><br>
     * Second parameter effects the origin point. It is as same as <code>convert()</code>'s sencond parameter:<br><br>
     * <ul>
     * <li><b>-</b> <code><a href="Service.Display.Display.ScreenManager%23Origin.html#Offset">Origin.Offset</a></code>: Add offset value. It is good for root item in LetterBox and PanAndScan.
     * <li><b>-</b> <code><a href="Service.Display.ScreenManager%23Origin.html#Center">Origin.Center</a></code>: Center of Screen become origin.
     * </ul>
     * If you pass the negative coordinate, the origin point moves opposite side.
     * <pre class="code">
     * var rect = Screen.settings.field.createRect({x:-100, y:-100, w:200, h:200}, ScreenManager.Origin.Center);
     * image.setFrame(rect.array());
     * rect.inset(20);
     * button.setFrame(rect.sliceVertical(50).array());
     * </pre>
     * @param {Object} rect Logical rectangle frame.
     * @param {Service.Display.ScreenManager#Origin} origin Opition parameter about origin point.
     * @returns {Service.Display.ScreenManager.Rect} Rect object similar to <code>UI.ViewGeometry.Rect</code>.
     */
    createRect: function (rect, origin)
    {
        if (rect instanceof Array && rect.length === 4)
        {
            rect = {
                x: rect[0],
                y: rect[1],
                w: rect[2],
                h: rect[3]
            };
        }
        else if (isNaN(rect.x) || isNaN(rect.y) || isNaN(rect.w) || isNaN(rect.h))
        {
            console.log((new Error()).stack);
            throw new Error("ScreenManager: parameter of createRect() should be object or 4 length array.");
        }
        var x = rect.x;
        var y = rect.y;
        var OriginEnum = Origin;
        switch (origin)
        {
        case OriginEnum.Offset:
        case "offset":
            x = (x < 0) ? this.logicalSize[0] + x : x;
            y = (y < 0) ? this.logicalSize[1] + y : y;
            return new Rect([x, y, rect.h, rect.w], this._offset, this._scale);
        case OriginEnum.Center:
        case "center":
            x += this.logicalSize[0] * 0.5;
            y += this.logicalSize[1] * 0.5;
            return new Rect([x, y, rect.h, rect.w], [0, 0], this._scale);
        default:
            x = (x < 0) ? this.logicalSize[0] + x : y;
            y = (y < 0) ? this.logicalSize[1] + y : y;
            return new Rect([x, y, rect.h, rect.w], [0, 0], this._scale);
        }
    },
    /**
     * Create <code>UI.ViewGeometry.Rect</code> like object which has logical screen size.
     * <br><br>
     * Second parameter effects the origin point. It is as same as <code>convert()</code>'s sencond parameter, but
     * only one option is available with this method:<br><br>
     * <ul>
     * <li><b>-</b> <code><a href="Service.Display.ScreenManager.html#Origin">Origin.Offset</a></code>: Add offset value. It is good for root item in LetterBox and PanAndScan.
     * </ul>
     * @param {Service.Display.ScreenManager#Origin} origin Opition parameter about origin point. It supports <code>Offset</code> only.
     * @returns {Service.Display.ScreenManager.Rect} Rect object similar to <code>UI.ViewGeometry.Rect</code>.
     */
    getFullScreenRect: function (origin)
    {
        var OriginEnum = Origin;
        switch (origin)
        {
        case OriginEnum.Offset:
        case "offset":
            return new Rect([0, 0, this.logicalSize[0], this.logicalSize[1]], this._offset, this._scale);
        default:
            return new Rect([0, 0, this.logicalSize[0], this.logicalSize[1]], [0, 0], this._scale);
        }
    },
    /**
     * This method shows letter box. Only one letter box is available even if you register several settings.
     * If the setting's type is not "LetterBox", no letter box shows.
     * @param {Service.Display.ScreenManager#LetterBoxType|String} [type] Letter box type. Default is GL2. 
     */
    showLetterBox: function (type)
    {
        this._screen._clearLetterBox();
    },
    /**
     * This method hides letter box.
     */
    hideLetterBox: function ()
    {
        this._screen._clearLetterBox();
    }
});

/** @private */
var _BlindSetting = ScreenSetting.subclass(
{
    initialize: function ($super, screen, setting)
    {
        $super(screen, setting);
        var widthScale = screen.width / this.logicalSize[0];
        var heightScale = screen.height / this.logicalSize[1];
        var scale = this._scale = Math.min(widthScale, heightScale);
        var boxSize = [Math.ceil(screen.width - scale * this.logicalSize[0]),
                       Math.ceil(screen.height - scale * this.logicalSize[1])];
        if (boxSize[0] < boxSize[1])
        {
//            // horizontal letterbox
//            var letterboxHeight = boxSize[1];
//            this._letterboxFrame = {
//                x: 0,
//                y: screen.height - letterboxHeight,
//                w: screen.width,
//                h: letterboxHeight
//            };
            this._setTaller(screen.width, screen.height, boxSize[1]);
        }
        else
        {
//            // vertical letterbox
//            var letterboxWidth = boxSize[0];
//            this._letterboxFrame = {
//                x: screen.width - letterboxWidth,
//                y: 0,
//                w: letterboxWidth,
//                h: screen.height
//            };
            this._setWider(screen.width, screen.height, boxSize[0]);
        }
    },
    showLetterBox: function (type)
    {
        if (type === undefined)
        {
            type = LetterBoxType.GL2;
        }
        this._screen._clearLetterBox();
        switch (type)
        {
        case "GL2":
        case LetterBoxType.GL2:
            this._showLetterBoxGL2();
            break;
        case "UI":
        case LetterBoxType.UI:
            this._showLetterBoxUI();
            break;
        default:
            console.log("<ScreenManager.showLetterBox> type must be GL2 or UI");
        }
    },
    _showLetterBoxGL2: function ()
    {
        var Primitive = require('../../../NGCore/Client/GL2/Primitive').Primitive;
    var i;
    for (i=0; i<this._letterboxFrames.length; ++i)
    {
      var letterBox = new Primitive();
      letterBox.setType(Primitive.Type.TriangleStrip);
      var rect = this._letterboxFrames[i];
      letterBox.pushVertex(new Primitive.Vertex([0, 0], [0, 0], [0, 0, 0]));
      letterBox.pushVertex(new Primitive.Vertex([rect.w, 0], [0, 0], [0, 0, 0]));
      letterBox.pushVertex(new Primitive.Vertex([0, rect.h], [0, 0], [0, 0, 0]));
      letterBox.pushVertex(new Primitive.Vertex([rect.w, rect.h], [0, 0], [0, 0, 0]));
      letterBox.setPosition(rect.x, rect.y);
      letterBox.setDepth(99999999);
      this._screen._appendLetterBoxGL2(letterBox);
    }
    },
    _showLetterBoxUI: function ()
    {
        var View = require('../../../NGCore/Client/UI/View').View;
        var i;
        for (i=0; i<this._letterboxFrames.length; ++i)
        {
            var rect = this._letterboxFrames[i];
            letterBox = new View({
                frame: [rect.x, rect.y, rect.w, rect.h],
                backgroundColor: "FF000000"
            });
            this._screen._appendLetterBoxUI(letterBox);
        }
    }
});

/** @private */
var LetterBoxSetting = _BlindSetting.subclass(
{
    _setTaller: function (screenWidth, screenHeight, extraHeight)
    {
        this._letterboxFrames.push({x:0, y:0, w:screenWidth, h: Math.ceil(extraHeight/2)});
        this._letterboxFrames.push({x:0, y:screenHeight-Math.ceil(extraHeight/2), w:screenWidth, h: Math.ceil(extraHeight/2)});
        this._offset = [0, Math.floor(extraHeight / 2)];
    },
    _setWider: function (screenWidth, screenHeight, extraWidth)
    {
        this._letterboxFrames.push({x:0, y:0, w:Math.ceil(extraWidth/2), h:screenHeight});
        this._letterboxFrames.push({x:screenWidth-Math.floor(extraWidth/2), y:0, w:Math.ceil(extraWidth/2), h:screenHeight});
        this._offset = [Math.floor(extraWidth / 2), 0];
    }
});

/** @private */
var TopLeftSetting = _BlindSetting.subclass(
{
    _setTaller: function (screenWidth, screenHeight, extraHeight)
    {
        this._letterboxFrames.push({x:0, y:screenHeight-extraHeight, w:screenWidth, h: extraHeight});
    },
    _setWider: function (screenWidth, screenHeight, extraWidth)
    {
        this._letterboxFrames.push({x:screenWidth-extraWidth, y:0, w:extraWidth, h:screenHeight});
    }
});

/** @private */
var TopRightSetting = _BlindSetting.subclass(
{
    _setTaller: function (screenWidth, screenHeight, extraHeight)
    {
        this._letterboxFrames.push({x:0, y:screenHeight-extraHeight, w:screenWidth, h: extraHeight});
    },
    _setWider: function (screenWidth, screenHeight, extraWidth)
    {
        this._letterboxFrames.push({x:0, y:0, w:extraWidth, h:screenHeight});
        this._offset = [extraWidth, 0];
    }
});

/** @private */
var BottomLeftSetting = _BlindSetting.subclass(
{
    _setTaller: function (screenWidth, screenHeight, extraHeight)
    {
        this._letterboxFrames.push({x:0, y:0, w:screenWidth, h: extraHeight});
        this._offset = [0, extraHeight];
    },
    _setWider: function (screenWidth, screenHeight, extraWidth)
    {
        this._letterboxFrames.push({x:screenWidth-extraWidth, y:0, w:extraWidth, h:screenHeight});
    }
});

/** @private */
var BottomRightSetting = _BlindSetting.subclass(
{
  _setTaller: function (screenWidth, screenHeight, extraHeight)
  {
      this._letterboxFrames.push({x:0, y:0, w:screenWidth, h: extraHeight});
      this._offset = [0, extraHeight];
  },
    _setWider: function (screenWidth, screenHeight, extraWidth)
  {
      this._letterboxFrames.push({x:0, y:0, w:extraWidth, h:screenHeight});
      this._offset = [extraWidth, 0];
  }
});

/** @private */
var PanAndScanSetting = ScreenSetting.subclass(
{
    initialize: function ($super, screen, setting)
    {
        $super(screen, setting);
        var widthScale = screen.width / this.logicalSize[0];
        var heightScale = screen.height / this.logicalSize[1];
        var scale = this._scale = Math.max(widthScale, heightScale);
        this._offset = [~~ ((screen.width - scale * this.logicalSize[0])*0.5),
                        ~~ ((screen.height - scale * this.logicalSize[1])*0.5)];
    }
});

/** @private */
var FixSetting = ScreenSetting.subclass(
{
    initialize: function ($super, screen, setting)
    {
        setting.logicalSize = [screen.width, screen.height];
        $super(screen, setting);
        this._scale = 1;
    }
});

/** @private */
var FixHeightSetting = ScreenSetting.subclass(
{
    initialize: function ($super, screen, setting)
    {
        var logicalHeight = setting.logicalHeight;
        var scale = this._scale = screen.height / logicalHeight;
        var logicalWidth = screen.width / scale;
        setting.logicalSize = [logicalWidth, logicalHeight];
        $super(screen, setting);
    }
});

/** @private */
var FixWidthSetting = ScreenSetting.subclass(
{
    initialize: function ($super, screen, setting)
    {
        var logicalWidth = setting.logicalWidth;
        var scale = this._scale = screen.width / logicalWidth;
        var logicalHeight = screen.height / scale;
        setting.logicalSize = [logicalWidth, logicalHeight];
        $super(screen, setting);
    }
});

var ScreenManagerImpl = ServerSync.subclass(
/** @lends Service.Display.ScreenManager.prototype */
{
    classname: 'ScreenManager',
    /**
     * Error code for JSON reader method.
     * @namespace error
     */
    error:
    {
        /** No error */
        NONE: 0,
        /** Arguments error */
        ARGUMENTS: 1,
        /** JSON parse error */
        JSON_PARSE: 2,
        /** JSON format error */
        JSON_FORMAT: 3,
        /** Asset is not found */
        ASSET_NOT_FOUND: 4
    },
    /**
     * These settings are used for calculating coordinate conversion.
     * @namespace
     */
    Origin: {
        /** Adds screen offset */
        Offset: 1,
        /** Sets oordinate's origin to center of screen */
        Center: 2
    },
    /**
     * These settings are used for letter box.
     * @namespace
     */
    LetterBoxType: {
        /** Letter Box is drawn by GL2 */
        GL2: 0,
        /** Letter Box is drawn by UI */
        UI: 1
    },
    /**
     * @class The <code>ScreenManager</code> class constructs object that management screen size.
     * @property {Number} width (readonly) Physical screen width.
     * @property {Number} height (readonly) Physical screen height.
     * @constructs The default constructor.
     * @augments Service.Data.ServerSync
     * @name Service.Display.ScreenManager
     */
    initialize: function ()
    {
        this._glview = null;
        this._hasGLViewLoaded = false;
        this._tablet = false;
        this._init = false;
        this.settings = {};
        this._default = null;
        this._letterboxes = [];
        this._callbackReplacement = null;
    },
    /**
     * Initializes screen setting and <code>UI.GLView</code>. This method sets screen portrait mode.
     *
     * @param {Function} [callback] Callback function which is passed <code>UI.GLView.onLoad</code>.
     */
    setPortrait: function (callback)
    {
        this._initScreenSize();
        if (this._tablet)
        {
            this._initRotation(callback, "portrait", "LandscapeRight");
        }
        else
        {
            this._initRotation(callback, "portrait");
        }
    },
    /**
     * Initializes screen setting and <code>UI.GLView</code>. This method sets screen portrait mode.
     *
     * @param {Function} [callback] Callback function which is passed <code>UI.GLView.onLoad</code>.
     */
    setLandscape: function (callback)
    {
        this._initScreenSize();
        if (!this._tablet)
        {
            this._initRotation(callback, "landscape", "LandscapeLeft");
        }
        else
        {
            this._initRotation(callback, "landscape");
        }
    },
    get width()
    {
        return this._width;
    },
    set width(value)
    {
        throw new Error("width property is readonly");
    },
    get height()
    {
        return this._height;
    },
    set height(value)
    {
        throw new Error("height property is readonly");
    },

    /**
     * Loads config settings from data file.
     * <br><br>
     * If the orientaion parameter is in data, <br>callback</br> is called when <code>setPortrait()</code>
     * or <code>setLandscape()</code> is finishded. Otherwise, it called when finish loading. In this case,
     * first parameter of callback is error code.
     * @param {String} filename File name of data file.
     * @param {Function} [callback] Callback function.
     * @name Service.Display.ScreenManager.loadConfigFromFile
     */
    /**
     * Loads config data from data.
     * @param {String|Object} jsonData JSON string or Object.
     * @param {Function} [callback] Callback function.
     * @name Service.Display.ScreenManager.loadConfigFromData
     */
    /**
     * Registers new settings. Available types are described at <code>ScreenManager.ScreenSetting<code>.
     * This method accept JSON data. JSON data needed following parameter:
     * <pre class="code">
     * // register
     * ScreenManager.register({
     *     type: "LetterBox",
     *     name: "field",
     *     logicalSize: [480, 320]
     * });
     * </pre>
     * @param {JSON} settingJson setting information.
     * @param {String} settingJson.type Setting type.
     * @param {String} settingJson.name Name for register. Registered setting is accessed via this name.
     * @param {Number[]} settingJson.logicalSize Needed for LetterBox and PanAndScan. It is resolution of logical screen.
     * @param {Number} settingJson.logicalWidth Needed for FixWidth.
     * @param {Number} settingJson.logicalHeight Needed for FixHeight.
     */
    register: function (settingJson)
    {
        if (!this._init) {
            throw new Error("ScreenManager is not initialized. call setPortrait() or setHorizontal() first.");
        }
        var setting;
        switch (settingJson.type)
        {
        case "LetterBox":
            setting = new LetterBoxSetting(this, settingJson);
            break;
        case "TopLeft":
            setting = new TopLeftSetting(this, settingJson);
            break;
        case "TopRight":
            setting = new TopRightSetting(this, settingJson);
            break;
        case "BottomLeft":
            setting = new BottomLeftSetting(this, settingJson);
            break;
        case "BottomRight":
            setting = new BottomRightSetting(this, settingJson);
            break;
        case "PanAndScan":
            setting = new PanAndScanSetting(this, settingJson);
            break;
        case "Fix":
            setting = new FixSetting(this, settingJson);
            break;
        case "FixWidth":
            setting = new FixWidthSetting(this, settingJson);
            break;
        case "FixHeight":
            setting = new FixHeightSetting(this, settingJson);
            break;
        default:
            throw new Error("Unknown Screen Setting Type: " + settingJson.type);
        }
        this.settings[setting.name] = setting;
    },
    /**
     * Sets one of settings default. Following methods and properties's shortcut are available.
     * <ul>
     * <li><code>scale</code>(readonly property)</li>
     * <li><code>offset</code>(readonly property)</li>
     * <li><code>logicalSize</code>(readonly property)</li>
     * <li><code>convert()</code></li>
     * <li><code>convertRect()</code></li>
     * <li><code>createRect()</code></li>
     * <li><code>getRootNode()</code></li>
     * <li><code>getFullScreenRect()</code></li>
     * <li><code>showLetterBox()</code></li>
     * </ul>
     * <pre class="code">
     * ScreenManager.register({type:"LetterBox", name:"field", logicalSize:[800, 480]});
     * // No default version
     * var position = ScreenManager.settings.field.convert(100, 200);
     * // Use default
     * ScreenManager.setDefault("field");
     * var position = ScreenManager.convert(100, 200);
     * </pre>
     * @param {String} key It should be the name which is already registered by <code>register()</code> method.
     */
    setDefault: function (key)
    {
        var defaultSetting = this.settings[key];
        if (!defaultSetting)
        {
            throw new Error("Undefined setting: " + key);
        }
        this._default = defaultSetting;
    },
    /**
     * @field It is alias to default setting.
     * @type Number
     */
    get scale()
    {
        return this._default.scale;
    },
    /** @private */
    set scale(value)
    {
        throw new Error("scale property is readonly");
    },
    /**
     * @field It is alias to default setting.
     * @type Number
     */
    get offset()
    {
        return this._default.offset;
    },
    /** @private */
    set offset(value)
    {
        throw new Error("offset property is readonly");
    },
    /**
     * @field It is alias to default setting.
     * @type [Number, Number]
     */
    get logicalSize()
    {
        return this._default.logicalSize;
    },
    /** @private */
    set logicalSize(value)
    {
        throw new Error("logicalSize property is readonly");
    },
    /**
     * @field True if glView has been loaded, false otherwise.
     * @type Boolean
     */
    get hasGLViewLoaded()
    {
        return this._hasGLViewLoaded;
    },
    /** @private */
    set hasGLViewLoaded(value)
    {
        throw new Error("hasGLViewLoaded property is readonly");
    },

    /**
     * This method is alias to default setting.
     *
     * @param {Number} number Input value for calulation.
     * @returns {Number} Converted value.
     *
     * @see Service.Display.ScreenManager.ScreenSetting#convertNumber
     */
    convertNumber: function (number)
    {
        return this._default.convertNumber(number);
    },
    /**
     * This method is alias to default setting.
     * @param {Number[]} coordinate Input position
     * @returns {Number[]} Converted coordinate.
     * @see Service.Display.ScreenManager.ScreenSetting#convert
     */
    convert: function (coordinate, origin)
    {
        return this._default.convert(coordinate, origin);
    },
    /**
     * This method is alias to default setting.
     * @param {Object} rect Logical rectangle frame.
     * @param {Service.Display.ScreenManager#Origin} origin Opition parameter about origin point.
     * @returns {UI.ViewGeometry.Rect} Converted rect.
     * @see Service.Display.ScreenManager.ScreenSetting#convertRect
     */
    convertRect: function (rect, origin)
    {
        return this._default.convertRect(rect, origin);
    },
    /**
     * This method is alias to default setting.
     * @param {Object} rect Logical rectangle frame.
     * @param {Service.Display.ScreenManager#Origin} origin Opition parameter about origin point.
     * @returns {Service.Display.ScreenManager.Rect} Rect object similar to <code>UI.ViewGeometry.Rect</code>.
     * @see Service.Display.ScreenManager.ScreenSetting#createRect
     */
    createRect: function (rect, origin)
    {
        return this._default.createRect(rect, origin);
    },
    /**
     * This method is alias to default setting.
     * @returns {GL2.Node} Root node for GL2 nodes.
     * @see Service.Display.ScreenManager.ScreenSetting#getRootNode
     */
    getRootNode: function ()
    {
        return this._default.getRootNode();
    },
    /**
     * This method is alias to default setting.
     * @param {Service.Display.ScreenManager#LetterBoxType|String} [type] Letter box type. Default is GL2. 
     * @see Service.Display.ScreenManager.ScreenSetting#showLetterBox
     */
    showLetterBox: function (type)
    {
        this._default.showLetterBox(type);
    },
    /**
     * This method is alias to default setting.
     * @param {Service.Display.ScreenManager#Origin} origin Opition parameter about origin point. It supports <code>Offset</code> only.
     * @returns {Service.Display.ScreenManager.Rect} Rect object similar to <code>UI.ViewGeometry.Rect</code>.
     * @see Service.Display.ScreenManager.ScreenSetting#getFullScreenRect
     */
    getFullScreenRect: function (origin)
    {
        return this._default.getFullScreenRect(origin);
    },
    /** @private */
    __onLoadData : function (data, param, callback)
    {
        if (data.orientation)
        {
            var func = 'set' + data.orientation;
            if (this[func])
            {
                this[func](callback);
            }
            else
            {
                this.setPortrait(callback);
            }

            this._registerJsonData(data);
            if (data.defaultScreen)
            {
                this.setDefault(data.defaultScreen);
            }
        }
        else
        {
            this._registerJsonData(data);
            if (data.defaultScreen)
            {
                this.setDefault(data.defaultScreen);
            }
            if (callback) {
                callback();
            }
        }
        return true;
    },
    /** @private */
    _clearLetterBox: function ()
    {
    var i;
    for (i=0; i<this._letterboxes.length; ++i)
    {
        this._letterboxes[i].destroy();
    }
    this._letterboxes = [];
    },
    /** @private */
    _appendLetterBoxGL2: function (node)
    {
        var Root = require('../../../NGCore/Client/GL2/Root').Root;
        this._letterboxes.push(node);
        Root.addChild(node);
    },
    /** @private */
    _appendLetterBoxUI: function (view)
    {
        var Window = require('../../../NGCore/Client/UI/Window').Window;
        this._letterboxes.push(view);
        Window.document.addChild(view);
    },
    /** @private */
    _registerJsonData : function (data)
    {
        // we need to convert the data rep into a rep we can use in the class
        if (data.screens)
        {
            var prop;
            for (prop in data.screens)
            {
                if (data.screens.hasOwnProperty(prop))
                {
                    data.screens[prop].name = prop;
                    this.register(data.screens[prop]);
                }
            }
        }
        else
        {
            console.log("<NGGO Screen> Screen data file is not formated in the correct style.");
        }
    },
    /** @private */
    _interruptCallback: function (newCallback)
    {
        this._callbackReplacement = newCallback;
    },
    /** @private */
    _initScreenSize: function ()
    {
        var Core = require('../../../NGCore/Client/Core').Core;
        var height = Core.Capabilities.getScreenHeight();
        var width = Core.Capabilities.getScreenWidth();
        if (width > height)
        {
            // Tablet
            this._tablet = true;
            this._width = width;
            this._height = height;
        }
        else
        {
            this._width = height;
            this._height = width;
        }
    },
    /** @private */
    _initRotation: function (callback, orientation, rotateDirection)
    {
        var UI = require('../../../NGCore/Client/UI').UI;
        var Root = require('../../../NGCore/Client/GL2/Root').Root;
        var OrientationEmitter = require('../../../NGCore/Client/Device/OrientationEmitter').OrientationEmitter;
        switch (rotateDirection)
        {
        case "LandscapeLeft":
            OrientationEmitter.setInterfaceOrientation(OrientationEmitter.Orientation.LandscapeLeft);
            break;
        case "LandscapeRight":
            OrientationEmitter.setInterfaceOrientation(OrientationEmitter.Orientation.LandscapeRight);
            break;
        default:
            break;
        }
        switch (orientation)
        {
        case "portrait":
            this._width = Math.min(UI.Window.outerWidth, UI.Window.outerHeight);
            this._height = Math.max(UI.Window.outerWidth, UI.Window.outerHeight);
            break;
        case "landscape":
            this._width = Math.max(UI.Window.outerWidth, UI.Window.outerHeight);
            this._height = Math.min(UI.Window.outerWidth, UI.Window.outerHeight);
            break;
        default:
            break;
        }

        if (!this._init)
        {
            this._callback = callback || function(){};
            var self = this;
            var glview = new UI.GLView(
            {
                frame : [0, 0, this._width, this._height],
                onLoad : function () {
                    Root.instantiate();
                    if (self._callbackReplacement)
                    {
                        self._callbackReplacement(self._callback);
                    }
                    else
                    {
                        self._callback();
                    }
                    self._hasGLViewLoaded = true;
                }
            });
            glview.setActive(true);
            this._glview = glview;
            this._init = true;
        }
        else
        {
            this._callback = callback || function(){};
            this._callback(new Error("[ScreenManager._initRotation()] It is not first call."));
        }

        this.register(
        {
            type: "Fix",
            name:"physical"
        });
    }
});
exports.ScreenManagerImpl = ScreenManagerImpl;
exports.ScreenManager = ScreenManagerImpl.singleton({});
