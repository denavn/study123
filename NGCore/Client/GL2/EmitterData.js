////////////////////////////////////////////////////////////////////////////////
// Class EmitterData
//
// Copyright (C) 2011 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Core = require('../Core').Core;

/*#if TYPECHECK
var T = Core.TypeCheck;
#endif*/

////////////////////////////////////////////////////////////////////////////////

var EmitterData = exports.EmitterData = Core.Class.subclass(
/** @lends GL2.EmitterData.prototype */
{
    classname: 'EmitterData',
    /**
     * @class The `EmitterData` class stores particle effect definition data that multiple `{@link GL2.Emitter}` objects can reference.
     *
     * Currently the only supported `EmitterData` format is `GravityEmitterData`.
     *
     *
     * ###GravityEmitterData JSON format for GL2.EmitterData###
     *
     * ####Overview####
     *
     * GL2.EmitterData uses a block of JSON to describe the behavior of a particle emitter system.
     * It is passed to a GL2.EmitterData object using the initFromData or initFromJSONFile.
     * Additionally, the mergeData call can be used to dynamically update data fields in real-time.
     *
     *
     * The GravityEmitterData form expects a valid JSON block of a single object with a 
     * set of key value pairs, wherein the keys must be strings.
     *
     *
     * The following caveats apply:
     *
     * 
     * + If a recognized key is not present, a default value is chosen for that key.</li>
     * + If an unknown key is present in the JSON, it is ignored.</li>
     * + If the value for a specific field is an unexpected type, an error is returned in the callback.</li>
     * + If there is a JSON parse error, an error is returned in the callback.</li>
     * 
     *
     * ####Recognized Keys####
     *
     * In general, keys that affect a particular attribute of the particle system will have the same prefix.
     * For example: all keys starting with "rotation_" will affect the rotation of each particle.
     *
     * ####Example JSON description of an explosion effect####
     *
     * <pre>
     * {
     *     "emitShape_type": "circle",
     *     "emitShape_circle_innerRadius": 0,
     *     "emitShape_circle_outerRadius": 20,
     *     "initVel_angle": 0,
     *     "initVel_angleDelta": 180,
     *     "initVel_speedMin": 30,
     *     "initVel_speedMax": 150,
     *     "physics_accel": [0, 200],
     *     "physics_radialAccel": 0,
     *     "physics_tangentialAccel": 0,
     *     "physics_dragCoeff": 2.0,
     *     "color_type": "randAnim",
     *     "color_randAnim_startMin": [0.5, 0.0, 0.0],
     *     "color_randAnim_startMax": [1.0, 1.0, 0.0],
     *     "color_randAnim_endMin": [0.5, 0.0, 0.0],
     *     "color_randAnim_endMax": [1.0, 0.0, 0.0],
     *     "alpha_type": "fade",
     *     "alpha_fade_in": 0.0,
     *     "alpha_fade_out": 0.5,
     *     "rotation_angle": 0,
     *     "rotation_spinRateMin": -2000,
     *     "rotation_spinRateMax": -1000,
     *     "rotation_alignToVelocity": false,
     *     "attractor_type": "none",
     *     "attractor_position": [0, 100],
     *     "attractor_falloff": "linear",
     *     "attractor_strength": 1,
     *     "size_type": "rand",
     *     "size_preserveAspectRatio": true,
     *     "size_aspectRatio": 1.0,
     *     "size_rand_min": [3, 3],
     *     "size_rand_max": [7, 7],
     *     "texture_type": "randPick",
     *     "texture_randPick": [{ "image": "Content/ballfx.png", "uvMin": [0.25, 0.5], "uvMax": [0.5, 0.75], "magFilter": "linear" },
     *                          { "image": "Content/ballfx.png", "uvMin": [0.75, 0.25], "uvMax": [1, 0.5], "magFilter": "linear" }],
     *     "emitter_position": [0, 0],
     *     "emitter_duration": 0,
     *     "emitter_lifetimeMin": 0.5,
     *     "emitter_lifetimeMax": 1.5,
     *     "emitter_rate": 70,
     *     "emitter_maxParticles": 70,
     *     "emitter_sortOrder": "none",
     *     "emitter_blendMode": "alpha",
     *     "emitter_freeParticles": true
     * }
     * </pre>
     *
     * ###Emitter###
     *
     * These values control the number and rate at which particles are emitted, as well as 
     * other properties which describe the lifetime of each particle, the sorting order, 
     * blend mode and coordinate frame.
     *
     * + `emitter_position` {[Number, Number]} - The origin of the emitter, in the local frame of the GL2.Emitter node. Default: [0, 0]
     * + `emitter_duration` {Number} - The amount of time particles will be emitted after `GL2.Emitter.play()` is called.
     *   0 indicates all particles are spawned at once. -1 indicates infinite spawning of particles. Default: 3.
     * + `emitter_lifetimeMin` {Number} - The minimum lifetime of a particle.  The lifetime of a specific particle is be randomly chosen, between the min and max. Default: 1
     * + `emitter_lifetimeMax` {Number} - The minimum lifetime of a particle.  The lifetime of a specific particle is be randomly chosen, between the min and max. Default: 2
     * + `emitter_rate` {Number} - When playing a GL2.Emitter will emit particles at this rate, in particles per second. Default: 20
     * + `emitter_maxParticles` {Number} - The total number of particles rendered and simulated is capped by this number.
     *   Increasing this number will increase both the memory used by the particle system and increase the CPU cost of playing it. Default: 50
     * + `emitter_freeParticles` {Boolean} - When a particle is spawned by the particle system on a moving GL2.Emitter it can either follow the motion of the emitter, or not.
     *   Setting this to false will cause all particles to follow changes in the GL2.Emitter transform. Default: false
     * + `emitter_sortOrder` {String} - When particles are drawn, some particles can be drawn on top of other particles from the same emitter.
     *   This parameter gives you the ability to set the sorting order. Default: "none"
     *     + "none" - no sorting
     *     + "oldestOnTop" - older particles will draw over of younger ones.
     *     + "newestOnTop" - new particles will draw over older ones.
     * + `emitter_blendMode` {String} - Used to control how each particle blends with the frame-buffer. Default: "alpha"
     *     + "opaque" - no blending at all.
     *     + "alpha" - alpha blending
     *     + "preMultipliedAlpha" - mix between alpha and additive blending.
     *     + "add" - additive blending.
     *     + "subtract" - subtractive blending.
     *
     * ###EmitShape###
     *
     * These values control where new particles are created.
     * Particles are created at a random position within the specified emitShape.
     * These values are in the GL2.Emitter coordinate frame; however, they can be offset 
     * using the `emitter_position` key.
     *
     * + `emitShape_type` {String} - type of volume. Default: "box"
     *     + "box" - Particles are spawned within an axis aligned box, the box size is specified by the `emitShape_box_max` and `emitShape_box_min` values.
     *     + "line" - Particles are spawned along the given line, the size of the line is specified by the `emitShape_line_length`, `emitShape_line_thickness` and `emitShape_line_angle` values.
     *     + "circle" - Particles are spawned within a circle, the size of the circle is specified by the `emitShape_circle_innerRadius` and `emitShape_circle_outerRadius` values.
     * + `emitShape_box_min` {[Number, Number]} - minimum values for the box, the first is in the x-dimension the second in the y-dimension. Default: [-50, -50]
     * + `emitShape_box_max` {[Number, Number]} - maximum values for the box, the first is in the x-dimension the second in the y-dimension. Default: [50, 50]
     * + `emitShape_line_length` {Number} - length of line.  Line is centered at `emitter_position`. Default: 100
     * + `emitShape_line_thickness` {Number} - thickness of line. Default: 10
     * + `emitShape_line_angle` {Number} - Angle of line in degrees.  0 indicates a horizontal line.
     *   Other angles will rotate it about its center at `emitter_position`. Default: 0
     *
     * ###InitVel###
     *
     * These values control the initial velocity of a particle when it is created.
     *
     * + `initVel_angle` {Number} - Angle in degrees, that specify the direction of travel. Default: 0
     * + `initVel_angleDelta` {Number} - Starting angle is randomized plus or minus this angle. Default: 10
     * + `initVel_speedMin` {Number} - Minimum speed of particle. Actual speed will be randomized between min and max. Default: 10
     * + `initVel_speedMax` {Number} - Maximum speed of particle. Actual speed will be randomized between min and max. Default: 20
     *
     * ###Physics###
     *
     * These values control how a particle accelerates or decelerates over time.
     *
     * + `physics_accel` {[Number, Number]} - Acceleration vector in GL2.Emitter local coordinate frame. Default: [0, 0]
     * + `physics_radialAccel` {Number} - Acceleration toward (negative values) or away from the origin, in GL2.Emitter local coordinate frame. Default: 0
     * + `physics_tangentialAccel` {Number} - Acceleration clockwise or counter-clockwise around the origin, in GL2.Emitter local coordinate frame. Default: 0
     * + `physics_dragCoeff` {Number} - Drag coefficient. Larger values will increase drag, smaller values will decrease it.  A value of 0 will disable drag.
     *   Drag is applied according to this equation: a = -k * v + g, where a is the acceleration applied to the particle, 
     *   k is the dragCoefficient, v is the velocity of the particle, and g is acceleration due to "gravity", which is the value from `physics_accel`.
     *   Note: enabling drag will increase CPU load when the effect is played. Default: 0
     *
     * ###Color###
     *
     *
     * These values control the color of a particle over time.
     *
     *
     * + `color_type` {String} Default: "constant"
     *     + "constant" - All particles will have the same color, specified by the `color_constant` key.
     *     + "rand" - A particle color will be randomly chosen between `color_rand_min` and `color_rand_max`.
     *     + "randAnim" - The particle start and end color will be randomly chosen. The color will change from the start color to the end color over the lifetime of the particle.
     *     + "keyframes" - The particle color is determines by a set of key frames.
     * + `color_constant` {[Number, Number, Number]} - Constant color of a particle.  Only active if `color_type` is "constant". Default: [1, 1, 1]
     * + `color_rand_min` {[Number, Number, Number]} - Minimum value for each color channel. Only active if `color_type` is "rand". Default: [1, 1, 1]
     * + `color_rand_max` {[Number, Number, Number]} - Maximum value for each color channel. Only active if `color_type` is "rand". Default: [1, 1, 1]
     * + `color_randAnim_startMin` {[Number, Number, Number]} - Minimum start value for each color channel. Only active if `color_type` is "randAnim". Default: [1, 1, 1]
     * + `color_randAnim_startMax` {[Number, Number, Number]} - Maximum start value for each color channel. Only active if `color_type` is "randAnim". Default: [1, 1, 1]
     * + `color_randAnim_endMin` {[Number, Number, Number]} - Minimum end value for each color channel. Only active if `color_type` is "randAnim". Default: [1, 1, 1]
     * + `color_randAnim_endMax` {[Number, Number, Number]} - Maximum end value for each color channel. Only active if `color_type` is "randAnim". Default: [1, 1, 1]
     * + `color_keyframes` {[{"key": Number, "value": [Number, Number, Number]}, ...]} - An array of keyframe objects.  Default: []
     *
     *   Each keyframe is an object with two keys:
     *
     *
     *   + "key" {Number} - a value from (0, 1) where 0 is the beginning of a particles lifetime and 1 is the end.
     *   + "value" - {[Number, Number, Number]} - the color desired at that time.
     *
     * ###Alpha###
     *
     * These values control the transparency of a particle over time.
     *
     * + `alpha_type` {String} Default: "fade"
     *     + "constant" - All particles will have a constant transparency value, specified by `alpha_constant`.
     *     + "fade" - Particles will fade in from transparent to opaque, then back to transparent.
     *     + "keyframe" - The particle transparency is determined by a set of key-frames.
     * + `alpha_constant` {Number} - Particle transparency (0 transparent, 1 opaque). Only active if `alpha_tpe` is "constant". Default: 1
     * + `alpha_fade_in` {Number} - Value specifying when particle will become opaque after being created.
     *   This value is from 0 to 1, where 0 is the beginning of a particle lifetime and 1 is the end.
     *   Only active if particle type is "fade".  Default: 0.1
     * + `alpha_fade_out` {Number} - Value specifying when particle will start becoming transparent before becoming fully transparent at the end of the particles lifetime.
     *   This value is from 0 to 1, where 0 is the beginning of a particle lifetime and 1 is the end.
     *   Only active if particle type is "fade".  Default: 0.9
     * + `alpha_keyframes` {[{"key": Number, "value": Number}, ...]} - An array of keyframe objects. Default: []
     *
     *   Each keyframe is an object with two keys:
     *     + "key" {Number} - a value from (0, 1) where 0 is the beginning of a particles lifetime and 1 is the end.
     *     + "value" - {Number} - the transparency value desired at that time.
     *
     * ###Rotation###
     *
     * These values control the rotation of a particle over time.
     *
     * + `rotation_angle` {Number} - Number in degrees, 0 indicates no rotation, positive numbers are clockwise rotations. Default: 0
     * + `rotation_spinRateMin` {Number} - Number in degrees per second. Actual particle spin rate will be chosen randomly between min and max. Default: 0
     * + `rotation_spinRateMax` {Number} - Number in degrees per second. Actual particle spin rate will be chosen randomly between min and max. Default: 0
     * + `rotation_alignToVelocity` {Boolean} - If true the rotation of the particle will be aligned with its velocity. Default: false
     *
     * ###Attractor###
     *
     * The particles within the particle system can be attracted to a specific position over time.
     *
     *
     * + `attractor_type` {String} Default: "none"
     *     + "none" - Attractor is disabled.
     *     + "local" - Attractor is specified in GL2.Emitter local coordinates.
     * + `attractor_position` {[Number, Number]} - position of GL2.Emitter. Default: [0, 0]
     * + `attractor_falloff` {String} - A particle is slowly attracted to the `attractor_position` over time.
     *   This parameter controls how fast or slow this attraction takes place. Default: "linear"
     *     + "linear" - particles move at a constant rate.
     *     + "easeIn" - particles start slowly and accelerate as they approach the destination
     *     + "easeOut" - particles start fast and decelerate as they approach the destination
     *     + "parabolic" - particles start fast, decelerate as they approach the midpoint, then accelerate as they approach the destination
     * + `attractor_strength` {Number} - Using this you can control the strength of the 
     *    attractor. When the value is 1 particles are guaranteed to end exactly on the 
     *    `attractor_position`. When the value is 0 there will be no attraction at all.
     *
     * ###Size###
     *
     * These values control the size of a particle over time.
     *
     * + `size_type` {String} Default: "constant"
     *     + "constant" - Particles will only have a single size specified by the `size_constant` value.
     *     + "rand" - Particle sizes will be randomly chosen between `size_rand_min` and `size_rand_max`.
     *     + "randAnim" - Particle sizes will be animated between a randomly determined start and end size.
     *     + "keyframes" - Particle size will specified by an array of keyframes.
     * + `size_preserveAspectRatio` {Boolean} - When true all particle sizes will have the aspect ratio. Default: false
     * + `size_aspectRatio` {Number} - The aspect ratio, (width / height) of each particle. Only takes effect if `size_preserveAspectRatio` is true. Default: 1
     * + `size_constant` {[Number, Number]} - The size of a particle. Only takes effect if `size_type` is "constant". Default: [10, 10]
     * + `size_rand_min` {[Number, Number]} - The minimum size of a particle. Only takes effect if `size_type` is "rand". Default: [10, 10]
     * + `size_rand_max` {[Number, Number]} - The maximum size of a particle. Only takes effect if `size_type` is "rand". Default: [10, 10]
     * + `size_randAnim_startMin` {[Number, Number]} - The minimum size of a particle's starting size. Only takes effect if `size_type` is "randAnim". Default: [10, 10]
     * + `size_randAnim_startMax` {[Number, Number]} - The maximum size of a particle's starting size. Only takes effect if `size_type` is "randAnim". Default: [10, 10]
     * + `size_randAnim_endMin` {[Number, Number]} - The minimum size of a particle's ending size. Only takes effect if `size_type` is "randAnim". Default: [10, 10]
     * + `size_randAnim_endMax` {[Number, Number]} - The maximum size of a particle's ending size. Only takes effect if `size_type` is "randAnim". Default: [10, 10]
     * + `size_keyframes` {[{"key": Number, "value": [Number, Number]}, ...]} - An array of keyframe objects. Default: []
     *   Each keyframe is an object with two keys:
     *     + "key" {Number} - a value from (0, 1) where 0 is the beginning of a particle's lifetime and 1 is the end.
     *     + "value" - {[Number, Number]} - the size value desired at that time.
     *
     * ###Texture###
     *
     * These values control textures used on a particle over time.
     * A texture object is a JSON block with the the following fields:
     *
     * + `image` {String} - filename of texture. Default: ""
     * + `uvMin` {[Number, Number]} - upper left hand corner of the particle texture in uv space.
     *   This can be used to select sub-rectangle within a sprite sheet. Default: [0, 0]
     * + `uvMax` {[Number, Number]} - lower right hand corner of the particle texture in uv space.
     *   This can be used to select sub-rectangle within a sprite sheet. Default: [1, 1]
     * + `uWrap` {String} - applies to x or u coordinate of the texture only. Default: "clampToEdge"
     *     + "clampToEdge" - any u value outside of the texture will be clamped to the color at the edge of the texture.
     *     + "wrap" - any u value outside of the texture will be wrapped.
     * + `vWrap` {String} - applies to y or v coordinate of the texture only. Default: "clampToEdge"
     *     + "clampToEdge" - any v value outside of the texture will be clamped to the color at the edge of the texture.
     *     + "wrap" - any v value outside of the texture will be wrapped.
     * + `minFilter` {String} - how filtering occurs when texture is minified, i.e. is smaller than the screen resolution. Default: "linear"
     *     + "nearest" - this nearest texel value is chosen.
     *     + "linear" - the texel value is computing by averaging the four nearest texels.
     * + `magFilter` {String} - how filtering occurs when texture is magnified, i.e. is larger than screen resolution. Default: "linear"
     *     + "nearest" - this nearest texel value is chosen.
     *     + "linear" - the texel value is computing by averaging the four nearest texels.
     *
     * These fields take a texture object as a parameter:
     *
     * + `texture_type` {String} Default: "none"
     *     + "constant" - Each particle has the same texture, specified by `texture_constant`.
     *     + "randPick" - Each particle has a single texture, chosen at random from a set of textures.
     *     + "keyframes" - Each particle animates through a series of textures.
     *     + "none" - particle is an untextured solid square
     * + `texture_constant` {Object} - Describes particle texture used for all particles.  Only used if `texture_type` is "constant".
     * + `texture_randPick` {[Object, ...]} - An array of objects that describe a texture.
     * + `texture_keyframes` {[{"key": Number, "value": Object}, ...]} - An array of keyframes.
     *   Each keyframe is an object with two keys:
     *     + "key" {Number} - a value from (0, 1) where 0 is the beginning of a particles lifetime and 1 is the end.
     *     + "value" - {Object} - the texture object desired at that time.
     *
     * @constructs The default constructor.
     * @augments Core.Class
     * @since 1.8
     */
    initialize: function ()
    {
        Core.ObjectRegistry.register(this);
        this._createSendGen(this.__objectRegistryId);
        this._callbackIndexCounter = 1;
        this._callbacks = [];
    },

    /**
     * Destroys this `EmitterData` object.
     * When you call `destroy` on a `EmitterData` object that is referred to by existing `{@link GL2.Emitter}`
     * objects, the `EmitterData` object is not destroyed until the last referring `{@link GL2.Emitter}` object is destroyed.
     * @returns {void}
     * @since 1.8
     * @status iOS, Android, Flash
     */
    destroy: function ()
    {
        this._destroySendGen();
        Core.ObjectRegistry.unregister(this);
    },

    /**
     * Verifies that `dataFormat` is a legal `EmitterData.DataFormat` enum.
     * @param {GL2.EmitterData.DataFormat} dataFormat The data format to check. Currently, only GL2.EmitterData.GravityEmitterData is supported.
     * @returns {Boolean}
     * @since 1.8
     * @status iOS, Android, Flash
     */
    isDataFormatSupported: function (dataFormat)
    {
        if (Core.Capabilities.meetsBinaryVersion && Core.Capabilities.meetsBinaryVersion([1,8,0,0,0])) {
            return dataFormat === EmitterData.DataFormat.GravityEmitterData;
        } else {
            return false;
        }
    },

    /**
     * Initialize this `EmitterData` object with particle system data in a given format.
     * This will completely erase and replace all existing data currently used by this `EmitterData`.
     * If you wish to only modify a subset of the existing data, not replace all of it, use the {@link GL2.EmitterData#mergeData} method instead.
     * The callback will be evoked when data parsing is complete or in the event of an error.
     * The callback is called with two arguments an error object with a code and description fields, as well as the `EmitterData` object itself.
     * @param {Object | String} dataOrJSONString A data object or a string in JSON format
     * @param {GL2.EmitterData.DataFormat} dataFormat The data format of the dataOrJSONString argument
     * @cb {Function} callback Called in the case of an error when reading the object or string
     * @cb-param {Object} error Error object detailing the parse error
     * @cb-param {GL2.EmitterData.ErrorCode} error.code 
     * @cb-param {String} error.description Description of the error
     * @cb-returns {void}
     * @returns {GL2.EmitterData}
     * @since 1.8
     * @status iOS, Android, Flash
     */
    initFromData: function (dataOrJSONString, dataFormat, callback)
    {
/*#if TYPECHECK
        T.validateArgs(arguments, [T.Arg('any'), T.Arg('integer'), T.Arg('function')]);
#endif*/
		var id;
		if (this.isDataFormatSupported(dataFormat))
		{
			if (typeof dataOrJSONString === 'string' || typeof dataOrJSONString === 'object') {
				// register callback
				id = this._callbackIndexCounter++;
				this._callbacks[id] = callback;
				if (typeof dataOrJSONString === 'string') {
					this._initFromDataSendGen(dataOrJSONString, dataFormat, id);
				} else {
					this._initFromDataSendGen(JSON.stringify(dataOrJSONString), dataFormat, id);
				}
			} else {
				if (callback && typeof callback === 'function') {
					callback({ code: EmitterData.ErrorCode.TypeError, description: "Expected Object or String" }, this);
				}
			}
		} else {
			if (callback && typeof callback === 'function') {
				callback({ code: EmitterData.ErrorCode.UnsupportedFormat, description: "Data Format Not Supported" }, this);
			}
		}
		return this;
	},

    /**
     * Change a subset of this `EmitterData` object properties. This will only change the data specified.
     * Any unspecified data will not be changed.  This can be used to apply delta updates.
     * @param {Object | String} dataOrJSONString A data object or a string in JSON format
     * @returns {this}
     * @since 1.8
     * @status iOS, Android, Flash
     */
    mergeData: function (dataOrJSONString)
    {
        if (typeof dataOrJSONString === 'string') {
            this._mergeDataSendGen(dataOrJSONString);
        } else {
            this._mergeDataSendGen(JSON.stringify(dataOrJSONString));
        }
        return this;
    },

    /**
     * Initialize this `EmitterData` object with particle system data in the given format from a JSON formatted file.
     * This will completely erase and replace all existing data currently used by this `EmitterData`.
     * The callback will be envoked when data parsing is complete or in the case of an error.
     * @example
     * ed.initFromJSONFile('Content/explosion.json', GL2.EmitterData.DataFormat.GravityEmitterData, function (error, ed) {
     *     if (error) {
     *         console.log("error.code = " + error.code + ", error.description = " + error.description);
     *         throw new Error(error.description);
     *     } else {
     *         console.log('success!');
     *     }
     * });
     * @param {String} filename The path to the file relative to the game root
     * @param {GL2.EmitterData.DataFormat} dataFormat The data format of the file argument
     * @cb {Function} callback Called in the case of an error when reading the object or string
     * @cb-param {Object} error Error object detailing the parse error
     * @cb-param {GL2.EmitterData.ErrorCode} error.code 
     * @cb-param {String} error.description Description of the error
     * @cb-returns {void}
     * @returns {GL2.EmitterData}
     * @since 1.8
     * @status iOS, Android, Flash
     */
    initFromJSONFile: function (filename, dataFormat, callback)
    {
/*#if TYPECHECK
        T.validateArgs(arguments, [T.Arg('string'), T.Arg('integer'), T.Arg('function')]);
#endif*/
		var id;
		if (this.isDataFormatSupported(dataFormat))
		{
			if (typeof filename === 'string') {
				// register callback
				id = this._callbackIndexCounter++;
				this._callbacks[id] = callback;
				this._initFromJSONFileSendGen(filename, dataFormat, id);
			} else {
				callback({ code: EmitterData.ErrorCode.InvalidFilename, description: "Invalid filename" }, this);
			}
		} else {
			if (callback && typeof callback === 'function') {
				callback({ code: EmitterData.ErrorCode.UnsupportedFormat, description: "Data Format Not Supported" }, this);
			}
		}
		return this;
	},

    /**
     * @private
     */
    _invokeCallbackRecv: function (cmd) {
        var msg = {};
        if (!this._invokeCallbackRecvGen(cmd, msg)) {
            return;
        }

        var id = msg.callbackId;
        if (!id) {
            NgLogE("GL2.EmitterData._invokeCallbackRecv command : bad id = " + id);
            return;
        }
        var cb = this._callbacks[id];
        if (!cb) {
            NgLogE("GL2.EmitterData._invokeCallbackRecv command : No registered callback found, id = " + id);
            return;
        }
        delete this._callbacks[id];
        if (msg.description) {
            // pass error to callback
            cb({ code: msg.code, description: msg.description }, this);
        } else {
            // no error, pass null to callback
            cb(null, this);
        }
    },

// {{?Wg Generated Code}}
	
	// Enums.
	DataFormat:
	{ 
		GravityEmitterData: 0
	},
	
	ErrorCode:
	{ 
		TypeError: 0,
		UnsupportedFormat: 1,
		InvalidFilename: 2,
		ParseError: 3,
		DataError: 4
	},
	
	///////
	// Class constants (for internal use only):
	_classId: 367,
	// Method create = -1
	// Method destroy = 2
	// Method initFromData = 3
	// Method initFromJSONFile = 4
	// Method invokeCallback = 5
	// Method mergeData = 6
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Core.Proc.parseInt( cmd.shift(), 10 );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Core.Proc.parseInt( cmd.shift(), 10 );
			var instance = Core.ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				case 5:
					instance._invokeCallbackRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in EmitterData._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in EmitterData._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[367] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_invokeCallbackRecvGen: function( cmd, obj )
	{ 
		if( cmd.length !== 3 )
		{
			NgLogE("Could not parse due to wrong argument count in EmitterData.invokeCallback from command: " + cmd );
			return false;
		}
		
		obj[ "callbackId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "callbackId" ] === undefined )
		{
			NgLogE("Could not parse callbackId in EmitterData.invokeCallback from command: " + cmd );
			return false;
		}
		
		obj[ "description" ] = Core.Proc.parseString( cmd[ 1 ] );
		if( obj[ "description" ] === undefined )
		{
			NgLogE("Could not parse description in EmitterData.invokeCallback from command: " + cmd );
			return false;
		}
		
		obj[ "code" ] = Core.Proc.parseInt( cmd[ 2 ] );
		if( obj[ "code" ] === undefined )
		{
			NgLogE("Could not parse code in EmitterData.invokeCallback from command: " + cmd );
			return false;
		}
		
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( id )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16fffff, [ +id ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x16f0002, this );
	},
	
	/** @private */
	_initFromDataSendGen: function( emitterData, dataFormat, callbackId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16f0003, this, [ Core.Proc.encodeString( emitterData ), +dataFormat, +callbackId ] );
	},
	
	/** @private */
	_initFromJSONFileSendGen: function( filename, dataFormat, callbackId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16f0004, this, [ Core.Proc.encodeString( filename ), +dataFormat, +callbackId ] );
	},
	
	/** @private */
	_mergeDataSendGen: function( emitterData )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('string'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x16f0006, this, [ Core.Proc.encodeString( emitterData ) ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( id ) {}
	
	// destroy: function(  ) {}
	
	// initFromData: function( emitterData, dataFormat, callbackId ) {}
	
	// initFromJSONFile: function( filename, dataFormat, callbackId ) {}
	
	// _invokeCallbackRecv: function( cmd ) {}
	// mergeData: function( emitterData ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}


});
