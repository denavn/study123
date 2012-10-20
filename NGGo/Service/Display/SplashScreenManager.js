////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Taha S.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
// ngCore
var Color = require('../../../NGCore/Client/Core/Color').Color;
var Vector = require('../../../NGCore/Client/Core/Vector').Vector;
var MessageListener = require('../../../NGCore/Client/Core/MessageListener').MessageListener;
var Capabilities = require('../../../NGCore/Client/Core/Capabilities').Capabilities;
var Sprite = require('../../../NGCore/Client/GL2/Sprite').Sprite;
var TouchTarget = require('../../../NGCore/Client/GL2/TouchTarget').TouchTarget;
var Node = require('../../../NGCore/Client/GL2/Node').Node;
var Primitive = require('../../../NGCore/Client/GL2/Primitive').Primitive;
var Root = require('../../../NGCore/Client/GL2/Root').Root;
var Window = require('../../../NGCore/Client/UI/Window').Window;
var View = require('../../../NGCore/Client/UI/View').View;
var Spinner = require('../../../NGCore/Client/UI/Spinner').Spinner;
// ngGo
var Util = require('../../GLUI/Util').Util;
var ScreenManager = require('../Display/ScreenManager').ScreenManager;
var AudioManager = require('../Audio/AudioManager').AudioManager;
var Fader = require('../Graphics/Fader').Fader;
var ServerSync = require('../Data/ServerSync').ServerSync;
exports.SplashScreenManager = ServerSync.singleton( /** @lends Service.Display.SplashScreenManager.prototype */
{
    classname: "SplashScreenManager",
    /**
     * @class The <code>SplashScreenManager</code> class extends ServerSync and is a singleton class to display Splash Screens.
     * <b>Note:</b> You can use this class directly.
     * @constructs The default constructor.
     * @borrows Foundation.Observable#addObserver
     * @borrows Foundation.Observable#deleteObserver
     * @borrows Foundation.Observable#deleteObservers
     * @borrows Foundation.Observable#countObservers
     * @borrows Foundation.Observable#notify
     * @name Service.Display.SplashScreenManager
     * @augments ServerSync
     */
    initialize: function ()
    {
        this._splashData = null;
        this._orientation = this.ORIENTATION.PORTRAIT;
        this._splashView = null;
        this._count = -1;
        this._image = null;
        this._callBackFunc = null;
        this._fader = null;
        this._primitive = null;
        this._width = 0;
        this._height = 0;
        this._timeoutKey = null;
        this._isIdle = false;
        this._bgMusic = false;
        this._picMusic = false;
        this._screen = null;
        this._screenSize = null;
        this._touchTargetMode = true;
        this._shouldSkipIdle = false;
        this._touchTarget = null;
        this._messageListener = null;
        this._shouldWait = true;
        this._spinner = undefined;
        this._initialBackground = undefined;
        this._isRunning = false;
    },
    /**
     * Orientation
     * @namespace
     */
    ORIENTATION: {
        LANDSCAPE: 1,
        PORTRAIT: 2
    },
    /**
     * Starts splash Screen. Data must be loaded using loadConfigFromData() or loadConfigFromFile
     * before calling it otherwise data would be undefined.
     *
     * @param {function}callBackFunc Call back function(optional parameter).
     * @param {GL2.Node}node node is optional parameter if it is not provided new GL2.Node will be created.
     * @example  var splashData = {
     *     orientation: SplashScreenManager.ORIENTATION.PORTRAIT,
     *     screenName: "splash",
     *     sound: './Content/music.mp3',
     *     splashes: [
     *         {
     *             id: "Main Splash Screen",
     *             wait:true,
     *             image: {
     *                 src: "./Content/background.png",
     *                 size: [300, 400],
     *                 uv: [0, 0, 0.3, 0.5]
     *             },
     *             background: "FFFFFF"
     *         },
     *         {
     *             image: {
     *                 src: "./Content/blue.png",
     *                 size: [400, 300]
     *             },
     *             background: [0.2, 0.1, 0.1],
     *             duration: 3000,
     *             fadeIn: {
     *                 color: [0.2, 1, 0.1],
     *                 easeFunc: Ops.easeInQuad,
     *                 duration: 500
     *             },
     *             fadeOut: new Fader("FFFFFF", Ops.easeOutQuad, 500)
     *         }
     *     ]
     * };
     * SplashScreenManager.loadConfigFromData(splashData);
     * SplashScreenManager.start() or SplashScreenManager.start(callBackfunc) or SplashScreenManager.start(callBackfunc,node)
     */
    start: function (callBackFunc, node)
    {
        if (this._initialBackground)
        {
            this._initialBackground.destroy();
            this._initialBackground = undefined;
        }
        if (this._spinner)
        {
            this._spinner.destroy();
            this._spinner = undefined;
        }
        if (this._isRunning)
        {
            this.abort();
        }
        this._isRunning = true;
        if (this._splashData)
        {
            if (typeof (callBackFunc) === "function")
            {
                this._callBackFunc = callBackFunc;
            }
            if (node instanceof Node)
            {
                this._splashView = node;
            }
            else if (this._screen)
            {
                this._splashView = this._screen.getRootNode();
            }
            else if (!node)
            {
                this._splashView = Root;
            }
            else
            {
                throw new Error('node should be an instance of GL2.Node.');
            }
            //add and play sound
            if (this._splashData.sound && typeof (this._splashData.sound) === "string")
            {
                this._addSound("bgMusic", this._splashData.sound);
                this._bgMusic = true;
            }
            this._setOrientation();
            if (this._screen)
            {
                this._screenSize = this._screen.logicalSize;
            }
            this.next();
        }
        else
        {
            throw new Error('Data is undefined or null. Data should be loaded using loadConfigFromData()/loadConfigFromFile()');
        }
    },
    /**
     * When this function is called, if SplashScreenManager is waiting, progress is resumed and but if it's not waiting
     * SplashScreenManager will create a TouchTarget, and upon receiving touch, it will skip the progress. FadeIn/FadeOut will still occur.
     */
    enableSkip: function ()
    {
        if (this._touchTargetMode && !this._touchTarget)
        {
            this._touchTarget = new TouchTarget();
            this._touchTarget.setAnchor(0, 0);
            this._touchTarget.setSize(this._width, this._height);
            this._messageListener = new MessageListener();
            this._touchTarget.getTouchEmitter().addListener(this._messageListener, this._onTouch.bind(this));
            this._splashView.addChild(this._touchTarget);
            return;
        }
        this._shouldWait = false;
        if (this._isIdle)
        {
            this._isIdle = false;
            this._loadFadeOut();
        }
    },
    /**
     * Aborts splashScreen process and calls callBackFunc function if it was defined in start function.
     */
    abort: function ()
    {
        this._clearTimeOut();
        this._clearFader();
        this._clearPicMusic();
        if (this._bgMusic)
        {
            AudioManager.stopMusic();
            AudioManager.removeMusic("bgMusic");
        }
        this._bgMusic = false;
        if (this._touchTarget)
        {
            this._touchTarget.getTouchEmitter().removeListener(this._messageListener);
            this._touchTarget.destroy();
            this._touchTarget = null;
        }
        if (this._messageListener)
        {
            this._messageListener.destroy();
            this._messageListener = null;
        }
        if (this._image)
        {
            this._image.destroy();
            delete this._image;
        }
        this._clearPrimitive();
        delete this._splashView;
        this._isIdle = false;
        delete this._splashData;
        this._orientation = this.ORIENTATION.PORTRAIT;
        this._count = -1;
        this._width = 0;
        this._height = 0;
        this._screen = null;
        if (this._screenSize.length)
        {
            this._screenSize.length = 0;
        }
        this._screenSize = null;
        this._touchTargetMode = true;
        this._shouldSkipIdle = false;
        this._shouldWait = true;
        this._spinner = undefined;
        this._initialBackground = undefined;
        this._isRunning = false;
        if (this._callBackFunc)
        {
            this._callBackFunc();
        }
        this._callBackFunc = null;
    },
    /**
     * Displays next splash screen. If duration of any splash is set 0 in the splashData, this function will have to be called from outside.
     * @example SplashScreenManager.next();
     */
    next: function ()
    {
        if (!this._isRunning)
        {
            throw new Error("next() called before start()");
        }
        if (this._splashData)
        {
            if (this._isIdle)
            {
                this._isIdle = false;
                this._loadFadeOut();
                return;
            }
            this._clearTimeOut();
            this._clearFader();
            this._clearPrimitive();
            this._clearPicMusic();
            this._count++;
            if (this._count >= this._splashData.splashes.length)
            {
                this.abort();
            }
            else
            {
                if (this._count === 0)
                {
                    this.notify("onStartBackgroundTask", this._splashView);
                }
                var splashes = this._splashData.splashes[this._count];
                if (typeof (splashes.sound) === "string")
                {
                    this._addSound("picMusic", splashes.sound);
                    this._picMusic = true;
                }
                var background = this._getBackgroundColor(splashes.background);
                this._drawPrimitive(background);
                //checks for image
                if (splashes.image instanceof Object)
                {
                    if (!this._image)
                    {
                        var w = this._width;
                        var h = this._height;
                        if (this._screen)
                        {
                            w = this._screenSize[0];
                            h = this._screenSize[1];
                        }
                        this._image = new Sprite();
                        this._image.setPosition(w / 2, h / 2);
                        this._splashView.addChild(this._image);
                    }
                    this._image.setImage(splashes.image.src, splashes.image.size ? splashes.image.size : this._screenSize, [0.5, 0.5], splashes.image.uv);
                    this._image.setColor(1, 1, 1);
                }
                else
                {
                    throw new Error('image needs to be object got ' + typeof (splashes.image) + '.');
                }
                //calls function on splash screen start--added by observer
                this.notify("onSplashStart", splashes.id, this._count + 1, this._splashView);
                // starts fader and bind idle()
                if (!splashes.fadeIn)
                {
                    this._idle();
                }
                else if (splashes.fadeIn instanceof Fader)
                {
                    this._fader = splashes.fadeIn;
                    this._fader.fadeIn(this._idle.bind(this));
                }
                else if (splashes.fadeIn instanceof Object)
                {
                    this._fader = new Fader(splashes.fadeIn.color, splashes.fadeIn.easeFunc, splashes.fadeIn.duration);
                    this._fader.fadeIn(this._idle.bind(this));
                }
                else
                {
                    throw new Error('fadeIn should be an Object or instance of Fader. Got ' + typeof (splashes.fadeIn) + '.');
                }
            }
        }
        else
        {
            throw new Error('Data is undefined or null. Data should be loaded using loadConfigFromData()/loadConfigFromFile()');
        }
    },
    /** @private */
    _idle: function ()
    {
        this._clearFader();
        if (this._splashData)
        {
            var splashes = this._splashData.splashes[this._count];
            if (this._shouldSkipIdle)
            {
                this._shouldSkipIdle = false;
                this._loadFadeOut();
            }
            if (splashes.wait && this._shouldWait)
            {
                this._isIdle = true;
                this._shouldWait = false;
                return;
            }
            var time = 3000;
            if (splashes.duration !== undefined && splashes.duration !== null && typeof (splashes.duration) === "number")
            {
                if (splashes.duration <= 0)
                {
                    this._isIdle = true;
                    return;
                }
                else
                {
                    time = splashes.duration;
                }
            }
            this._timeoutKey = setTimeout(this._loadFadeOut.bind(this), time);
        }
        else
        {
            throw new Error('Data is undefined or null. Data should be loaded using loadConfigFromData()/loadConfigFromFile()');
        }
    },
    /** @private */
    _loadFadeOut: function ()
    {
        this._timeoutKey = null;
        if (this._splashData)
        {
            var splashes = this._splashData.splashes[this._count];
            if (!splashes.fadeOut)
            {
                this._endOfSplash();
            }
            else if (splashes.fadeOut instanceof Fader)
            {
                this._fader = splashes.fadeOut;
                this._fader.fadeOut(this._endOfSplash.bind(this));
            }
            else if (splashes.fadeOut instanceof Object)
            {
                this._fader = new Fader(splashes.fadeOut.color, splashes.fadeOut.easeFunc, splashes.fadeOut.duration);
                this._fader.fadeOut(this._endOfSplash.bind(this));
            }
            else
            {
                throw new Error('fadeOut should be an Object or instance of Fader. Got ' + typeof (splashes.fadeOut) + '.');
            }
        }
        else
        {
            throw new Error('Data is undefined or null. Data should be loaded using loadConfigFromData()/loadConfigFromFile()');
        }
    },
    /** @private */
    _endOfSplash: function ()
    {
        if (this._splashData)
        {
            var splashes = this._splashData.splashes[this._count];
            this.notify("onSplashFinish", splashes.id, this._count + 1, this._splashView);
            if (this._count < this._splashData.splashes.length - 1)
            {
                this.next();
            }
            else
            {
                this.abort();
            }
        }
        else
        {
            throw new Error('Data is undefined or null. Data should be loaded using loadConfigFromData()/loadConfigFromFile()');
        }
    },
    /** @private */
    _clearTimeOut: function ()
    {
        if (this._timeoutKey)
        {
            clearTimeout(this._timeoutKey);
            this._timeoutKey = null;
        }
    },
    /** @private */
    _clearFader: function ()
    {
        if (this._fader)
        {
            this._fader.abort();
            this._fader.destroy();
            this._fader = null;
        }
    },
    /** @private */
    _clearPrimitive: function ()
    {
        if (this._primitive)
        {
            this._primitive.destroy();
            delete this._primitive;
        }
    },
    /** @private */
    _getBackgroundColor: function (color)
    {
        if (color)
        {
            if (color instanceof Array && color.length === 3)
            {
                return new Color(color[0], color[1], color[2]);
            }
            else if (typeof (color) === "string")
            {
                color = Util.hexToARGB(color);
                return new Color(color[1], color[2], color[3]);
            }
            else if (color instanceof Color)
            {
                return color;
            }
            else
            {
                throw new Error('Background color is expected to be an Array[r,g,b] or HEX or Core.Color.Got' + typeof (color) + '.');
            }
        }
        else
        {
            return new Color(1, 1, 1);
        }
    },
    /** Draw Primitive using the background Color
     * @private */
    _drawPrimitive: function (color)
    {
        if (this._primitive)
        {
            this._primitive.destroy();
            this._primitive = null;
        }
        this._primitive = new Primitive();
        this._primitive.setType(Primitive.Type.TriangleStrip);
        this._primitive.pushVertex(new Primitive.Vertex(new Vector(0, 0), [0.0, 0.0], color));
        this._primitive.pushVertex(new Primitive.Vertex(new Vector(0, this._height), [0.0, 0.0], color));
        this._primitive.pushVertex(new Primitive.Vertex(new Vector(this._width, 0), [0.0, 0.0], color));
        this._primitive.pushVertex(new Primitive.Vertex(new Vector(this._width, this._height), [0.0, 0.0], color));
        this._primitive.setDepth(-1);
        this._splashView.addChild(this._primitive);
    },
    /** @private */
    _addSound: function (key, soundPath)
    {
        if (this._bgMusic)
        {
            AudioManager.pauseMusic();
        }
        AudioManager.addMusic(key, soundPath);
        AudioManager.playMusic(key);
    },
    /** @private */
    _clearPicMusic: function ()
    {
        if (this._picMusic)
        {
            AudioManager.removeMusic("picMusic");
        }
        this._picMusic = false;
        if (this._bgMusic)
        {
            AudioManager.playMusic("bgMusic");
        }
    },
    /** @private */
    _setOrientation: function ()
    {
        if (this._splashData.orientation && this._splashData.orientation === this.ORIENTATION.LANDSCAPE)
        {
            this._width = Capabilities.getScreenHeight();
            this._height = Capabilities.getScreenWidth();
        }
        else
        {
            this._width = Capabilities.getScreenWidth();
            this._height = Capabilities.getScreenHeight();
        }
        this._screenSize = [this._width, this._height];
    },
    /** @private */
    __onLoadData: function (splashData)
    {
        this._splashData = splashData;
        this._validateData();
        if (this._splashData.screenName)
        {
            this._screen = ScreenManager.settings[this._splashData.screenName];
            if (!this._screen)
            {
                throw new Error('SplashScreenManager: screenName is not registered: ' + this._splashData.screenName);
            }
            ScreenManager._interruptCallback(this.start.bind(this));
        }
        var backgroundColor = "FF000000";
        if (this._splashData.splashes[0].background)
        {
            var bg = this._splashData.splashes[0].background;
            if (typeof (bg) === "string")
            {
                backgroundColor = bg;
            }
            else if (bg instanceof Array && bg.length === 3)
            {
                backgroundColor = (~~ (bg[0] * 255)).toString(16) + (~~ (bg[1] * 255)).toString(16) + (~~ (bg[2] * 255)).toString(16);
            }
            else if (bg instanceof Color)
            {
                var r = bg.getRed();
                var g = bg.getGreen();
                var b = bg.getBlue();
                backgroundColor = (~~ (r * 255)).toString(16) + (~~ (g * 255)).toString(16) + (~~ (b * 255)).toString(16);
            }
        }
        var width = Capabilities.getScreenWidth();
        var height = Capabilities.getScreenHeight();
        var length = Math.max(width, height);
        this._initialBackground = new View(
        {
            frame: [0, 0, length, length],
            backgroundColor: backgroundColor
        });
        Window.document.addChild(this._initialBackground);
        var size = length * 0.1;
        this._spinner = new Spinner();
        this._spinner.setFrame([width / 2 - size / 2, height / 2 - size / 2, size, size]);
        this._initialBackground.addChild(this._spinner);
    },
    /** @private */
    _onTouch: function (touch)
    {
        if (touch.getAction() === touch.Action.Start)
        {
            if (this._timeoutKey || this._isIdle)
            {
                this._clearTimeOut();
                this._isIdle = false;
                this._loadFadeOut();
                return;
            }
            this._shouldSkipIdle = true;
        }
    },
    /** @private */
    _validateData: function ()
    {
        if (this._splashData.orientation && typeof (this._splashData.orientation) === "number")
        {
            this._orientation = this._splashData.orientation;
        }
        else if (this._splashData.orientation && typeof (this._splashData.orientation) === "string" && this._splashData.orientation === "LANDSCAPE")
        {
            this._orientation = 1;
        }
        if (!this._splashData.splashes instanceof Array)
        {
            throw new Error('splashes needs to be Array got ' + typeof (this._splashData.splashes) + '.');
        }
        var splashes = this._splashData.splashes;
        var i;
        for (i = 0; i < splashes.length; i++)
        {
            if (!splashes[i] instanceof Object)
            {
                throw new Error('splashes[i] needs to be object got ' + typeof (splashes[i]) + ' , at index:' + i + '.');
            }
            if (splashes[i].wait)
            {
                this._touchTargetMode = false;
                this._shouldWait = true;
            }
        }
    }
});