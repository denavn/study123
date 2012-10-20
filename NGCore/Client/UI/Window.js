var Class = require('../Core/Class').Class;
var Commands = require('./Commands').Commands;
var Capabilities = require('../Core/Capabilities').Capabilities;
var ObjectRegistry = require('../Core/ObjectRegistry').ObjectRegistry;
var AbstractView = require('./AbstractView').AbstractView;
var Element = require('./Element').Element;
var Rect = require('./ViewGeometry').Rect;

var WindowLayer = require('./WindowLayer').WindowLayer;

// Singleton
// Methods beginning with an underscore are considered private and should
// not be called from outside of the class.

Commands.Window = exports.Window = Class.singleton({
/** @lends UI.Window.prototype */

	/**
	 * @deprecated Replaced by {@link UI.Window#getWidth}.
	 * @ignore
	 */
	_outerWidth: 0,

	/**
	 * @deprecated Replaced by {@link UI.Window#getHeight}.
	 * @ignore
	 */
	_outerHeight: 0,

	/**
	 * @private
	 */
	_width: 0,
	/**
	 * @private
	 */
	_height: 0,

	 /**
	 * @class The `UI.Window` class provides a singleton that manages an application's access to 
	 * native UI controls.
	 *
	 * To display a UI component, your application must add it as a child of the
	 * `UI.Window.document` singleton, either directly or as a child node of another view. See
	 * `{@link UI.Window#document}` for more information.
	 * @singleton
	 * @name UI.Window
	 * @augments Core.Class	
	 * @see UI.Window#document
	 * @since 1.0
	 */
	initialize: function() {
		if (!this._outerWidth || !this._outerHeight) this.setWidthAndHeight(Capabilities.getScreenWidth(), Capabilities.getScreenHeight());
		if (!this._width || !this._height) this._setWidthAndHeight(Capabilities.getScreenWidth(), Capabilities.getScreenHeight());
		
		Commands.instantiate();
		Device.LayoutEmitter._setWindow(this);
		NgLogD("window: outer = " + this._outerWidth + " × " + this._outerHeight + " frame = " + this._width + " × " + this._height);
	},
	
	/**
	 * A singleton that provides a virtual "document" for the window's UI components. To display a 
	 * UI component, your application must call `UI.Window.document.addChild()` to add the
	 * component to the document.The UI component will also be displayed if you add the component as
	 * a child node of another view, then call `UI.Window.document.addChild()` on the parent view.
	 * 
	 * This singleton has the following methods:
	 * 
	 * + `{Object} UI.Window.document.addChild(childNode, index)`: Add a view or UI component to the 
	 * document, causing it to display on the device's screen. The `childNode` parameter is an 
	 * object that represents a view or UI component. The optional `index` parameter is a positive 
	 * integer indicating the array index at which to insert the view or component; by default, the 
	 * view or component is added after the last index. Returns `this` to support method invocation
	 * chaining.
	 * + `{Number} UI.Window.document.getChildCount()`: Retrieve the number of children of
	 * the document. Returns the number of children.
	 * + `{Object[]} UI.Window.document.getChildren()`: Retrieve all children of the document.
	 * Returns an array of objects that represent UI components.
	 * + `{Object} UI.Window.document.removeChild(childNode)`: Remove a view or UI component from 
	 * the document. The `childNode` parameter is an object that represents a view or UI component. 
	 * Returns the view or component that was removed.
	 * @example
	 * // Set up a new button by doing the following:
	 * // 1. Create the button, and set its frame to an 80-pixel by 20-pixel
	 * //    rectangle in the upper left corner of the screen.
	 * // 2. Add the button to a new view, and set the new view's frame to fill
	 * //    the entire screen.
	 * // 3. Add the view to the document.
	 * var button = new UI.Button();
	 * button.setFrame([0, 0, 80, 20]);
	 * var view = new UI.View();
	 * view.addChild(button);
	 * view.setFrame([0, 0, Device.LayoutEmitter.getWidth(),
	 *   Device.LayoutEmitter.getHeight()]);
	 * UI.Window.document.addChild(view);
	 * // Retrieve the number of children of the document.
	 * var childCount = UI.Window.document.getChildCount();  // returns 1
	 * // Retrieve an array of the document's children.
	 * var children = UI.Window.document.getChildren();  // returns [{view}]
	 * // Remove the view from the document.
	 * var oldView = UI.Window.document.removeChild(view);  // returns {view}
	 * @fieldOf UI.Window#
	 */
	document: WindowLayer.singleton({
		'type': 'document',
		register: function() {
			// This is not a registered object.
			this.__objectRegistryId = 0;
		}
	}),
	
	_layers: {},
	_getLayer: function(level) {
		return this._layers[level] || (this._layers[level] = new WindowLayer({'level':level || 0}));
	},
	
	/**
	 * @private
	 */
	destroyObject: function(obj) {
		obj.removeFromParent();
		Commands.destroy.call(obj);
		ObjectRegistry.unregister(obj);
	},
	
	/**
	 * @private
	 */
	handleCommand: function(command) {
		// this.log(["Raw Command", command]);
		var fields = NgParseCommand2(command, NgParseInt, NgParseBase64);
	//	this.log(["handleCommand:", fields[1]]);
		this.doCommand(fields[1]);
	},
	/**
	* @private
	*/
	setStatusBarHidden: function(value) {
		Commands.setStatusBarHidden(value);
		this._outerHeight = Capabilities.getScreenHeight() - (value ? 0 : (Capabilities.getStatusBarHeight() || 0));
	},
	
	/**
	 * @private
	 */
	doCommand: function(jsonString) {
		//NgLogD(jsonString);
		var command = JSON.parse(jsonString);
		if(command.name == 'callback'){
			var cb = Commands.takeTemporaryCallback(command.callback_id);
			if (typeof cb == 'function') {
				cb(command);
			}
		} else {
			var object = ObjectRegistry.idToObject(command.objId);
			if (object instanceof Element) {
				switch (command.name) {
					case 'event':
						object.performEventCallback(command);
						break;
					case 'update':
						var properties = command.properties || {};
						for (var property in properties) {
							try {
								var setter = object['update' + property.charAt(0).toUpperCase() + property.substr(1)];
								if (typeof setter == 'function') {
									setter.apply(object, [properties[property]]);
								} else {
									// Set read-only properties!
									object['_'+property] = properties[property];
								}
							} catch (e) {}
						}
						break;
					default:
						object.handleCommand(command);
				}
			} else {
				console.log("Message received for non-element object with id " + command.objId);
				return;
			}
		}
		// log(["Got message back", command]);
	},
    
	/**
	 * @private
	 */    
	log: function(object) {
		NgLogD(object.toString());
		// this.postMessage({name: 'log', message: object});
	},
	/**
	 * Retrieve the available screen width, exclusive of orientation and system status bars.
	 *
	 * **Important**: If the device's orientation has recently changed, this method is not
	 * guaranteed to return the current screen width. Call `{@link Device.LayoutEmitter.getWidth}`
	 * to ensure that your application uses the correct screen width.
	 * @name getWidth
	 * @function
	 * @memberOf UI.Window#
	 * @returns {Number} The drawable width of the screen, in logical units. To determine how many
	 *		pixels the device uses per logical unit, call
	 *		`{@link Core.Capabilities#getScreenPixelUnits}`.
	 * @see Core.Capabilities#getScreenPixelUnits
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.1.5
	 */
	getWidth: function()
	{
		return this._width;
	},

	/**
	 * Retrieve the available screen height, exclusive of orientation and system status bars.
	 *
	 * **Important**: If the device's orientation has recently changed, this method is not
	 * guaranteed to return the current screen height. Call `{@link Device.LayoutEmitter.getHeight}`
	 * to ensure that your application uses the correct screen height.
	 * @name getHeight
	 * @function
	 * @memberOf UI.Window#
	 * @returns {Number} The drawable height of the screen, in logical units. To determine how many
	 *		pixels the device uses per logical unit, call
	 *		`{@link Core.Capabilities#getScreenPixelUnits}`.
	 * @see Core.Capabilities#getScreenPixelUnits
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.1.5
	 */
	getHeight: function()
	{
		return this._height;
	},

	getOuterWidth: function() {
		return this._outerWidth;
	},
	
	getOuterHeight: function() {
		return this._outerHeight;
	},

	getFrame: function() {
		return new Rect(0, 0, this._width, this._height);
	}
});

// Cause property access to initialize the singleton. Needed for backward compatibility.
Commands.Window.__defineGetter__("outerWidth", function() {return this.getOuterWidth()});
Commands.Window.__defineGetter__("outerHeight", function() {return this.getOuterHeight()});

/**
 * @private
 */
Commands.Window._setWidthAndHeight = function(width, height)
{
	console.log("window: set layout size to: " + width + ' × ' + height);
	this._width = width;
	this._height = height;
};

/**
 * @private
 */
Commands.Window.setWidthAndHeight = function(width, height)
{
	console.log("window: set outer size to: " + width + ' × ' + height);
	this._outerWidth = width;
	this._outerHeight = height;
};

