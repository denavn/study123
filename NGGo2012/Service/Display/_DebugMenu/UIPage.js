////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

// Core Package
var ObjectRegistry = require('../../../../NGCore/Client/Core/ObjectRegistry').ObjectRegistry;
var AbstractView   = require('../../../../NGCore/Client/UI/AbstractView').AbstractView;
var Label          = require('../../../../NGCore/Client/UI/Label').Label;
var Button         = require('../../../../NGCore/Client/UI/Button').Button;
var ScrollView     = require('../../../../NGCore/Client/UI/ScrollView').ScrollView;
var Window         = require('../../../../NGCore/Client/UI/Window').Window;
var Gravity        = require('../../../../NGCore/Client/UI/ViewGeometry').Gravity;
var UI             = require('../../../../NGCore/Client/UI').UI;

// ngGo package
var OrderedDictionary = require('../../../Foundation/OrderedDictionary').OrderedDictionary;
var DebugMenuPage     = require('./DebugMenuPage').DebugMenuPage;

/** @private */

exports.UIPage = DebugMenuPage.subclass({
    classname: "UIPage",
    mode: 4,
    destroy: function()
    {
        this._cleanText();
    },
    _resetText: function()
    {
        this._cleanText();
        this._consoleRect = this.pageFrame.inset(-this.pageFrame.y, 10, 0, 0);
        this._consoleRect.sliceVertical(10);
        this._contentRectHeight = this._screen.convertNumber(40);
        this._write("AAAAFF", "UI tree");
        this._consoleRect.sliceVertical(10);
    },
    _previewStart:function(event)
    {
        var page = this.page;
        this._parent = null;
        var parts = this;
        if(this.obj.classname == "None") return;
        this._button = new Button(
        {
            textGravity: Gravity.Center,
            gradient:
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "66000000 0.0", "66000000 1.0" ]
            },
            highlightedGradient:
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "FF6666FF 0.0", "FF333388 1.0" ]
            },
            frame: [1, 1, 48, 48],
            text: "X",
            textSize: 16,
            normalTextColor: "FFFFFF",
            highlightedTextColor: "FFFFFF",
            onClick: function()
            {
                Window.document.removeChild(parts.mark);
                Window.document.removeChild(parts._button);
                parts._button.destroy();
                page._window.setVisible(true);
            }
        });
        page._window.setVisible(false);
        
        this.mark = new UI.View({
            frame: this.obj.getFrame()
        });
        this.mark.setAlpha(0.7);
        this.mark.setBackgroundColor("FFFF0000");
        Window.document.addChild(this.mark);
        Window.document.addChild(this._button);
    },
    _writeButton: function(color, text)
    {
        var rect = this._consoleRect.sliceVertical(20);
        var obj = this.classes.get(text,null);
        rect.inset(0,0,0,obj.level*16);

        button = new Button(this._baseDesign(
        {
            frame: rect.array(),
            text: text,
            visible: true,
            textGravity: Gravity.Left,
            textColor: color,
            textSize: this._screen.convertNumber(16),
            onClick: this._previewStart
        }));
        button.page = this;
        button.obj = obj;
        this._scrollView.addChild(button);
        this.elems.push(button);
        this._contentRectHeight += this._screen.convertNumber(20);
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
    _showNodeInformation: function()
    {
        this.classes = this._getNodeInformation();
        var i;
        var length = this.classes.length;
        for (i = 0; i < length; ++i)
        {
            var objectName = this.classes.getKeyByIndex(i);
            var count = this.classes.getByIndex(i);
            this._writeButton("FFFFFF", objectName);
        }
        this._scrollView.setContentSize(this._screen.convert([this._contentRectWidth, this._contentRectHeight]));
    },
    onDrawPage: function(window, pageFrame, contentRectWidth)
    {
        this._contentRectWidth = contentRectWidth;
        this._contentRectHeight = 0;
        this._texts = [];
        this.pageFrame = pageFrame;
        this._window = window;
        this._window.hide = true;

        var self = this;

        this._scrollView = new ScrollView(
        {
            frame: pageFrame.array()
        });
        this.elems.push(this._scrollView);
        window.addChild(this._scrollView);

        setTimeout(function()
        {
            self._resetText();
            self._showNodeInformation();
        }, 100);
    },
    _childInfo: function(objects,classes,level,count)
    {
        level++;
        for (id in objects)
        {
            var obj = objects[id];
            var num = count.get(this._getUIname(obj), 0);
            count.set(this._getUIname(obj), num + 1);
            name = this._getUIname(obj) + "(" + num + ")";
            obj.level = level;
            classes.set(name, obj);
            if(obj.getChildren != undefined)
            {
                this._childInfo(obj.getChildren(),classes,level,count);
            }
       }
    },
    _getNodeInformation: function()
    {
        var id;
        var count = new OrderedDictionary();
        var classes = new OrderedDictionary();
        var objects = ObjectRegistry._objects;

        var UIobjs = Window.document.getChildren();
        var topNode ={};
        topNode.classname = "None";
        topNode.level = 0;
        classes.set("UI.Window.document",topNode);
        for (id in UIobjs)
        {
            var obj = UIobjs[id];
            if(obj.hide != undefined) continue;
            if(obj.getChildren != undefined)
            {
                var num = count.get(this._getUIname(obj), 0);
                count.set(this._getUIname(obj), num + 1);
                name = this._getUIname(obj) + "(" + num + ")";
                obj.level = 1;
                classes.set(name, obj);
                this._childInfo(obj.getChildren(),classes,obj.level,count);
            }
            else if (obj instanceof AbstractView)
            {
                var num = count.get(this._getUIname(obj), 0);
                count.set(this._getUIname(obj), num + 1);
                name = this._getUIname(obj) + "(" + num + ")";
                obj.level = 1;
                classes.set(name, obj);
            }
        }
        return classes;
    },
    _getUIname: function(obj)
    {
        var uiobjects =
        [
            ["Button", UI.Button], //=>UI.AbstractView
            ["CheckBox", UI.CheckBox], //=>UI.AbstractView
            ["CheckoutView", UI.CheckoutView], //=>UI.AbstractView
            ["DocumentView", UI.DocumentView], //=>UI.AbstractView
            ["EditText", UI.EditText], //=>UI.AbstractView
            ["EditTextArea", UI.EditTextArea], //=>UI.AbstractView
            ["GLView", UI.GLView], //=>UI.AbstractView
            ["Image", UI.Image], //=>UI.AbstractView
            ["Label", UI.Label], //=>UI.AbstractView
            ["Spinner", UI.Spinner], //=>UI.AbstractView
            ["MapView", UI.MapView], //=>UI.AbstractView
            ["WebView", UI.WebView], //=>UI.AbstractView
            ["ListView", UI.ListView], //=>UI.ScrollView
            ["ScrollView", UI.ScrollView], //=>UI.View
            ["CellView", UI.CellView], //=>UI.View
            ["ListViewItem", UI.ListViewItem], //=>Core.Class
            ["ListViewSection", UI.ListViewSection], //=>UI.Element
            ["Toast", UI], //=>UI.Element
            ["View", UI.View] //=>UI.AbstractView
        ];
        var i;
        var length = uiobjects.length;
        for (i = 0; i < length; ++i)
        {
            if (obj instanceof uiobjects[i][1])
            {
                return uiobjects[i][0];
            }
        }
        return "UI_Element";
    },
    _cleanText: function()
    {
        var i;
        var length = this._texts.length;
        for (i = 0; i < length; ++i)
        {
            this._texts[i].destroy();
        }
        this._texts = [];
    }
});
