var Core   = require('../NGCore/Client/Core').Core;
var Device = require('../NGCore/Client/Device').Device;
var Sprite = require('../NGCore/Client/GL2/Sprite').Sprite;
var UI     = require('../NGCore/Client/UI').UI;
var Root   = require('../NGCore/Client/GL2/Root').Root;
/**
 * @private
 */
exports.SampleUtils = Core.Class.singleton(
{
    initialize: function()
    {
        this.background = undefined;
        this.uiBackGround = undefined;
    },
    setBackground: function(file)
    {
        var w = UI.Window.outerWidth;
        var h = UI.Window.outerHeight;
        this.background = new Sprite();
        this.background.setImage(file, [w, h], [0, 0]);
        Root.addChild(this.background);
        return this.background;
    },
    createBackground: function(file)
    {
        var w = UI.Window.outerWidth;
        var h = UI.Window.outerHeight;
        var background = new Sprite();
        background.setImage(file, [w, h], [0, 0]);
        return background;
    },
    setUIBackground: function(color)
    {
        var w = UI.Window.outerWidth;
        var h = UI.Window.outerHeight;
        this.uiBackground = new UI.View();
        this.uiBackground.setFrame([0, 0, w, h]);
        this.uiBackground.setBackgroundColor(color);
        UI.Window.document.addChild(this.uiBackground);
        return this.uiBackground;
    },
    createBackButton: function(onBack)
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
            gradient:
            {
                corners: '8 8 8 8',
                outerLine: "00 1.5",
                gradient: [ "FF9bd6f4 0.0", "FF0077BC 1.0" ]
            },
            highlightedGradient:
            {
                corners: '8 8 8 8',
                outerLine: "00 1.5",
                gradient: [ "FF0077BC 0.0", "FF9bd6f4 1.0" ]
            },
            disabledGradient:
            {
                corners: '0 8 8 8',
                gradient: [ "FF55 0.0", "FF00 1.0"]
            },
            onClick: function(event)
            {
                if (quitting) { return; }
                quitting = true;
                if (onBack) {
                    onBack();
                }
                var game = Core.Capabilities.getGame();
                var gamePaths = game.split("/");
                var root = gamePaths.shift();
                var absolutePath = "/" + root + "/" + "Launcher";
                var LGL = require('../NGCore/Client/Core/LocalGameList').LocalGameList;
                LGL.runUpdatedGame(absolutePath);
                UI.Window.document.addChild(new UI.Spinner({
                    frame: new UI.ViewGeometry.Rect(this.getFrame()).inset(10)
                }));

                var myRect = new UI.ViewGeometry.Rect(this.getFrame());
                this.setFrame(10, 10, 240, 64);
                // Reserve some space for the spinner to appear
                this.setTextInsets(0, 0, 0, 64);
                this.setTextGravity(0, 0.5);
                this.setTextSize(18.0);
                // Select the "disabled" appearance, and deactivate the control
                this.addState(UI.State.Disabled);

                if (exports.SampleUtils.background)
                {
                    exports.SampleUtils.background.destroy();
                }
                if (exports.SampleUtils.uiBackGround)
                {
                    exports.SampleUtils.uiBackGround.destroy();
                }
                KeyListener.destroy();
                this.destroy();
            }
        });

        var KeyListener = Core.MessageListener.singleton(
        {
            initialize: function()
            {
                Device.KeyEmitter.addListener(this, this.onUpdate);
            },
            onUpdate: function(keyEvent)
            {
                if (keyEvent.code === Device.KeyEmitter.Keycode.back)
                {
                    if (button)
                    {
                        button.onClick(keyEvent);
                    }
                    return true;
                }
                return false;
            }
        });
        return back;
    }
});
