////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
// Core Package
var LocalGameList = require('../../../../NGCore/Client/Core/LocalGameList').LocalGameList;
var ObjectRegistry = require('../../../../NGCore/Client/Core/ObjectRegistry').ObjectRegistry;
var AbstractView = require('../../../../NGCore/Client/UI/AbstractView').AbstractView;
var Label = require('../../../../NGCore/Client/UI/Label').Label;
var ScrollView = require('../../../../NGCore/Client/UI/ScrollView').ScrollView;
var Gravity = require('../../../../NGCore/Client/UI/ViewGeometry').Gravity;
var Button = require('../../../../NGCore/Client/UI/Button').Button;
var GL2 = require('../../../../NGCore/Client/GL2').GL2;
var UI = require('../../../../NGCore/Client/UI').UI;
var Physics2 = require('../../../../NGCore/Client/Physics2').Physics2;
// ngGo package
var OrderedDictionary = require('../../../Foundation/OrderedDictionary').OrderedDictionary;
var DebugMenuPage = require('./DebugMenuPage').DebugMenuPage;
var DebugMenu = require('../DebugMenu').DebugMenu;
var FPSWatcher = require('./FPSWatcher').FPSWatcher; /** @private */
exports.SystemPage = DebugMenuPage.subclass(
{
    classname: "SystemPage",
    mode: 5,
    destroy: function ()
    {
        this._cleanText();
        this._clearButtonsCompare();
    },
    _resetText: function ()
    {
        this._cleanText();
        this._clearButtonsCompare();
        this._consoleRect = this._screen.getFullScreenRect().inset(0, 10, 0, 0);
        this._consoleRect.sliceVertical(10);
        this._contentRectHeight = this._screen.convertNumber(40);
        this._write("AAAAFF", "Active ngCore Objects in Memory");
        this._consoleRect.sliceVertical(10);
    },
    _write: function (color, text)
    {
        var textRect = this._consoleRect.sliceVertical(20);
        var label = new Label(
        {
            frame: textRect.array(),
            text: text,
            textGravity: Gravity.Left,
            textColor: color,
            textSize: this._screen.convertNumber(16)
        });
        this._scrollView.addChild(label);
        this._texts.push(label);
        this._contentRectHeight += this._screen.convertNumber(20);
    },
    _writeTexts: function (color, width1, text1, text2)
    {
        var textRect = this._consoleRect.sliceVertical(20);
        var text1Rect = textRect.sliceHorizontal(width1);
        var texts = [[text1, text1Rect], [text2, textRect]];
        var i;
        for (i = 0; i < 2; ++i)
        {
            var label = new Label(
            {
                frame: texts[i][1].array(),
                text: texts[i][0],
                textGravity: Gravity.Left,
                textColor: color,
                textSize: this._screen.convertNumber(16)
            });
            this._scrollView.addChild(label);
            this._texts.push(label);
        }
        this._contentRectHeight += this._screen.convertNumber(20);
    },
    _createButtonCompare: function (label, parent, rect, callback, inset)
    {
        var width = ~~ (rect.w);
        if (inset === undefined)
        {
            inset = 30;
        }
        var button = new Button(
        {
            textGravity: Gravity.Center,
            gradient: {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: ["00000000 0.0", "00000000 1.0"]
            },
            highlightedGradient: {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: ["FFFFFF 0.0", "FFFFFF 1.0"]
            },
            frame: rect.inset(0, inset).array(),
            text: label,
            textSize: 16,
            normalTextColor: "FFFFFF",
            disabledTextColor: "8888AA",
            highlightedTextColor: "000000"
        });
        button.setOnClick(function ()
        {
            callback(button);
        });
        parent.addChild(button);
        return button;
    },
    _createButtonsCompare: function (buttons, parent, rect)
    {
        var buttonWidth = ~~ ((rect.w - buttons.length * 3 + 3) / buttons.length);
        var i;
        for (i = 0; i < buttons.length; ++i)
        {
            var buttonRect = rect.sliceHorizontal(buttonWidth);
            this._buttons.push(this._createButtonCompare(buttons[i][0], parent, buttonRect, buttons[i][1], 2));
            rect.sliceHorizontal(3);
        }
    },
    _clearButtonsCompare: function ()
    {
        var i;
        for (i = 0; i < this._buttons.length; ++i)
        {
            this._buttons[i].destroy();
        }
        this._buttons = [];
    },
    _showMemoryInformation: function ()
    {
        this._orphans = {};
        var results = this._getMemoryInformation();
        this._orphans = this._getMemoryInformationForOrphans();
        this._memorySnapshot = results;
        var i;
        var objectName;
        var count;
        for (i = 0; i < results.length; ++i)
        {
            objectName = results.getKeyByIndex(i);
            count = results.getByIndex(i);
            this._writeTexts("FFFFFF", 250, objectName, String(count));
        }
        this._consoleRect.sliceVertical(10);
        this._contentRectHeight += this._screen.convertNumber(20);
        this._write("AAAAFF", "Orphan Objects");
        this._consoleRect.sliceVertical(10);
        var key;
        for (key in this._orphans)
        {
            if (this._orphans.hasOwnProperty(key))
            {
                this._writeTexts("FFFFFF", 250, key, String(this._orphans[key]));
            }
        }
        var self = this;
        var buttons;
        this._previousMemorySnapshot = DebugMenu._getMemorySnapshot();
        if (this._previousMemorySnapshot)
        {
            buttons = [
                ["MemorySnapshot", function ()
            {
                self._takeMemorySnapshot();}],
                ["CompareMemory", function ()
            {
                self._compareMemory();}]
                ];
        }
        else
        {
            buttons = [
                ["MemorySnapshot", function ()
            {
                self._takeMemorySnapshot();}]

                ];
        }
        this._contentRectHeight += this._screen.convertNumber(20);
        this._consoleRect.sliceVertical(20);
        var buttonsRect = this._consoleRect.sliceVertical(20);
        this._createButtonsCompare(buttons, this._scrollView, buttonsRect);
        this._contentRectHeight += this._screen.convertNumber(20);
        this._scrollView.setContentSize(this._screen.convert([this._contentRectWidth, this._contentRectHeight]));
        if (this._previousMemorySnapshot && !this._isComparing)
        {
            var j;
            for (j = 0; j < this._previousMemorySnapshot.length; ++j)
            {
                objectName = this._previousMemorySnapshot.getKeyByIndex(j);
                count = this._previousMemorySnapshot.getByIndex(j);
                this._writeTexts("FFFFFF", 250, objectName, String(count));
            }
            this._scrollView.setContentSize(this._screen.convert([this._contentRectWidth, this._contentRectHeight]));
        }
    },
    _takeMemorySnapshot: function ()
    {
        DebugMenu._setMemorySnapshot(this._memorySnapshot);
        this._resetText();
        this._showMemoryInformation();
    },
    _compareMemory: function ()
    {
        this._isComparing = true;
        this._previousMemorySnapshot = DebugMenu._getMemorySnapshot();
        this._resetText();
        this._showMemoryInformation();
        var objectName;
        var newCount;
        var oldCount;
        var count;
        var i;
        for (i = 0; i < this._memorySnapshot.length; ++i)
        {
            objectName = this._memorySnapshot.getKeyByIndex(i);
            oldCount = this._previousMemorySnapshot.get(objectName, 0);
            newCount = this._memorySnapshot.getByIndex(i);
            count = newCount - oldCount;
            this._writeTexts("FFFFFF", 250, objectName, String(count));
        }
        for (i = 0; i < this._previousMemorySnapshot.length; ++i)
        {
            objectName = this._previousMemorySnapshot.getKeyByIndex(i);
            newCount = this._memorySnapshot.get(objectName, 0);
            oldCount = this._previousMemorySnapshot.getByIndex(i);
            if (newCount === 0)
            {
                count = newCount - oldCount;
                this._writeTexts("FFFFFF", 250, objectName, String(count));
            }
        }
        this._scrollView.setContentSize(this._screen.convert([this._contentRectWidth, this._contentRectHeight]));
        this._isComparing = false;
    },
    onDrawPage: function (window, pageFrame, contentRectWidth)
    {
        this._contentRectWidth = contentRectWidth;
        this._contentRectHeight = 0;
        this._texts = [];
        this._compareTexts = [];
        this._orphans = {};
        this._isComparing = false;
        this._buttons = [];
        var buttonArea = pageFrame.sliceVertical(this._screen.convertNumber(30));
        var self = this;
        var buttons;
        if (FPSWatcher._isActivated)
        {
            buttons = [
                ["Hide FPS", function (button)
            {
                self._showFPS(button);}],
                ["Restart", function ()
            {
                self._restartGame();}]
                ];
        }
        else
        {
            buttons = [
                ["Show FPS", function (button)
            {
                self._showFPS(button);}],
                ["Restart", function ()
            {
                self._restartGame();}]
                ];
        }
        this.createButtons(buttons, window, buttonArea);
        this._scrollView = new ScrollView(
        {
            frame: pageFrame.array()
        });
        this.elems.push(this._scrollView);
        window.addChild(this._scrollView);
        setTimeout(function ()
        {
            self._resetText();
            self._showMemoryInformation();
        }, 100);
    },
    _restartGame: function ()
    {
        LocalGameList.restartGame();
    },
    _showFPS: function (button)
    {
        if (FPSWatcher._isActivated)
        {
            button.setText("Show FPS");
            FPSWatcher.deactivate();
        }
        else
        {
            button.setText("Hide FPS");
            FPSWatcher.activate();
        }
    },
    _getMemoryInformation: function ()
    {
        var id;
        var classes = new OrderedDictionary();
        var objects = ObjectRegistry._objects;
        var UIObject = AbstractView;
        for (id in objects)
        {
            if (objects.hasOwnProperty(id))
            {
                var obj = objects[id];
                var name = obj.classname;
                if (this._isGL2Object(obj))
                {
                    name = "GL2." + name;
                }
                else if (obj instanceof UIObject)
                {
                    name = this._getUIname(obj);
                }
                var num = classes.get(name, 0);
                classes.set(name, num + 1);
            }
        }
        classes.sort();
        return classes;
    },
    _getMemoryInformationForOrphans: function ()
    {
        var id;
        var orphanObject = {};
        var objects = ObjectRegistry._objects;
        var UIObject = AbstractView;
        for (id in objects)
        {
            if (objects.hasOwnProperty(id))
            {
                var obj = objects[id];
                var name = obj.classname;
                if (this._isGL2Object(obj))
                {
                    name = "GL2." + name;
                    if (obj instanceof GL2.Node && !obj.getParent())
                    {
                        if (orphanObject[name] === undefined)
                        {
                            orphanObject[name] = 0;
                        }
                        orphanObject[name] += 1;
                    }
                }
                else if (obj instanceof UIObject)
                {
                    name = this._getUIname(obj);
                    if (obj instanceof AbstractView && !(obj instanceof UI.GLView) && !obj.getParent())
                    {
                        if (orphanObject[name] === undefined)
                        {
                            orphanObject[name] = 0;
                        }
                        orphanObject[name] += 1;
                    }
                }
                else if (obj instanceof Physics2.Body)
                {
                    if (!obj._world)
                    {
                        if (orphanObject[name] === undefined)
                        {
                            orphanObject[name] = 0;
                        }
                        orphanObject[name] += 1;
                    }
                }
            }
        }
        return orphanObject;
    },
    _isGL2Object: function (obj)
    {
        var result = (obj instanceof GL2.Node || obj instanceof GL2.Animation || obj === GL2.Root);
        return result;
    },
    _getUIname: function (obj)
    {
        var uiobjects = [
            ["UI.Label", UI.Label],
            ["UI.Button", UI.Button],
            ["UI.View", UI.View],
            ["UI.ScrollView", UI.ScrollView]
            ];
        var i;
        for (i = 0; i < uiobjects.length; ++i)
        {
            if (obj instanceof uiobjects[i][1])
            {
                return uiobjects[i][0];
            }
        }
        return "UI.UI_Element";
    },
    _cleanText: function ()
    {
        var i;
        for (i = 0; i < this._texts.length; ++i)
        {
            this._texts[i].destroy();
        }
        this._texts = [];
    }
});