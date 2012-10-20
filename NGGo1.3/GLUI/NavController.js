////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Harris K, Awais M
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
var MessageListener = require("../../NGCore/Client/Core/MessageListener").MessageListener;
var Vector = require("../../NGCore/Client/Core/Vector").Vector;
var UpdateEmitter = require("../../NGCore/Client/Core/UpdateEmitter").UpdateEmitter;
var Time = require("../../NGCore/Client/Core/Time").Time;
var Analytics = require("../../NGCore/Client/Core/Analytics").Analytics;
var KeyEmitter = require("../../NGCore/Client/Device/KeyEmitter").KeyEmitter;
var Device = require("../../NGCore/Client/Device").Device;
var Capabilities = require("../../NGCore/Client/Core/Capabilities").Capabilities;
var View = require("./View").View;
var Button = require("./Button").Button;
var Window = require("./Window").Window;
var Node = require("../../NGCore/Client/GL2/Node").Node; /** @private */

function getAnalyticsName(item)
{
    if(item && item.hasOwnProperty("analyticsName"))
    {
        return item.analyticsName || undefined; // If NULL, return undefined.
    }
    return undefined;
} /** @private */
var NavKeyListener = MessageListener.subclass(
{
    classname: "GLUI_NavController_KeyListener"
});
var MovingAnimation = MessageListener.subclass(
{
    classname: 'MovingAnimation',
    /** @private */
    initialize: function ()
    {},
    startAnimate: function (spriteNode, destination, duration, rem, callBackFunc)
    {
        this._callBackFunc = callBackFunc;
        this._rem = rem;
        this._initialPosition = spriteNode.getPosition();
        this._spriteNode = spriteNode;
        this._destination = destination;
        UpdateEmitter.addListener(this, this._setPosition);
        var deltaVector = new Vector();
        deltaVector.setX(this._destination.getX() - this._initialPosition.getX());
        deltaVector.setY(this._destination.getY() - this._initialPosition.getY());
        this._deltaVector = deltaVector;
        var now = Time.getFrameTime();
        this._mStartTime = now;
        this._mStopTime = now + duration;
        this._mDuration = duration;
    },
    /** @private */
    _setPosition: function (delta)
    {
        var now = Time.getFrameTime();
        if(now > this._mStopTime)
        {
            this._spriteNode.setPosition(this._destination.getX(), this._destination.getY());
            if(this._rem)
            {
                if(typeof this._callBackFunc === 'function')
                {
                    this._callBackFunc();
                }
                UpdateEmitter.removeListener(this, this._setPosition);
                this.destroy();
            }
        }
        else
        {
            var slice = delta / this._mDuration;
            var newLocation = new Vector();
            newLocation.setX(this._initialPosition.getX() + (this._deltaVector.getX() * slice));
            newLocation.setY(this._initialPosition.getY() + this._deltaVector.getY() * slice);
            this._spriteNode.setPosition(newLocation.getX(), newLocation.getY());
        }
    },
    /** @private */
    destroy: function ($super)
    {
        $super();
    }
});
exports.NavController = View.subclass( /** @lends GLUI.NavController.prototype */
{
    classname: 'NavController',
    /**
     * @class The <code>NavController</code> class constructs objects that define application navigation components.
     * @constructs The default constructor.
     * @augments Core.Class
     * @param {$super} $super This parameter is a reference to the base class implementation and is stripped out during execution. Do not supply it.
     * @param {String} properties Object properties.
     */
    initialize: function ($super, properties)
    {
        $super(properties);
        this.navStack = [];
        var isAndroid = Capabilities.getPlatformOS() === 'Android';
        if(isAndroid)
        {
            //If it is an android device, do not use graphical Back button.
            this._useGraphicalBackButton = false;
            //Instead add a listener for Device Back button.
            this.keyListener = new NavKeyListener();
            KeyEmitter.addListener(this.keyListener, this.onKeyPressed.bind(this));
        }
        else
        {
            this._useGraphicalBackButton = true;
        }
        this._nodeForMovement = null;
        this._previousView = null;
        this._backButton = null;
        this._mAnimation = null;
    },
    /**
     * Turn on the onscreen <b>Back</b> button. Applications designed for iOS should always provide the <b>Back</b> button
     * and integrate it into the application UI (calling <code>{@link GLUI.NavController#back}</code> when pressed).<br><br>
     * <b>Note:</b> This is turned off by default for applcations designed for Android because Android devices contain a hardware <b>Back</b> button.
     * @param {Boolean} shallUse Set as <code>true</code> to enable the onscreen <b>Back</b> button.
     * @function
     * @status Javascript, Android, Flash
     */
    setUseBackButton: function (shallUse)
    {
        this._useGraphicalBackButton = (shallUse) ? true : false;
        if(shallUse)
        {
            this._createBackButton();
        }
        else
        {
            if(this._backButton)
            {
                this._backButton.removeFromParent();
            }
        }
    },
    /**
     * Reset the stack for this <code>NavController</code>.
     * @param {String} fromButton The button to reset.
     * @status Javascript, Android, Flash
     */
    clear: function (fromButton)
    {
        return this.backToView(undefined);
    },
    /**
     * @private
     * @status Javascript, Android, Flash, Test
     */
    logNavEvent: function (from, to, via)
    {
        var toName = getAnalyticsName(to);
        var fromName = getAnalyticsName(from);
        var viaName = getAnalyticsName(via);
        if(fromName || toName)
        {
            Analytics._getPipe().navigationEvent(fromName, toName, viaName);
        }
    },
    /**
     * Retrieve the top view from the nav stack of this <code>NavController</code>.
     * @returns {Object} The top view in the nav stack
     * @status Javascript, Android, Flash
     * @function
     */
    getTopView: function ()
    {
        //for stack implementation, the last item is at the top of the stack, so we are accessing the last index of the navStack
        return(this.navStack.length > 0) ? this.navStack[(this.navStack.length - 1)] : undefined;
    },
    /**
     * @private
     * @status Javascript, Android, Flash
     */
    navStackDepth: function ()
    {
        return this.navStack.length;
    },
    /**
     * @private
     * @status Javascript, Android, Flash
     */
    depthOfView: function (targetView)
    {
        //private method, so there is no need to check targetView type here.
        var targetIndex = this.navStack.indexOf(targetView);
        if(targetIndex === -1)
        {
            return -1;
        }
        return this.navStack.length - targetIndex - 1;
    },
    /**
     * @private
     * @status Javascript, Android, Flash
     */
    viewAtDepth: function (targetDepth)
    {
        if(targetDepth >= this.navStack.length)
        {
            return null;
        }
        return this.navStack[this.navStack.length - targetDepth - 1];
    },
    /**
     * @private
     * @status Javascript, Android, Flash
     */
    removeDeepView: function (targetView)
    {
        var targetIndex = this.navStack.indexOf(targetView);
        if(targetIndex === -1)
        {
            console.log("NavController: trying to remove a nonexistent view from the nav stack!");
            return;
        }
        this.navStack.splice(targetIndex, 1);
    },
    /**
     * @protected
     * @status Javascript, Android, Flash
     * @function
     */
    _viewTransition: function (fromView, toView, back, buttonRef)
    {
        var myFrame = this.getFrame();
        var w = myFrame[2];
        var h = myFrame[3];
        if(this._nodeForMovement === null)
        {
            this._nodeForMovement = new Node();
        }
        else
        {
            this._nodeForMovement.destroy();
            this._nodeForMovement = new Node();
        }
        this._internalGLObject.addChild(this._nodeForMovement);
        if(fromView)
        {
            fromView.setFrame([0, 0, w, h]);
            this._previousView = fromView;
            this._nodeForMovement.addChild(fromView.getGLObject());
        }
        if(toView)
        {
            toView.setFrame([(back ? -w : w), 0, w, h]);
            this._nodeForMovement.addChild(toView.getGLObject());
        }
        if(this._mAnimation !== null)
        {
            this._mAnimation.destroy();
            this._mAnimation = null;
        }
        if(this._mAnimation === null)
        {
            this._mAnimation = new MovingAnimation();
            this._mAnimation.startAnimate(this._nodeForMovement, (new Vector((back ? w : -w), 0)), 350, true, this._transComplete.bind(this));
        }
        this.logNavEvent(fromView, toView, buttonRef);
        this._createBackButton();
    },
    _transComplete: function ()
    {
        if(this._previousView !== null)
        {
            this._previousView.removeFromParent();
        }
    },
    /**
     * Retrieve removed views in the reverse order they were removed.
     * @example var page = new NavPage({...});
     *
     * var controller = new GLUI.NavController({...});
     *
     * NavPage.navController = controller;
     * controller.forwardToView(page);
     * @param {String} destView The destination view for this navigation component.
     * @param {String} fromButton The button that triggers this navigation component.
     * @status Javascript,, Android, Flash
     * @see GLUI.NavController#backToView
     */
    forwardToView: function (destView, fromButton)
    {
        var currentView = this.getTopView();
        if(destView && (!this._delegate || (this._delegate && typeof this._delegate.navControllerShouldPush === "function" && this._delegate.navControllerShouldPush(this, destView))))
        {
            this.navStack.push(destView);
            this._viewTransition(currentView, destView, false, fromButton);
        }
    },
    /**
     * Set back navigation for this <code>NavController</code>.
     * @param {String} fromButton The button that triggers this navigation component.
     * @status Javascript, Android, Flash
     * @see GLUI.NavController#forward
     */
    back: function (fromButton)
    {
        var removed = this.navStack.pop();
        if(!(removed && (!this._delegate || (this._delegate && typeof this._delegate.navControllerShouldPop === "function" && this._delegate.navControllerShouldPop(this, removed)))))
        {
            return null;
        }
        this._viewTransition(removed, this.getTopView(), true, fromButton);
        return removed;
    },
    /**
     * Retrieve removed views in the order they were removed.
     * @example var page = new NavPage({...});
     *
     * var controller = new GLUI.NavController({...});
     *
     * NavPage.navController = controller;
     * controller.backToView(page);
     * @param {String} destView The destination view for this navigation component.
     * @param {String} fromButton The button that triggers this navigation component.
     * @status Javascript, Android, Flash
     * @see GLUI.NavController#forwardToView
     */
    backToView: function (destView, fromButton)
    {
        var removedSet = [];
        var removed = this.navStack.pop();
        var originalView = removed;
        if(removed)
        {
            do
            {
                if(removed && (!this._delegate || (this._delegate && typeof this._delegate.navControllerShouldPop === "function" && this._delegate.navControllerShouldPop(this, removed))))
                {
                    removedSet.push(removed);
                }
                else
                {
                    break;
                }
                if(this.getTopView() === destView)
                {
                    break;
                }
                removed = this.navStack.pop();
            } while (removed);
        }
        if(removedSet.length > 0)
        {
            this._viewTransition(originalView, this.getTopView(), true, fromButton);
        }
        return removedSet;
    },
    /**
     * Set this <code>NavController</code> to launch the application when activated.
     * @status Javascript, Android, Flash
     */
    loadApp: function ()
    {},
    /**
     * @private
     * @status Javascript, iOS, Flash
     */
    onBackPressed: function ()
    {
        if(this.navStack.length > 1)
        {
            var analyticsName = "bcksbtn"; // Back System Button
            // if the topmost view has an analytics name, prefix the button
            var topView = this.getTopView();
            if(topView.analyticsName)
            {
                analyticsName = topView.analyticsName + "." + analyticsName;
            }
            this.back(
            {
                analyticsName: analyticsName
            });
            return true;
        }
        return false;
    },
    /**
     * @private
     * @status Javascript, Android
     */
    onKeyPressed: function (event)
    {
        //captures back key press on Android Devices
        if((event.code === Device.KeyEmitter.Keycode.back) && (this.navStack.length > 1))
        {
            this.back();
            return true;
        }
        return false;
    },
    /**
     * @protected
     * @status Javascript, Android, Flash
     */
    _delegate: null,
    /**
     * @description Set subscribers to the <code>NavController</code> behavior. Subscribers can modify what happens.
     * NavControllerDelegateProtocol:
     *  @optional - (BOOL)navControllerShouldPop(NavController,View)
     *  @optional - (BOOL)navControllerShouldPush(NavController,View)
     * @param {String} navDelegate A <code>NavController</code> subscriber.
     * @private
     * @status Javascript, Android, Flash
     */
    setDelegate: function ( /*NavControllerDelegate*/ navDelegate)
    {
        if(navDelegate.hasOwnProperty('navControllerShouldPop') && navDelegate.hasOwnProperty('navControllerShouldPush') && typeof navDelegate.navControllerShouldPop === 'function' && typeof navDelegate.navControllerShouldPush === 'function')
        {
            this._delegate = navDelegate;
        }
        else
        {
            console.log("<NGGo> WARNING : delegate does not implement the required protocol. Error in Method setDelegate " + this.classname);
            this._delegate = null;
        }
    },
    delegate: function ()
    {
        return this._delegate;
    },
    /**
     * @protected
     * @status Javascript, Android, Flash
     * @function
     */
    _createBackButton: function ()
    {
        // Do nothing if this device does not require an onscreen button.
        if(this._useGraphicalBackButton === false)
        {
            return;
        }
        if(!this._backButton)
        {
            this._backButton = new Button(
            {
                normalText: 'Back',
                textSize: 18.0,
                textColor: "FF",
                normalTextShadow: "00 1.5",
                frame: [-2, 20, Window.outerWidth / 5, Window.outerHeight / 12]
            });
            this._backButton.setBackgroundColor("8B8386");
            this._backButton.Controller = this;
            this._backButton.setOnClick(function ()
            {
                this.Controller.onBackPressed();
            });
        }
        if(this.navStack.length > 1)
        {
            if(!this._backButton.getParent())
            {
                Window.document.addChild(this._backButton);
            }
        }
        else if(this._backButton.getParent())
        {
            this._backButton.removeFromParent();
        }
    },
    /** @private */
    destroy: function ($super)
    {
        $super();
        if(this._nodeForMovement)
        {
            this._nodeForMovement.destroy();
            this._nodeForMovement = null;
        }
        if(this._backButton)
        {
            this._backButton.destroy();
            this._backButton = null;
        }
        if(this._mAnimation)
        {
            this._mAnimation.destroy();
            this._mAnimation = null;
        }
        this.delegate = null;
    }
});