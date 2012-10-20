////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

// Core Package
var LocalGameList  = require('../../../../NGCore/Client/Core/LocalGameList').LocalGameList;
var ObjectRegistry = require('../../../../NGCore/Client/Core/ObjectRegistry').ObjectRegistry;
var AbstractView   = require('../../../../NGCore/Client/UI/AbstractView').AbstractView;
var Label          = require('../../../../NGCore/Client/UI/Label').Label;
var ScrollView     = require('../../../../NGCore/Client/UI/ScrollView').ScrollView;
var View           = require('../../../../NGCore/Client/UI/View').View;
var Gravity        = require('../../../../NGCore/Client/UI/ViewGeometry').Gravity;
var GL2            = require('../../../../NGCore/Client/GL2').GL2;

// ngGo package
var OrderedDictionary = require('../../../Foundation/OrderedDictionary').OrderedDictionary;
var DebugMenuPage     = require('./DebugMenuPage').DebugMenuPage;
var FPSWatcher        = require('./FPSWatcher').FPSWatcher;


/** @private */
exports.SystemPage = DebugMenuPage.subclass({
    classname: "SystemPage",
    mode: 3,
    destroy: function()
    {
        this._cleanText();
    },
    _resetText: function()
    {
        this._cleanText();
        this._consoleRect = this._screen.getFullScreenRect().inset(0, 10, 0, 0);
        this._consoleRect.sliceVertical(10);
        this._contentRectHeight = this._screen.convertNumber(40);
        this._write("AAAAFF", "Active ngCore Objects in Memory");
        this._consoleRect.sliceVertical(10);
    },
    _write: function(color, text)
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
    _writeTexts: function(color, width1, text1, text2)
    {
        var textRect = this._consoleRect.sliceVertical(20);
        var text1Rect = textRect.sliceHorizontal(width1);
        var texts = [[text1, text1Rect], [text2, textRect]];
        var i;
        for (i=0; i<2; ++i)
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
    _showMemoryInformation: function()
    {
        var results = this._getMemoryInformation();
        var i;
        for (i=0; i<results.length; ++i)
        {
            var objectName = results.getKeyByIndex(i);
            var count = results.getByIndex(i);
            this._writeTexts("FFFFFF", 250, objectName, String(count));
        }
        this._scrollView.setContentSize(this._screen.convert([this._contentRectWidth, this._contentRectHeight]));
    },
    onDrawPage: function(window, pageFrame, contentRectWidth)
    {
        this._contentRectWidth = contentRectWidth;
        this._contentRectHeight = 0;
        this._texts = [];

        var buttonArea = pageFrame.sliceVertical(this._screen.convertNumber(30));
        var self = this;
        var buttons;
        if (FPSWatcher.isActivated)
        {
            buttons =
            [
                ["Hide FPS", function(button){ self._showFPS(button); }],
                ["Restart", function(){ self._restartGame(); }]
            ];
        }
        else
        {
            buttons =
            [
                ["Show FPS", function(button){ self._showFPS(button); }],
                ["Restart", function(){ self._restartGame(); }]
            ];
        }

        this.createButtons(buttons, window, buttonArea);

        this._scrollView = new ScrollView(
        {
            frame: pageFrame.array()
        });
        this.elems.push(this._scrollView);
        window.addChild(this._scrollView);

        setTimeout(function()
        {
            self._resetText();
            self._showMemoryInformation();
        }, 100);
    },
    _restartGame: function()
    {
        LocalGameList.restartGame();
    },
    _showFPS: function(button)
    {
        console.log("showFPS");
        if (FPSWatcher.isActivated)
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
    _getMemoryInformation: function()
    {
        var id;
        var classes = new OrderedDictionary();
        var objects = ObjectRegistry._objects;
        var UIObject = AbstractView;
        for (id in objects)
        {
            if(objects.hasOwnProperty(id))
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
    _isGL2Object: function(obj)
    {
        var result = (obj instanceof GL2.Node
                || obj instanceof GL2.Animation
                || obj === GL2.Root);
        return result;
    },
    _getUIname: function(obj)
    {
        var uiobjects =
        [
            ["UI.Label", UI.Label],
            ["UI.Button", UI.Button],
            ["UI.View", UI.View],
            ["UI.ScrollView", UI.ScrollView]
        ];
        var i;
        for (i=0; i<uiobjects.length; ++i)
        {
            if (obj instanceof uiobjects[i][1])
            {
                return uiobjects[i][0];
            }
        }
        return "UI.UI_Element";
    },
    _cleanText: function()
    {
        var i;
        for (i=0;i<this._texts.length;++i)
        {
            this._texts[i].destroy();
        }
        this._texts = [];
    }
});
