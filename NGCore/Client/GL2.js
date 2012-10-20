/**
 * @name GL2
 * @namespace Draw sprites and animations, and handle touch events.
 * @description
 * The `GL2` module renders an application's sprites and animations, leveraging the device's support
 * for the OpenGL standard. `GL2` also provides monitoring of touch events within the context of an
 * OpenGL view, which is provided by the `{@link UI.GLView}` class.
 *
 * You can use the `GL2` module's classes to do all of the following:
 *
 * + Organize and group `GL2` nodes (`{@link GL2.Node}`, `{@link GL2.Root}`)
 * + Display static images, which can be warped and stretched arbitrarily (`{@link GL2.Sprite}`,
 * `{@link GL2.Primitive}`)
 * + Display flipbook-style animations (`{@link GL2.Animation}`, `{@link GL2.Animation.Frame}`)
 * + Move images around the screen (`{@link GL2.MotionController}`, `{@link GL2.MotionData}`)
 * + Create particle effects (`{@link GL2.Emitter}`, `{@link GL2.EmitterData}`)
 * + Draw arbitrary vertex-based polygons (`{@link GL2.Primitive}`, `{@link GL2.Primitive.Vertex}`)
 * + Display text (`{@link GL2.Text}`)
 * + Track touch events (`{@link GL2.TouchTarget}`, `{@link GL2.Touch}`)
 * + Render multiple images into a single texture, which can be displayed or saved to a file
 * (`{@link GL2.RenderTarget}`)
 * + Load texture images and fonts, either synchronously or asynchronously (`{@link GL2.Texture}`,
 * `{@link GL2.Font}`)
 *
 * You can also capture a screenshot from the device by calling `{@link UI.takeScreenshot}`.
 *
 * The components of a `GL2` scene are organized into a tree of nodes, commonly referred to as a
 * scene graph. The `{@link GL2.Root}` singleton is at the top of the scene graph, and all of the
 * scene graph's nodes are children or descendants of `{@link GL2.Root}`. A node can also exist
 * independently of the scene graph, but it will not be displayed, and its touch targets will not be
 * touchable.
 *
 * Each node can have parents and ancestors, as well as children and descendants. Nodes inherit many
 * of the properties of their parents and ancestors; for example, if node X has an ancestor that is
 * rotated by 45 degrees, node X will also be rotated by 45 degrees. See `{@link GL2.Node}` for
 * additional details.
 *
 * You can use clipping rectangles to hide portions of the scene graph. See
 * `{@link GL2.Node#setClipRect}` for details. When a clipping rectangle is enabled, content outside
 * of the clipping rectangle is not drawn, and touch targets outside of the clipping rectangle do
 * not respond to touch inputs.
 *
 * The `GL2` module is supported by the `{@link UI.GLView}` class. Before an application
 * instantiates objects in the `GL2` module, it must do the following:
 *
 * 1. Instantiate a `{@link UI.GLView}` object.
 * 2. Call the object's `setFrame()` method, inherited from `{@link UI.AbstractView}`, to set the
 * view's frame. You will normally set the frame so that it encompasses the device's entire screen.
 * 3. Call the object's `setOnLoad()` method, inherited from `{@link UI.Element}`, to define a
 * callback function that will run after the `{@link UI.GLView}` object has loaded. **Important**:
 * You must wait for the callback to run before you call any method in the `GL2` module.
 * 4. Set the `active` property of the `{@link UI.GLView}` object to `true`.
 *
 * Applications should not attempt to display `{@link UI}` and `GL2` objects at the same time, with
 * the sole exception of `{@link UI.GLView}` objects. Displaying other `{@link UI}` objects at the
 * same time as `GL2` objects can result in poor performance.
 *
 * If your application needs to combine UI components and other graphics on the same screen,
 * consider using the ngGo toolkit. Its `GLUI` module reimplements the `{@link UI}` module in
 * OpenGL, enabling you to combine UI components with other graphics. Although `GLUI` does not
 * support all of the `{@link UI}` module's styling options, it offers enough flexibility for many
 * applications.  You can download ngGo from the Downloads section on the
 * [Mobage Developer Portal](https://developer.mobage.com/).
 */
function GL2Loader(map) {
	this.add = function(key, toEval) {
		this.__defineGetter__(key, function() {
			delete this[key];
			return this[key] = toEval();
		});
	};
	for (var k in map) {
		if (map.hasOwnProperty(k)) this.add(k, map[k]);
	}
}

exports.GL2 = new GL2Loader({
	'Animation': function() { return require('./GL2/Animation').Animation; },
	'EmitterData': function() { return require('./GL2/EmitterData').EmitterData; },
	'Emitter': function() { return require('./GL2/Emitter').Emitter; },
	'Font': function() { return require('./GL2/Font').Font; },
	'MotionController': function() { return require('./GL2/MotionController').MotionController; },
	'MotionData': function() { return require('./GL2/MotionData').MotionData; },
	'Node': function() { return require('./GL2/Node').Node; },
	'Primitive': function() { return require('./GL2/Primitive').Primitive; },
	'Touch': function() { return require('./GL2/Touch').Touch; },
	'TouchTarget': function() { return require('./GL2/TouchTarget').TouchTarget; },
	'Root': function() { return require('./GL2/Root').Root; },
	'Sprite': function() { return require('./GL2/Sprite').Sprite; },
	'Text': function() { return require('./GL2/Text').Text; },
	'Texture': function() { return require('./GL2/Texture').Texture; },
	'RenderTarget': function() { return require('./GL2/RenderTarget').RenderTarget; },
	'Diagnostics': function() { return require('./GL2/Diagnostics').Diagnostics; }
});
