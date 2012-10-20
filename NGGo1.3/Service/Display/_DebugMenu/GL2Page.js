////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

// Core Package
var Core           = require('../../../../NGCore/Client/Core').Core;
var ObjectRegistry = require('../../../../NGCore/Client/Core/ObjectRegistry').ObjectRegistry;
var Label          = require('../../../../NGCore/Client/UI/Label').Label;
var Button         = require('../../../../NGCore/Client/UI/Button').Button;
var ScrollView     = require('../../../../NGCore/Client/UI/ScrollView').ScrollView;
var Window         = require('../../../../NGCore/Client/UI/Window').Window;
var Gravity        = require('../../../../NGCore/Client/UI/ViewGeometry').Gravity;
var GL2            = require('../../../../NGCore/Client/GL2').GL2;

// ngGo package
var OrderedDictionary = require('../../../Foundation/OrderedDictionary').OrderedDictionary;
var DebugMenuPage     = require('./DebugMenuPage').DebugMenuPage;

/** @private */

exports.GL2Page = DebugMenuPage.subclass({
    classname: "GL2Page",
    mode: 3,
    destroy: function()
    {
        this._cleanText();
    },
    _resetText: function()
    {
        this._cleanText();
        this._consoleRect = this.pageFrame.inset(-this.pageFrame.y, 10, 5, 0);
        this._consoleRect.sliceVertical(10);
        this._contentRectHeight = this._screen.convertNumber(40);
        this._write("AAAAFF", "GL2 tree");
        this._consoleRect.sliceVertical(10);
    },
    _drawRect: function (obj,x,y,w,h)
    {
        NgLogD("name:"+obj.classname+" x:"+x+" y:"+y+" w:"+w+" h:"+h);
        var color = new Core.Color(1.0,0.0,0.0);
        this.prim = new GL2.Primitive();
        this.prim.setType(GL2.Primitive.Type.TriangleStrip);
        this.prim.setAlpha(0.7);

        this.prim.pushVertex(new GL2.Primitive.Vertex(new Core.Vector(0, 0), [0.0, 0.0], color));
        this.prim.pushVertex(new GL2.Primitive.Vertex(new Core.Vector(0, h), [0.0, 0.0], color));
        this.prim.pushVertex(new GL2.Primitive.Vertex(new Core.Vector(w, 0), [0.0, 0.0], color));
        this.prim.pushVertex(new GL2.Primitive.Vertex(new Core.Vector(w, h), [0.0, 0.0], color));

        obj.addChild(this.prim);
        this.prim.setPosition(x,y);
        this.prim.setDepth(10000);
    },
    _previewStart:function(event)
    {
        var page = this.page;
        this.orphan = false;
        var parts = this;
        if( (this.obj.classname != "Sprite") &&
            (this.obj.classname != "Text") )
        {
            return;
        }

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
                parts.obj.removeChild(page.prim);
                page.prim.destroy();
                Window.document.removeChild(parts._button);
                parts._button.destroy();
                page._window.setVisible(true);
                
                if(parts.orphan)
                {
                    GL2.Root.removeChild(parts.obj);
                }
            }
        });

        page._window.setVisible(false);
        Window.document.addChild(this._button);

        
        if(this.obj.getParent() == null)
        {
            this.orphan = true;
            GL2.Root.addChild(this.obj);
        }

        var size = {};
        var anchor = {};
        var pos = this.obj.getPosition();
        var x = 0;
        var y = 0;
        
        if(this.obj.classname == "Sprite")
        {
            var frame = this.obj._animation.getFrame(0);
            size = frame._size;
            anchor = frame._anchor;
        } else if(this.obj.classname == "Text"){
            var h = this.obj.getFontSize();
            size = new Core.Size(this.obj.getText().length*h,h);
            anchor = this.obj._anchor;
        }
        
        x -= size.getWidth() * anchor.getX();
        y -= size.getHeight() * anchor.getY();
        var w = size.getWidth();
        var h = size.getHeight();
        page._drawRect(this.obj,x,y,w,h);
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
        for (i=0; i<this.classes.length; ++i)
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
        this.root = [];
        this.pageFrame = pageFrame;
        this._window = window;

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
            var num = count.get(obj.classname, 0);
            count.set(obj.classname, num + 1);
            obj.level = level;
            name = obj.classname + "(" + num + ")";
            classes.set(name, obj);
            this._childInfo(obj.getChildren(),classes,level,count);
        }
    },
    _getNodeInformation: function()
    {
        var id;
        var count = new OrderedDictionary();
        var classes = new OrderedDictionary();
        var objects = ObjectRegistry._objects;

        var topNode ={};
        topNode.classname = "Node";
        topNode.level = 0;
        classes.set("GL2.Root",topNode);
        for (id in objects)
        {
            if(objects.hasOwnProperty(id))
            {
                var obj = objects[id];
                if(obj instanceof GL2.Node)
                {
                    var parent = obj.getParent();
                    if(parent === GL2.Root)
                    {
                        var num = count.get(obj.classname, 0);
                        count.set(obj.classname, num + 1);
                        name = obj.classname + "(" + num + ")";
                        obj.level = 1;
                        classes.set(name, obj);
                        this._childInfo(obj.getChildren(),classes,obj.level,count);
                        this.root.push(obj);
                    }
                }
            }
        }
        var topNode ={};
        topNode.classname = "Node";
        topNode.level = 0;
        classes.set("---- Orphan ----",topNode);
        for (id in objects)
        {
            if(objects.hasOwnProperty(id))
            {
                var obj = objects[id];
                if(obj instanceof GL2.Node)
                {
                    var parent = obj.getParent();
                    if(parent === null){
                        var num = count.get(obj.classname, 0);
                        count.set(obj.classname, num + 1);
                        name = obj.classname + "(" + num + ")";
                        obj.level = 1;
                        classes.set(name, obj);
                        var children = obj.getChildren();
                        this._childInfo(children,classes,obj.level,count);
                    }
                }
            }
        }
        return classes;
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
