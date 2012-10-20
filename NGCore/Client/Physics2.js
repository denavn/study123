/**
 * <p>Classes and objects contained by the Physics2 module.</p>
 * @name Physics2
 * @namespace Control physical interactions between 2D objects.
 * @description <p>The Physics2 module is a collection of classes that control physics interaction between application bodies.
 * The module provides a JavaScript interface to the <a href="http://box2d.org/">Box2D physics
 * engine</a>, which runs in native code. If you have not worked with a physics engine before, or if
 * you have questions about Box2D's features and limitations, see the
 * <a href="http://box2d.org/manual.pdf">Box2D manual</a> for more information. (However, keep in
 * mind that the features available in the Physics2 module may not be identical to the features
 * available in Box2D's native interface.)</p>
 * <p>Each class handles a specific aspect of the module implementation and contains APIs that support the class:</p>
 * <ul>
 * <li><code>{@link Physics2.Body}</code>: Construct objects that support physics interaction with other <code>Body</code> objects.</li>
 * <li><code>{@link Physics2.BoxShape}</code>: Construct a box collision shape.</li>
 * <li><code>{@link Physics2.CircleShape}</code>: Construct a circle collision shape.</li>
 * <li><code>{@link Physics2.Contact}</code>: Construct objects that store information about contact between two bodies.</li>
 * <li><code>{@link Physics2.Diagnostics}</code>: Provide diagnostic information about the app's use of the Physics2 module.</li>
 * <li><code>{@link Physics2.DistanceJoint}</code>: Construct a distance joint that restricts the distance between two bodies.</li>
 * <li><code>{@link Physics2.Joint}</code>: A base class object for constructing <code>joint</code> objects.</li>
 * <li><code>{@link Physics2.MouseJoint}</code>: Construct a mouse joint that applies force at a specific location.</li>
 * <li><code>{@link Physics2.PolygonShape}</code>: Construct a polygon collision shape.</li>
 * <li><code>{@link Physics2.PrismaticJoint}</code>: Construct a prismatic joint that confines movement of two bodies along a specific axis.</li>
 * <li><code>{@link Physics2.Shape}</code>: A base class object for constructing <code>shape</code> objects.</li>
 * <li><code>{@link Physics2.WeldJoint}</code>: Construct a weld joint that holds two bodies completely stationary relative to each other.</li>
 * <li><code>{@link Physics2.World}</code>: Construct a physics world that contains bodies and allows simulation stepping.</li>
 * </ul>
 */
function Physics2Loader(map) {
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

exports.Physics2 = new Physics2Loader({
	'Body': function() { return require('./Physics2/Body').Body; },
	'BoxShape': function() { return require('./Physics2/BoxShape').BoxShape; },
	'CircleShape': function() { return require('./Physics2/CircleShape').CircleShape; },
	'Diagnostics': function() { return require('./Physics2/Diagnostics').Diagnostics; },
	'PolygonShape': function() { return require('./Physics2/PolygonShape').PolygonShape; },
	'Shape': function() { return require('./Physics2/Shape').Shape; },
	'World': function() { return require('./Physics2/World').World; },
	'Joint': function() { return require('./Physics2/Joint').Joint; },
	'DistanceJoint': function() { return require('./Physics2/DistanceJoint').DistanceJoint; },
	'MouseJoint': function() { return require('./Physics2/MouseJoint').MouseJoint; },
	'PrismaticJoint': function() { return require('./Physics2/PrismaticJoint').PrismaticJoint; },
	'RevoluteJoint': function() { return require('./Physics2/RevoluteJoint').RevoluteJoint; },
	'WeldJoint': function() { return require('./Physics2/WeldJoint').WeldJoint; },
	'PulleyJoint': function() { return require('./Physics2/PulleyJoint').PulleyJoint; },
	'_ConstantVolumeJoint': function() { return require('./Physics2/_ConstantVolumeJoint')._ConstantVolumeJoint; }
});

