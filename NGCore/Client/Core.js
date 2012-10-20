/**
 * <p>Classes and objects contained by the Core module.</p>
 * @name Core
 * @namespace Create an app's framework, and get information about a device's capabilities.
 * @description <p>The Core module is a collection of classes that provide apps with access to:</p>
 * <ul>
 * <li>Core components of a device.</li>
 * <li>APIs that define a class-based structure for development.</li>
 * <li>Objects that support app updates.</li>
 * </ul>
 * <p>Each class handles a specific aspect of the module implementation and contains APIs that support the class:</p>
 * <ul>
 * <li><code>{@link Core.Analytics}</code>: Construct objects that keep track of game-specific items that require analysis and counting.</li>
 * <li><code>{@link Core.Base64}</code>: Provides methods to encode and decode Base64 data.</li>
 * <li><code>{@link Core.Buffer}</code>: Provides buffers for binary data that is used by network operations.</li>
 * <li><code>{@link Core.Capabilities}</code>: A singleton object that contains data about device hardware components.</li>
 * <li><code>{@link Core.Class}</code>: Provides an object-oriented programming (OOP) framework for ngCore apps.</li>
 * <li><code>{@link Core.Color}</code>: Control the RGB color components of a device.</li>
 * <li><code>{@link Core.DiagnosticEmitter}</code>: A base class object for constructing objects that emit diagnostic notifications.</li>
 * <li><code>{@link Core.Diagnostics}</code>: A singleton object that emits diagnostics pertaining to frame tick and timing information generally applicable to frame processing.</li>
 * <li><code>{@link Core.ErrorEmitter}</code>: A singleton object that emits errors resulting from unexpected situations, such as exceptions in the native OS or uncaught exceptions in JavaScript.</li>
 * <li><code>{@link Core.LocalGameList}</code>: Construct objects that manage a user's game list.</li>
 * <li><code>{@link Core.Localization}</code>: Provides apps with access to localized strings.</li>
 * <li><code>{@link Core.MessageEmitter}</code>: A base class object for constructing objects that emit app notifications.</li>
 * <li><code>{@link Core.MessageListener}</code>: A base class object for constructing objects that handle app notifications.</li>
 * <li><code>{@link Core.Point}</code>: Control the point values for <i>x</i> and <i>y</i> coordinates.</li>
 * <li><code>{@link Core.Rect}</code>: Construct rectangle objects.</li>
 * <li><code>{@link Core.Size}</code>: Control the values for <i>height</i> and <i>width</i> components.</li>
 * <li><code>{@link Core.Time}</code>: A singleton that contains data about device timing values.</li>
 * <li><code>{@link Core.UpdateEmitter}</code>: Control the app update time rate.</li>
 * <li><code>{@link Core.Vector}</code>: Control the vector values for <i>x</i> and <i>y</i> coordinates.</li>
 * </ul>
 * @this CoreLoader
 */
function CoreLoader(map) {
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

exports.Core = new CoreLoader({
	'Analytics': function() { return require('./Core/Analytics').Analytics; },
	'Base64': function() { return require('./Core/Base64').Base64; },
	'Capabilities': function() { return require('./Core/Capabilities').Capabilities; },
	'Class': function() { return require('./Core/Class').Class; },
	'Color': function() { return require('./Core/Color').Color; },
	'Vector': function() { return require('./Core/Vector').Vector; },
	'Point': function() { return require('./Core/Point').Point; },
	'Size': function() { return require('./Core/Size').Size; },
	'Rect': function() { return require('./Core/Rect').Rect; },
	'MessageEmitter': function() { return require('./Core/MessageEmitter').MessageEmitter; },
	'MessageListener': function() { return require('./Core/MessageListener').MessageListener; },
	'ObjectRegistry': function() { return require('./Core/ObjectRegistry').ObjectRegistry; },
	'Time': function() { return require('./Core/Time').Time; },
	'toMD5': function() { return require('./Core/toMD5').toMD5; },
	'SHA1': function() { return require('./Core/SHA1').SHA1; },
	'UpdateEmitter': function() { return require('./Core/UpdateEmitter').UpdateEmitter; },
	'Proc': function() { return require('./Core/Proc').Proc; },
	'Logger': function() { return require('./Core/Logger').Logger; },
	'LocalGameList': function() { return require('./Core/LocalGameList').LocalGameList; },
	'Localization': function() { return require('./Core/Localization').Localization; },
	'_LocalGameList': function() { return require('./Core/_LocalGameList')._LocalGameList; },
	'NativeAppLaunch': function() { return require('./Core/NativeAppLaunch').NativeAppLaunch; },
	'ErrorEmitter': function() { return require('./Core/ErrorEmitter').ErrorEmitter; },
	'Diagnostics': function() { return require('./Core/Diagnostics').Diagnostics; },
	'DiagnosticEmitter': function() { return require('./Core/DiagnosticEmitter').DiagnosticEmitter; },
	'DiagnosticRegistry': function() { return require('./Core/DiagnosticEmitter').DiagnosticRegistry; },
	'Buffer': function() { return require('./Core/Buffer').Buffer; },
	'UTF8': function() { return require('./Core/UTF8').UTF8; },
	'TypeCheck': function() { return require('./Core/TypeCheck').TypeCheck; }
});
