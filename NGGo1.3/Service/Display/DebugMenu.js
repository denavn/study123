////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
// ngCore
var Class = require('../../../NGCore/Client/Core/Class').Class;
var Button = require('../../../NGCore/Client/UI/Button').Button;
var Gravity = require('../../../NGCore/Client/UI/ViewGeometry').Gravity;
var Window = require('../../../NGCore/Client/UI/Window').Window;
// ngGo
var ScreenManager = require('./ScreenManager').ScreenManager;
var PreferencePage = require('./_DebugMenu/PreferencePage').PreferencePage;
var UnitTestPage = require('./_DebugMenu/UnitTestPage').UnitTestPage;
var SceneTestPage = require('./_DebugMenu/SceneTestPage').SceneTestPage;
var GL2Page = require('./_DebugMenu/GL2Page').GL2Page;
var UIPage = require('./_DebugMenu/UIPage').UIPage;

exports.DebugMenu = Class.singleton( /** @lends Service.Display.DebugMenu.prototype */
{
    classname: "DebugMenu",
    Mode: {
        Setting: 0,
        UnitTest: 1,
        SceneTest: 2,
        GL2Tree: 3,
        UITree: 4,
        System: 5
    },
    /**
     * @class The <code>DebugMenu</code> class constructs object to create GUI
     * to control <code>PreferenceManager</code>.
     *
     * @constructs
     * @name Service.Display.DebugMenu
     * @augments Core.Class
     */
    initialize: function ()
    {
        this._currentKey = "";
        this._button = null;
        this._settings = undefined;
        this._updaters = [];
        this._mode = this.Mode.Setting;
        this._page = undefined;
        this._unittests = [];
        this._testscenes = [];
        this._memorySnapshot = null;
    },
    /**
     * Creates debug button.
     * @param {Object} opts Parameters for debug button. See above.
     * @param {Number} opts.logicalWidth It is used for <code>Screen</code> initialization of debug window. Default value is 320.
     * @param {Object} opts.frame Debug button layout. Default value is <code>{x:-50, y:-50, w:50, h:50}</code>
     * @param {String} opts.text The label of debug button. Default is <code>"Debug"</code>.
     * @param {Number} opts.textSize The size of debug button label. Default is <code>12</code>.
     * @param {String} opts.key The layer of debug menu in PreferenceMangager. Default is <code>""</code>.
     */
    createButton: function (opts)
    {
        opts = opts || {};
        var that = this;
        if (!this._button)
        {
            var logicalWidth = opts.logicalWidth || 320;
            this._screen = ScreenManager.settings.physical;
            this._button = new Button(this._baseDesign({
                gradient:
                {
                    corners: '8 8 8 8',
                    outerLine: "FFFFFF 1.5",
                    gradient: ["AA000000 0.0", "AA000000 1.0"]
                },
                onClick: function (event)
                {
                    that._button.setVisible(false);
                    that._showMenu();
                }
            }));
            Window.document.addChild(this._button);
        }
        var frame = opts.frame || {
            x: -50,
            y: -50,
            w: 50,
            h: 50
        };
        this._button.setFrame(this._screen.convertRect(frame).array());
        this._button.setText(opts.label || "Debug");
        this._button.setTextSize(this._screen.convertNumber(opts.labelSize || 12));
        this._button.hide = true;
        this._currentKey = opts.key || "";
    },
    /**
     * Destory debug button.
     */
    destroyButton: function ()
    {
        if (this._button)
        {
            this._button.destroy();
            this._button = null;
        }
    },
    /**
     * Registers unittest. This function support Jasmine.
     * Registered unittest is called from DebugMenu.
     * @param {Function} testdescription Test definition.
     */
    registerUnitTest: function (testdescription)
    {
        this._unittests.push(testdescription);
    },
    /**
     * Registers a scene for deguggin. Registered scenes can
     * run evertime from DebugMenu.
     * @param {Framework.Scene.Scene} scene A Scene object
     * @param {[String]} sceneName Scene name.
     * @param {[option]} option This option is passed to Scene event.
     */
    registerDebugScene: function (scene, sceneName, option)
    {
        if (typeof sceneName !== "string")
        {
            option = sceneName;
            if (scene.sceneName)
            {
                sceneName = scene.sceneName;
            }
            else
            {
                sceneName = "Scene " + (this._testscenes.length + 1);
            }
        }
        this._testscenes.push([sceneName, scene, option]);
    },
    /** @private */
    _showMenu: function (mode)
    {
        if (mode !== undefined)
        {
            this._mode = mode;
        }
        var self = this;
        var callback = function (page)
            {
                if (page === undefined)
                {
                    if (self._button)
                    {
                        self._button.setVisible(true);
                    }
                }
                else
                {
                    self._showMenu(page);
                }
            };
        var page;
        switch (this._mode)
        {
        case this.Mode.Setting:
            page = new PreferencePage(this._screen, this._currentKey, callback);
            break;
        case this.Mode.UnitTest:
            page = new UnitTestPage(this._screen, this._unittests, callback);
            break;
        case this.Mode.SceneTest:
            page = new SceneTestPage(this._screen, this._testscenes, callback);
            break;
        case this.Mode.GL2Tree:
            page = new GL2Page(this._screen, undefined, callback);
            break;
        case this.Mode.UITree:
            page = new UIPage(this._screen, undefined, callback);
            break;
        case this.Mode.System:
            var SystemPage = require('./_DebugMenu/SystemPage').SystemPage;
            page = new SystemPage(this._screen, undefined, callback);
            break;
        default:
            return;
        }
        page.showMenu();
    },
    /** @private */
    _baseDesign: function (opts)
    {
        var design = {
            gradient: {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: ["00000000 0.0", "00000000 1.0"]
            },
            textColor: "FFFFFF",
            highlightedGradient: {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: ["FFFFFF 0.0", "FFFFFF 1.0"]
            },
            highlightedTextColor: "000000",
            textGravity: Gravity.Center
        };
        var key;
        for (key in opts)
        {
            if (opts.hasOwnProperty(key))
            {
                design[key] = opts[key];
            }
        }
        return design;
    },
    /** @private */
    _getMemorySnapshot: function ()
    {
        return this._memorySnapshot;
    },
    /** @private */
    _setMemorySnapshot: function (memorySnapshot)
    {
        this._memorySnapshot = memorySnapshot;
    }
});