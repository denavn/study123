////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

// UI Package
var Button     = require('../../../../NGCore/Client/UI/Button').Button;
var CheckBox   = require('../../../../NGCore/Client/UI/CheckBox').CheckBox;
var Commands   = require('../../../../NGCore/Client/UI/Commands').Commands;
var Label      = require('../../../../NGCore/Client/UI/Label').Label;
var EditText   = require('../../../../NGCore/Client/UI/EditText').EditText;
var ScrollView = require('../../../../NGCore/Client/UI/ScrollView').ScrollView;
var Gravity    = require('../../../../NGCore/Client/UI/ViewGeometry').Gravity;
// NGGo/Service Package
var PreferenceManager = require('../../Data/PreferenceManager').PreferenceManager;
var Action            = require('../../Data/PreferenceManager').Action;
var DebugMenuPage     = require('../_DebugMenu/DebugMenuPage').DebugMenuPage;

/** @private */
exports.PreferencePage = DebugMenuPage.subclass(
{
    classname: "PreferencePage",
    mode: 0,
    destroy: function()
    {
        this._updaters = [];
    },
    onDrawPage: function(window, pageFrame, contentRectWidth)
    {
        this._updaters = [];
        var height = this._screen.convertNumber(24);
        if(Core.Capabilities.getPlatformOS() == "Android")
        {
            height = this._screen.convertNumber(40);
        }

        var scrollView = new ScrollView(
        {
            frame: pageFrame.array()
        });

        this.elems.push(scrollView);
        window.addChild(scrollView);

        var itemRect = pageFrame.inset(-pageFrame.y, 10, 0, 0);
        
        var contentRectHeight = 0;
        var items = PreferenceManager.get(this._param);
        var key;
        for (key in items)
        {
            if(items.hasOwnProperty(key))
            {
                var item = items[key];
                switch(typeof item)
                {
                case "number":
                case "boolean":
                case "string":
                    this._createDataCell(key, item, scrollView, itemRect.sliceVertical(height));
                    itemRect.sliceVertical(5);
                    contentRectHeight += height + 5;
                    break;
                case "object":
                    if (item instanceof Action && key !== "onUpdate" && key !== "unittest")
                    {
                        this._createEventCell(key, scrollView, itemRect.sliceVertical(height));
                        itemRect.sliceVertical(5);
                        contentRectHeight += height + 5;
                    }
                    break;
                }
            }
        }
        scrollView.setContentSize(this._screen.convert([contentRectWidth, contentRectHeight]));
    },
    /** @private */
    _createDataCell: function(key, item, scrollView, rect)
    {
        var width = ~~(rect.w);
        var input, resetButton;
        var that = this;
        var textSize = 16;
        
        if(Core.Capabilities.getPlatformOS() == "Android")
        {
            textSize = 8;
        }
        var label = new Label(
        {
            frame: rect.sliceHorizontal(width*0.4).array(),
            text: key,
            textGravity: Gravity.Left,
            textColor: "FFFFFF",
            textSize: this._screen.convertNumber(16)
        });
        scrollView.addChild(label);
        this.elems.push(label);
        rect.sliceHorizontal(5);

        switch (typeof item)
        {
        case "number":
            input = new EditText(this._baseDesign(
            {
                frame: rect.sliceHorizontal(width*0.4).array(),
                text: item.toString(),
                textSize: this._screen.convertNumber(textSize),
                inputType: Commands.InputType.Numeric,
                onChange: function(event)
                {
                    var value = event.text.replace(/[^0-9\.\-]/g, "");
                    if(value.indexOf("-") === 0)
                    {
                        value = "-" + value.replace(/-/g, "");
                    }
                    else
                    {
                        value = value.replace(/-/g, "");
                    }
                    if(value.indexOf(".") !== value.lastIndexOf("."))
                    {
                        var stringParts = value.split(".");
                        var integerPart = stringParts.shift();
                        value = [integerPart, stringParts.join("")].join(".");
                    }
                    PreferenceManager.set(that._createKey(key), parseFloat(value));
                    resetButton.setVisible(true);
                }
            }));
            this._updaters.push(function()
            {
                input.setText(PreferenceManager.get(key).toString());
                resetButton.setVisible(PreferenceManager.isChanged(key));
            });
            break;
        case "string":
            input = new EditText(this._baseDesign(
            {
                frame: rect.sliceHorizontal(width*0.4).array(),
                text: item.toString(),
                textSize: this._screen.convertNumber(textSize),
                inputType: Commands.InputType.Numeric,
                onChange: function(event)
                {
                    var value = event.text;
                    PreferenceManager.set(that._createKey(key), value);
                    resetButton.setVisible(true);
                }
            }));
            this._updaters.push(function()
            {
                input.setText(PreferenceManager.get(key).toString());
                resetButton.setVisible(PreferenceManager.isChanged(key));
            });
            break;
        case "boolean":
            input = new CheckBox(
            {
                frame: rect.sliceHorizontal(width*0.4).array(),
                textGravity: Gravity.Left,
                textColor: "FFFFFF",
                text: item.toString(),
                checked: item,
                onClick: function(event)
                {
                    PreferenceManager.set(that._createKey(key), event.checked);
                    this.setText(event.checked.toString());
                    resetButton.setVisible(true);
                }
            });
            this._updaters.push(function()
            {
                input.setChecked(PreferenceManager.get(key));
                resetButton.setVisible(PreferenceManager.isChanged(key));
            });
            break;
        }
        scrollView.addChild(input);
        this.elems.push(input);
        rect.sliceHorizontal(5);

        resetButton = new Button(this._baseDesign(
        {
            frame: rect.array(),
            text: "reset",
            visible: PreferenceManager.isChanged(key),
            textSize: this._screen.convertNumber(16),
            onClick: function(event)
            {
                var oldValue = PreferenceManager.reset(that._createKey(key));
                switch (typeof item)
                {
                case "number":
                    input.setText(oldValue.toString());
                    break;
                case "boolean":
                    input.setChecked(oldValue);
                    break;
                }
                resetButton.setVisible(false);
            }
        }));
        scrollView.addChild(resetButton);
        this.elems.push(resetButton);
    },
    _createEventCell: function(key, scrollView, rect)
    {
        if (key === "onUpdate")
        {
            return;
        }
        var that = this;
        var callKey = key;
        if (this._param)
        {
            callKey = this._param + "/" + key;
        }

        var callback = function(event)
        {
            PreferenceManager.runAction(callKey);
            var i;
            for (i=0; i<that._updaters.length; ++i)
            {
                that._updaters[i]();
            }
        };
        this.createButton(key, scrollView, rect, callback);
    },
    _createKey: function(key)
    {
        if(this._param === "")
        {
            return key;
        }
        else
        {
            return this._param + "/" + key;
        }
    }
});
