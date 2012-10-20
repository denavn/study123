var MessageListener = require("../Core/MessageListener").MessageListener;
var KeyEmitter = require("../Device/KeyEmitter").KeyEmitter;
var Window = require("./Window").Window;
var Capabilities = require("../Core/Capabilities").Capabilities;
var Element = require("./Element").Element;
var View = require("./View").View;
var Commands = require("./Commands").Commands;

var NavKeyListener = MessageListener.subclass({
	classname: "UI_NavController_KeyListener"
});

var NavController = exports.NavController = View.subclass(
/** @lends UI.NavController.prototype */
{
	/**
	 * @class The `UI.NavController` class enables your application to navigate between multiple
	 * views in a navigation stack.
	 * @name UI.NavController
	 * @constructs Create a navigation controller.
	 * @augments UI.View
	 * @example
	 * // Create a new UI.NavController object without setting any of its properties.
	 * var navController = new UI.NavController();
	 * @example
	 * // Create a new UI.NavController object, setting its view frame to the entire screen.
	 * var navController = new UI.NavController({
	 *     frame: UI.Window.getFrame()
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new 
	 *		`UI.NavController` object. See `{@link UI.AbstractView}` for information about the
	 *		properties that are supported.
	 * @since 1.0
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (NavController._init) NavController._init();
		
	    this.navStack = [];
		var onAndroid = Capabilities.getPlatformOS() == 'Android';
	    this._useBackButton = !onAndroid;
	
		this.keyListener = new NavKeyListener();
		KeyEmitter.addListener(this.keyListener, this.onKeyPressed.bind(this));
		$super(properties);
	},
	
	/**
	 * Display a Back button on the screen. Applications that will run on iOS should always provide
	 * an on-screen Back button and call `{@link UI.NavController#back}` when it is pressed. On
	 * Android devices, which have a hardware Back button, this method has no effect.
	 * @function
	 * @example
	 * var navController = new UI.NavController();
	 * navController.setUseBackButton(true);
	 * @param {Boolean} toUse Set to `true` to enable the on-screen Back button.
	 * @returns {void}
	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
	 */
	setUseBackButton: function(toUse) {
		this._useBackButton = toUse;
		if (toUse) {
			this._createBackButton();
		} else if (this.backButton) {
			this.backButton.removeFromParent();
		}
	},
    
	// don't document the unused fromButton parameter, per jyopp
	/**
	 * Reset the navigation stack, removing all views from the stack.
	 * @name UI.NavController#clear
	 * @function
	 * @example
	 * var navController = new UI.NavController();
	 * var page = new UI.View();
	 * navController.forwardToView(page);
	 * // When the application is finished with the navigation stack:
	 * navController.clear();
	 * @returns {Object[]} The views that were removed, or an empty array if no views were removed.
	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
	 */
	
	clear: function(fromButton) {
		return this.backToView(undefined);
	},
	
	/**
	 * Retrieve the top view from the navigation stack.
	 * @returns {Object} The top view in the navigation stack, or `undefined` if the navigation
	 *		stack does not contain any views.
	 * @status Javascript, iOS, Android, Flash
	 * @function
	 * @since 1.0
	 */
	getTopView: function() {
		return (this.navStack.length > 0) ? this.navStack[ (this.navStack.length - 1) ] : undefined;
	},
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash
	*/
	navStackDepth: function() {
		return this.navStack.length;
	},
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash
	*/
	depthOfView: function(targetView) {
		var targetIndex = this.navStack.indexOf(targetView);
		if(targetIndex == -1){return -1;}
		
		return this.navStack.length - targetIndex - 1;
	},
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash
	*/
	viewAtDepth: function(targetDepth) {
		if(targetDepth >= this.navStack.length){
			return null;
		}
		return this.navStack[this.navStack.length - targetDepth - 1];
	},
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash
	*/
	removeDeepView:function(targetView) {
		var targetIndex = this.navStack.indexOf(targetView);
		if(targetIndex == -1){
			NgLogE("NavController: trying to remove a nonexistent view from the nav stack!");
			return;
		}
		this.navStack.splice(targetIndex,1);
	},
    
	/**
	 * @protected
	 * @status Javascript, iOS, Android, Flash
	 * @function
	 * @since 1.0
	 */
	_viewTransition: function(fromView, toView, back) {
		//The views transition within the container (which is 'this')
		var myFrame = this.getFrame();
		var w = myFrame[2];
		var h = myFrame[3];
		
		//TODO: animate this (below) transition.
		if (toView) {
			toView.setFrame( (back ? -w : w), 0, w, h);
			this.addChild(toView);
		}
		
		Commands.animate(function() {
			if (fromView) fromView.setFrame( (back ? w : -w), 0, w, h);
			if (toView) toView.setFrame(0, 0, w, h);
		}, 400, function() {
			if (fromView) fromView.removeFromParent();
		});
		
		this._createBackButton();
	},

	// don't document the unused fromButton parameter
	/**
	 * Add the specified view to the navigation stack, and move forward to the view.
	 * @name UI.NavController#forwardToView
	 * @function
	 * @example
	 * var navController = new UI.NavController();
	 * var page = new UI.View();
	 * navController.forwardToView(page);
	 * @param {Object} destView The view to display.
	 * @returns {void}
	 * @status Javascript, iOS, Android, Flash
	 * @see UI.NavController#backToView
	 * @since 1.0
	 */
	
	forwardToView: function(destView, fromButton) {
		var currentView = this.getTopView();
		if (destView && 
			(!this._delegate 
				|| (this._delegate 
					&& typeof this._delegate.navControllerShouldPush == "function" 
					&& this._delegate.navControllerShouldPush(this,destView))
			)) {
			
			destView.performEventCallback({eventType:"push",navController:this});
			
			this.navStack.push(destView);
			this._viewTransition(currentView, destView, false, fromButton);
		}
	},
    
	/**
	 * Go back to the previous view.
	 * @returns {Object} The view that was removed, or `null` if no view was removed.
	 * @status Javascript, iOS, Android, Flash
	 * @see UI.NavController#forward	
	 * @since 1.0
	 */
	back: function() {
		var removed = this.navStack.pop();
		
		if (removed && 
			(!this._delegate 
				|| (this._delegate 
					&& typeof this._delegate.navControllerShouldPop == "function" 
					&& this._delegate.navControllerShouldPop(this,removed))
			)) {
			removed.performEventCallback({eventType:"pop",navController:this});
		} else {
			return null;
		}
		this._viewTransition(removed, this.getTopView(), true);
		return removed;
	},

	// don't document the unused fromButton parameter
	/**
	 * Navigate back to the specified view, returning any views that were removed from the
	 * navigation stack in the order they were removed.
	 * @name UI.NavController#backToView
	 * @function
	 * @example
	 * var navController = new UI.NavController();
	 * var page1 = new UI.View(),
	 *     page2 = new UI.View(),
	 *     page3 = new UI.View();
	 * navController.forwardToView(page1);
	 * navController.forwardToView(page2);
	 * navController.forwardToView(page3);
	 * // removedViews will contain page3, followed by page2
	 * var removedViews = navController.backToView(page1);
	 * @param {Object} destView The view to display.
	 * @returns {Object[]} The views that were removed, or an empty array if no views were removed.
	 * @see UI.NavController#forwardToView
	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
	 */

	backToView: function(destView, fromButton) {
		var removedSet = [];
		var removed = this.navStack.pop();
		var originalView = removed;
		if (removed) {
			do {
				if (removed && 
					(!this._delegate 
						|| (this._delegate 
							&& typeof this._delegate.navControllerShouldPop == "function" 
							&& this._delegate.navControllerShouldPop(this,removed))
					)) {
					removedSet.push(removed);
					removed.performEventCallback({eventType:"pop",navController:this});
				}
				else {
					//There was nothing to remove, or the this._delegate said "don't remove".
					break;
				}
				
				if (this.getTopView() == destView){break;}
			} while ((removed = this.navStack.pop()));
		}
		if(removedSet.length > 0) {
			this._viewTransition(originalView, this.getTopView(), true, fromButton);
		}
		return removedSet;
	},

	/**
	 * Set the navigation controller to launch the application when activated.
	 * @returns {void}
	 * @status Javascript, iOS, Android, Flash
	 * @since 1.0
	 */    
	loadApp: function() {		
	},
    
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash
	 */    
	onBackPressed: function() {
		if (this.navStack.length > 1) {
		//	NgLogD("Handle back on nav stack. Number of views on stack=" + this.navStack.length);
			this.back();
			return true;
		}
		return false;
	},
	
	onKeyPressed: function(event) {
		if ((event.code === KeyEmitter.Keycode.back) && (this.navStack.length > 1)) {
			this.back();
			return true;
		}
		return false;
	},
	
	/**
	 * @protected
	 * @status Javascript, iOS, Android, Flash
	 */
	_delegate:null,
	/**
	 * @description Set subscribers to the `NavController` behavior. Subscribers can modify what happens. 
	 * NavControllerDelegateProtocol:
	 *	@optional - (BOOL)navControllerShouldPop(NavController,View)
	 *	@optional - (BOOL)navControllerShouldPush(NavController,View)
	 * @param {String} navDelegate A `NavController` subscriber.
	 * @private
	 * @status Javascript, iOS, Android, Flash
	 */
	setDelegate:function( /*NavControllerDelegate*/ navDelegate){
		this._delegate = navDelegate;
	},
	
	delegate:function(){return this._delegate;},
	
	/**
	 * @protected
	 * @status Javascript, iOS, Android, Flash
	 * @function
	 * @since 1.0
	 */
	_createBackButton: function() {
		// Do nothing if this device does not require an onscreen button.
		if (!this._useBackButton) return;
		
		if (!this.backButton) {
			this.backButton = new UI.Button({
				normalText: 'Back',
				textSize: 13.0,
				normalTextColor: "FF",
				normalTextShadow: "00 1.5 {0,-1}",
				frame: [-2, 20, Window.outerWidth / 5, Window.outerHeight / 12],
				normalGradient: {
					corners: "0 8 8 0",
					outerLine: "00 1.5",
					innerShadow: "99FF 2.0 {0,-1}",
					gradient: [
						"FFCC 0.0",
						"FF80 1.0"
					]
				},
				highlightedGradient: {
					corners: "0 8 8 0",
					outerLine: "00 1.5",
					innerLine: "FF00 15 {0,-1}",
					gradient: [
						"FF50 0.0",
						"FF80 1.0"
					]
				}
			});
			this.backButton.onclick = this.bind(this.onBackPressed);
		}
		
		if (this.navStack.length > 1) {
			if (!this.backButton.getParent()) Window.document.addChild(this.backButton);
		} else if ( this.backButton.getParent() ) {
			this.backButton.removeFromParent();
		}
	}
});

NavController._init = function() {
	delete NavController._init;
	if (View._init) View._init();
};
