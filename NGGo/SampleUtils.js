var Class = require('../NGCore/Client/Core/Class').Class;
var MessageListener = require('../NGCore/Client/Core/MessageListener').MessageListener;
var KeyEmitter = require('../NGCore/Client/Device/KeyEmitter').KeyEmitter;
var Sprite = require('../NGCore/Client/GL2/Sprite').Sprite;
var UI = require('../NGCore/Client/UI').UI;
exports.SampleUtils = Class.singleton(
{
    createBackground: function (file)
    {
        var w = UI.Window.outerWidth;
        var h = UI.Window.outerHeight;
        var background = new Sprite();
        background.setImage(file, [w, h], [0, 0]);
        return background;
    },
    createBackButton: function ()
    {
        var quitting = false;
        var back = new UI.Button(
        {
            frame: [10, 10, 64, 64],
            text: "X",
            disabledText: "Returning...",
            disabledTextColor: "FFFF",
            textSize: 24,
            textGravity: UI.ViewGeometry.Gravity.Center,
            gradient: {
                corners: '8 8 8 8',
                outerLine: "00 1.5",
                gradient: ["FF9bd6f4 0.0", "FF0077BC 1.0"]
            },
            highlightedGradient: {
                corners: '8 8 8 8',
                outerLine: "00 1.5",
                gradient: ["FF0077BC 0.0", "FF9bd6f4 1.0"]
            },
            disabledGradient: {
                corners: '0 8 8 8',
                gradient: ["FF55 0.0", "FF00 1.0"]
            },
            onClick: function ()
            {
                if (quitting)
                {
                    return;
                }
                quitting = true;
                var LGL = require('../NGCore/Client/Core/LocalGameList').LocalGameList;
                LGL.runUpdatedGame('/GoApps/Launcher');
                UI.Window.document.addChild(
                new UI.Spinner(
                {
                    frame: new UI.ViewGeometry.Rect(this.getFrame()).inset(10)
                }));
                this.setFrame(10, 10, 240, 64);
                // Reserve some space for the spinner to appear
                this.setTextInsets(0, 0, 0, 64);
                this.setTextGravity(0, 0.5);
                this.setTextSize(18.0);
                // Select the "disabled" appearance, and deactivate the control
                this.addState(UI.State.Disabled);
            }
        });
        var KeyListener = MessageListener.singleton(
        {
            initialize: function ()
            {
                KeyEmitter.addListener(this, this.onUpdate);
            },
            onUpdate: function (keyEvent)
            {
                if (keyEvent.code === KeyEmitter.Keycode.back)
                {
                    if (back)
                    {
                        back.onClick(keyEvent);
                    }
                    return true;
                }
                return false;
            }
        });
        return back;
    }
});