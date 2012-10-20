////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Class      = require('../../../../NGCore/Client/Core/Class').Class;
var Button     = require('../../../../NGCore/Client/UI/Button').Button;
var Label      = require('../../../../NGCore/Client/UI/Label').Label;
var View       = require('../../../../NGCore/Client/UI/View').View;
var Window     = require('../../../../NGCore/Client/UI/Window').Window;
var Gravity    = require('../../../../NGCore/Client/UI/ViewGeometry').Gravity;

var tabNames =
[
    "Setting",
    "UnitTest",
    "Scenes",
    "System"
];


/** @private */
exports.DebugMenuPage = Class.subclass(
{
    initialize: function(screen, param, changePage)
    {
        this._screen = screen;
        this._param = param;
        this.elems = [];
        this.changePage = changePage;
    },
    destroy: function()
    {
        var i;
        for(i=0; i<this.elems.length; ++i)
        {
            this.elems[i].destroy();
        }
        this.elems = [];
    },
    /** @private */
    showMenu: function()
    {
        var size = this._screen.logicalSize;
        var window = new View(
        {
            frame: [0, 0, size[0], size[1]],
            gradient:
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient:
                [
                    "cc000088 0.0",
                    "cc000000 0.8"
                ]
            },
            depth: 1000
        });
        this.elems.push(window);
        Window.document.addChild(window);

        var pageFrame = this._screen.getFullScreenRect();
        pageFrame.sliceVertical(55);
        var contentFrame = pageFrame.sliceVertical(pageFrame.h - 36);
        contentFrame.inset(5);

        var self = this;

        var closeButton = new Button(this._baseDesign(
        {
            frame: this._screen.convertRect({x:-50, y:10, h:40, w:40}),
            text: "X",
            textSize: this._screen.convertNumber(16),
            onClick: function(event)
            {
                self.changePage(undefined);
                self.destroy();
            }
        }));
        window.addChild(closeButton);
        this.elems.push(closeButton);

        var contentRectWidth = size[0] - 10;
        this.onDrawPage(window, contentFrame, contentRectWidth);
        this._showTabs(window, pageFrame);
    },
    _showTabs: function(window, tabFrame)
    {
        var width = ~~((tabFrame.w - ((tabNames.length - 1) * 5)) / tabNames.length);
        var self = this;
        function createCallback(i)
        {
            return function()
            {
                self.changePage(i);
                self.destroy();
            };
        }
        var i;
        for(i=0;i<tabNames.length;++i)
        {
            var rect = tabFrame.sliceHorizontal(width);
            if (i === this.mode)
            {
                var label = new Label(
                {
                    textGravity: Gravity.Center,
                    gradient:
                    {
                        corners: '8 8 8 8',
                        outerLine: "FFFFFF 1.5",
                        gradient: [ "FF6666FF 0.0", "FF333388 1.0" ]
                    },
                    frame: rect.array(),
                    text: tabNames[i],
                    textSize: 16,
                    textColor: "FFFFFF"
                });
                window.addChild(label);
                this.elems.push(label);
            }
            else
            {
                var button = new Button(
                {
                    textGravity: Gravity.Center,
                    gradient:
                    {
                        corners: '8 8 8 8',
                        outerLine: "FFFFFF 1.5",
                        gradient: [ "FF000000 0.0", "FF000000 1.0" ]
                    },
                    highlightedGradient:
                    {
                        corners: '8 8 8 8',
                        outerLine: "FFFFFF 1.5",
                        gradient: [ "FF6666FF 0.0", "FF333388 1.0" ]
                    },
                    frame: rect.array(),
                    text: tabNames[i],
                    textSize: 16,
                    normalTextColor: "FFFFFF",
                    highlightedTextColor: "FFFFFF",
                    onClick: createCallback(i)
                });
                window.addChild(button);
                this.elems.push(button);
            }
            tabFrame.sliceHorizontal(5);
        }
    },
    /** @private */
    createButton: function(label, parent, rect, callback, inset, store)
    {
        var width = ~~(rect.w);
        if (inset === undefined)
        {
            inset = 30;
        }
        var button = new Button(
        {
            textGravity: Gravity.Center,
            gradient:
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "00000000 0.0", "00000000 1.0" ]
            },
            highlightedGradient:
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "FFFFFF 0.0", "FFFFFF 1.0" ]
            },
            frame: rect.inset(0, inset).array(),
            text: label,
            textSize: 16,
            normalTextColor: "FFFFFF",
            disabledTextColor: "8888AA",
            highlightedTextColor: "000000"
        });
        button.setOnClick(function() { callback(button); });

        parent.addChild(button);
        if (store)
        {
            store.push(button);
        }
        else
        {
            this.elems.push(button);
        }
        return button;
    },
    /** @private */
    createButtons: function(buttons, parent, rect, store)
    {
        var buttonWidth = ~~((rect.w - buttons.length * 3 + 3) / buttons.length);
        var i;
        for (i=0; i<buttons.length; ++i)
        {
            var buttonRect = rect.sliceHorizontal(buttonWidth);
            this.createButton(buttons[i][0], parent, buttonRect, buttons[i][1], 2, store);
            rect.sliceHorizontal(3);
        }
    },
    _baseDesign: function(opts)
    {
        var design =
        {
            gradient:
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "00000000 0.0", "00000000 1.0" ]
            },
            textColor: "FFFFFF",
            highlightedGradient:
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "FFFFFF 0.0", "FFFFFF 1.0" ]
            },
            highlightedTextColor: "000000",
            textGravity: Gravity.Center
        };
        var key;
        for (key in opts)
        {
            if(opts.hasOwnProperty(key))
            {
                design[key] = opts[key];
            }
        }
        return design;
    }
});
