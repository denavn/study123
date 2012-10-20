/**
 * <p>Classes and objects contained by the Audio module.</p>
 * @name Audio
 * @namespace Play music and sound effects.
 * @description <p>The Audio module is a collection of classes that support manipulation of audio effects in an application.
 * Each class handles a specific aspect of the module implementation and contains APIs that support the class:</p>
 *<ul>
 *<li><code>{@link Audio.ActiveEffect}</code>: Construct objects for controlling the reproduction of <code>Effect</code> objects.</li>
 *<li><code>{@link Audio.Device}</code>: A singleton object that controls device sound effects volume.</li>
 *<li><code>{@link Audio.Diagnostics}</code>: A singleton object that provides diagnostic information about the app's use of the <code>Audio</code> module.</li>
 *<li><code>{@link Audio.Effect}</code>: Construct objects that load sound resources into memory.</li>
 *<li><code>{@link Audio.Music}</code>: A singleton object that controls the reproduction of application background music.</li>
 *</ul>
 */
exports.Audio = {};

exports.Audio.__defineGetter__("ActiveEffect", function() {
	delete this.ActiveEffect;
	return this.ActiveEffect = require('./Audio/ActiveEffect').ActiveEffect;
});
exports.Audio.__defineGetter__("Effect", function() {
	delete this.Effect;
	return this.Effect = require('./Audio/Effect').Effect;
});
exports.Audio.__defineGetter__("Device", function() {
	delete this.Device;
	return this.Device = require('./Audio/Device').Device;
});
exports.Audio.__defineGetter__("Music", function() {
	delete this.Music;
	return this.Music = require('./Audio/Music').Music;
});
exports.Audio.__defineGetter__("Diagnostics", function() {
	delete this.Diagnostics;
	return this.Diagnostics = require('./Audio/Diagnostics').Diagnostics;
});
