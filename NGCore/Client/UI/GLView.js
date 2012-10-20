var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;

var GLView = exports.GLView = AbstractView.subclass(
/** @lends UI.GLView.prototype */
{
	'type':'glview',
	/**
	 * @class The `UI.GLView` class provides applications with access to OpenGL. Before an
	 * application instantiates objects in the `{@link GL2}` module, it must do the following:
	 *
	 * 1. Instantiate a `UI.GLView` object.
	 * 2. Call the `setFrame()` method, inherited from `{@link UI.AbstractView}`, to set the view's
	 * frame. You will normally set the frame so that it encompasses the device's entire screen.
	 * **Note**: When calling `{@link UI.AbstractView#setFrame}` on a `UI.GLView` object, you must
	 * set the `x` and `y` parameters to `0`. Using other values will result in undefined behavior.
	 * 3. Call the `setOnLoad()` method, inherited from `{@link UI.Element}`, to define a callback
	 * function that will run after the `UI.GLView` object has loaded. **Important**: You must wait
	 * for the callback to run before you add `GL2` objects to the OpenGL view.
	 * 4. Set the `active` property of the `UI.GLView` object to `true`.
	 * @name UI.GLView
	 * @augments UI.AbstractView	
 	 * @example
	 * // Create a new UI.GLView object without setting any of its properties,
	 * // then prepare the object for use.
	 * var glView = new UI.GLView();
     * glView.setFrame(0, 0, Device.LayoutEmitter.getWidth(),
	 *   Device.LayoutEmitter.getHeight());
	 * glView.setOnLoad(function() {
	 *     // Add code to create GL2 objects and add them as children of the
	 *     // GL2.Root singleton.
	 * });
	 * glView.setActive(true);
	 * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.GLView` object.
	 * @since 1.0.2
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		if (GLView._init) GLView._init();
		$super(properties);
	}
});

GLView._init = function() {
	delete GLView._init;
	if (AbstractView._init) AbstractView._init();

	/**
	 * Set the value of the `active` property, which indicates whether the `UI.GLView` will be
	 * displayed.
	 * @name UI.GLView#setActive
	 * @function
	 * @example
	 * var glView = new UI.GLView();
     * glView.setFrame(0, 0, Device.LayoutEmitter.getWidth(),
	 *   Device.LayoutEmitter.getHeight());
 	 * glView.setOnLoad(function() {
	 *     // Add code to create GL2 objects and add them as children of the
	 *     // GL2.Root singleton.
	 * });
	 * glView.setActive(true);
	 * @param {Boolean} active Set to `true` if the `UI.GLView` object is active.
	 * @returns {void}
	 * @see UI.GLView#getActive
	 * @status iOS, Flash, Test
	 */
	/**
	 * Retrieve the value of the `active` property, which indicates whether the `UI.GLView` will be
	 * displayed.
	 * @name UI.GLView#getActive
	 * @function
	 * @returns {Boolean} Set to `true` if the `UI.GLView` object is active.
	 * @see UI.GLView#setActive
	 * @status iOS, Android, Flash, Test
	 */
	GLView.synthesizeProperty('active', Commands.setActive);
	
	/**
	 * Retrieve an array that lists all of the OpenGL extensions that are supported in the current
	 * view. You can use this information to control how your application displays content. For
	 * example, some Android devices do not include hardware extensions for certain texture-mapping
	 * effects. This can result in low frame rates when an application requires these effects. On
	 * devices that lack the extensions, you could improve the application's frame rate by turning
	 * off the effect and displaying a different set of textures that simulates the effect. 
	 * 
	 * For more information about OpenGL extensions, see the
	 * [OpenGL website](http://www.opengl.org/resources/features/OGLextensions/).
	 * 
	 * **Note**: The return value of this method may be incorrect if the view is not active.
	 * @name UI.GLView#getOGLExtensions
	 * @returns {String[]} An array of OpenGL extensions that the device supports.
	 * @status Android
	 * @function
	 */
	GLView.registerAccessors('OGLExtensions', function() {return this['_OGLExtensions'];}, function() {} );
	
};
