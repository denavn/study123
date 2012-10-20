var Class = require('../Core/Class').Class;
var Commands = require('./Commands').Commands;
var ObjectRegistry = require('../Core/ObjectRegistry').ObjectRegistry;

var Element = exports.Element = Class.subclass(
/** @lends UI.Element.prototype */
{
	$subclass: function() {
		if (typeof this._init == 'function') this._init();
		return Class.subclass.apply(this, arguments);
	},
	
	classname: "UI_Element",

	/**
	 * @class The `UI.Element` class is a base class for derived classes that represent components
	 * of a user interface.
	 * 
	 * **Important**: This base class is not exported in the `UI` module. Do not access it directly
	 * or create subclasses of `UI.Element`.
	 * 
	 * Classes that are derived from `UI.Element` include:
	 * 
	 * + `{@link UI.AbstractView}`
	 * + `{@link UI.AlertDialog}`
	 * + `{@link UI.ListViewSection}`
	 * + `{@link UI.ProgressDialog}`	 
	 * @name UI.Element
	 * @constructs Create a user interface component.
	 * @augments Core.Class
	 * @example
	 * // Create a new UI.AlertDialog object without setting any of its properties.
	 * var dialog = new UI.AlertDialog();
	 * @example
	 * // Create a new UI.AlertDialog object, setting its title and text.
	 * var dialogTitle = "Really?";
	 * var dialogText = "Are you sure you want to quit the application?";
	 * var dialog = new UI.AlertDialog({
	 *     title: dialogTitle,
	 *     text: dialogText
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.Element` object.
	 * @since 1.0
	 */
	initialize: function(properties) {
		if (Element._init) Element._init();
		
		this.register();
		
		// Enable events that are being handled at the class level...
		var events = this._eventNames;
		if (events) for (var e in events) {
			if (this[events[e]]) Commands.enableEvent.call(this, e);
		}
		
		//	Reimplement setAttributes here for speed
		var setters = this._setters;
		if (setters) for (var k in properties) {
			if (typeof setters[k] == 'function') try {
				setters[k].call(this, properties[k]);
			} catch (e) {
				NgLogD("Unable to set " + this.type + '.' + k);
			}
		}
		
	/*	This is awesome. Maybe use it in production code, but we want to keep
	//	our stylistic constraints for core development.
	
		for (var propName in this._setters) {
			this.__defineSetter__(propName, this._setters[propName]);
		}
		for (propName in this._getters) {
			this.__defineGetter__(propName, this._getters[propName]);
		}
	*/
	
		return this;
	},
	
	register: function() {
		try {
			ObjectRegistry.register(this);
			Commands.create(this.__objectRegistryId, this.type || this.classname);
		} catch (e) {
			// Nothing yet
		} finally {
			return this.__objectRegistryId;
		}
	},
	
	retain: function() {
		(this.__retainCount) ? ++this.__retainCount : (this.__retainCount = 1);
		return this;
	},
	
	release: function() {
		if (--this.__retainCount === 0) {
			this.destroy();
		}
	},
		
	/**
	 * Retrieve the value of the specified style property.
	 * @param {String} key The name of the style property.
	 * @returns {String|String[]|Number|Number[]|Boolean} The current value of the style property.
	 * @see UI.Element#getAttributes
	 * @see UI.Element#setAttribute
	 * @see UI.Element#setAttributes
	 * @status Javascript, iOS, Android, Flash, Test
	 * @since 1.0
	 */
	getAttribute: function(key) {
		var getter = this._getters[key];
		return (typeof getter == 'function') ? getter.call(this) : undefined;
	},
	
	/**
	 * Set the value of the specified style property.
	 * @example
	 * // Create a new UI.AlertDialog object and set its "choices" property,
	 * // which controls the options that are presented to the user.
	 * var dialog = new UI.AlertDialog();
	 * dialog.setAttribute("choices", ["Cancel", "Save Changes"]);
	 * @param {String} key The name of the style property.
	 * @param {String|String[]|Number|Number[]|Boolean} value The new value of the style property.
	 * @returns {this}
	 * @see UI.Element#getAttribute
	 * @see UI.Element#getAttributes
	 * @see UI.Element#setAttributes
	 * @status Javascript, iOS, Android, Flash, Test
	 * @since 1.0
	 */
	setAttribute: function(key, value){
		var setter = this._setters[key];
		if (typeof setter == 'function') {
			return setter.call(this, value);
		} else {
			NgLogD("Unable to set " + this.type + '.' + key);
		}
		return this;
	},
	
	/**
	 * Set the value of multiple style properties, which are passed in as properties of an object.
	 * @example
	 * // Create a new UI.AlertDialog object and set two of its style properties:
	 * // 1) the "choices" property, which controls the options that are
	 * // presented to the user, and 2) the "dialogText" property, which
	 * // specifies the dialog box's text for the default view state.
	 * var dialog = new UI.AlertDialog();
	 * dialog.setAttributes({
	 *     choices: ["Cancel", "Save Changes"],
	 *     dialogText: "Are you sure you want to quit the application?"
	 * });
	 * @param {Object} dict An object whose properties will be added as style properties of the
	 *		specified object.
	 * @returns {this}
	 * @see UI.Element#getAttribute
	 * @see UI.Element#getAttributes
	 * @see UI.Element#setAttribute
	 * @status Javascript, iOS, Android, Flash, Test
	 * @since 1.0
	 */
	setAttributes: function(dict) {
		var setters = this._setters;
		if (setters) for (var k in dict) {
			if (typeof setters[k] == 'function') try {
				setters[k].call(this, dict[k]);
			} catch (e) {
				NgLogD("Unable to set " + this.type + '.' + k);
			}
		}
		return this;
	},
	
	/**
	 * Retrieve an object's style properties, either by specifying the style properties to retrieve
	 * or by requesting all of the object's style properties.
	 * @example
	 * // Create a new UI.AlertDialog object; set two of its style properties; and
	 * // retrieve the values of those style properties, printing each one to the
	 * // console.
	 * var dialog = new UI.AlertDialog();
	 * dialog.setAttributes({
	 *     choices: ["Cancel", "Save Changes"],
	 *     dialogText: "Are you sure you want to quit the application?"
	 * });
	 * 
	 * var dialogProperties = dialog.getAttributes(["choices", "dialogText"]);
	 * console.log("The value of the choices property is " + 
	 *     dialogProperties.choices);
	 * console.log("The value of the dialogText property is " +
	 *     dialogProperties.dialogText);
	 * @param {String[]} [list] A list of style properties to retrieve. If this parameter is
	 *		omitted, all of the object's style properties will be retrieved.
	 * @returns {Object} An object whose properties represent style properties of a `UI.Element`
	 *		object.
	 * @see UI.Element#getAttribute
	 * @see UI.Element#setAttribute
	 * @see UI.Element#setAttributes
	 * @status Javascript, iOS, Android, Flash, Test
	 * @since 1.0
	 */
	getAttributes: function(list) {
		var output = {};
	        var key;
		if (list instanceof Array) {
			for (var i = 0; i < list.length; i++) {
				key = list[i];
				output[key] = this._getters[key].call(this);
			}
		} else {
			for (key in this._getters) {
				output[key] = this._getters[key].call(this);
			}
		}
		return output;
	},

	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	enableEvent: Commands.enableEvent,
	
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	toString: function() {
		return this.type + '(' + this.__objectRegistryId + ')';
	},

	/**
	 * @function
	 * @description Destroy this object, and release the resources allocated by the object.
	 * @returns {void}
	 * @status Javascript, iOS, Android, Flash, Test
	 * @since 1.0
	 */
	destroy: function() {
		Commands.destroy.call(this);
		ObjectRegistry.unregister(this);
		delete this.prototype;
		var onBadAccess = function () {
			var err = new Error('Object is destroyed.');
			NgLogD(err.stack);
			throw err;
		};
		for (var i in this) {
			var isPrivateProperty = (i.substring(0,1) === '_' || i.substring(0,2) === 'on');
			if (this.hasOwnProperty(i) || !isPrivateProperty) {
				var propType = typeof this[i];
				delete this[i];
				this[i] = ('function' === propType ? onBadAccess : undefined);
			}
		}
		this._destroyed = true;
	},
	
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash, Test
	*/
	registerCallback: function(func, oneTime) {
		var callbackId = ++this.callbackCounter;
		var obj = this;
		this.callbacks[callbackId] = function(obj, args) {
			try {
				func(obj, args);
				if(oneTime) {
					delete obj.callbacks[callbackId];
				}
			}
			catch(e) {
				NgHandleException(e);
			}
		};
		return callbackId;
	},
	
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	performCallback: function(event) {
		var cb = this.callbacks[event.callbackId];
		if(cb) {
			cb(this, event.arguments);
		}
	},
	
	
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	performEventCallback: function(event) {
		try {
			// Look up the event by its 'onXXX' name...
			var eName = this._eventNames[event.eventType];
			var fn = this['_'+eName] || this[eName];
			if (typeof fn == 'function') {
				fn.call(this, event);
			}
		}
		catch(e) {
			NgHandleException(e);
		}
	},	
	
	// STATICS: Setter and Getter Registration
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	$registerAccessors: function(propName, getterFn, setterFn, deprecationMessage) {
		// Put the new setter / getter functions into the prototype.
		var caseAdjusted = propName.charAt(0).toUpperCase() + propName.substr(1);
		var byKeyOnly = Boolean(deprecationMessage || false);
	//	NgLogD("Synthesizing set" + caseAdjusted + (shouldSetClosure ? " (custom)" : " (standard)") +
	//		" and get" + caseAdjusted + (onGetClosure ? " (custom)" : " (standard)") + " for member variable " + localVar);
	
		// If this is an instance, use the instance. Otherwise, if we are a class constructor, modify the prototype.
		var pType = (this instanceof Element) ? this : this.prototype;
	        var heritableMap;
		if (typeof getterFn == 'function') {

			if (!pType.hasOwnProperty('_getters')) {
				try {
					/** @inner */
					heritableMap = function() {return this;};
					var superGetters = pType.superclass._getters;
					if (superGetters) heritableMap.prototype = superGetters;
					pType._getters = new heritableMap();
				} catch (e) {}
			}
			if (byKeyOnly) {
				pType['get'+caseAdjusted] = function() {
					NgLogD("WARNING: Use of get" + caseAdjusted + "() is deprecated. " + deprecationMessage);
					getterFn.apply(this, arguments);
				};
			} else {
				pType['get'+caseAdjusted] = getterFn;
			}
			pType._getters[propName] = getterFn;
		}
		if (typeof setterFn == 'function') {
			if (!pType.hasOwnProperty('_setters')) {
				try {
					heritableMap = function() {return this;};
					var superSetters = pType.superclass._setters;
					if (superSetters) heritableMap.prototype = superSetters;
					pType._setters = new heritableMap();
				} catch (e) {}
			}
			if (byKeyOnly) {
				pType['set'+caseAdjusted] = function() {
					NgLogD("WARNING: Calling set" + caseAdjusted + "() is deprecated. " + deprecationMessage);
					setterFn.apply(this, arguments);
				};
			} else {
				pType['set'+caseAdjusted] = setterFn;
			}
			pType._setters[propName] = setterFn;
		}
	},
	
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	$registerEventType: function(eventName) {
		var onEventName = 'on' + eventName.charAt(0).toUpperCase() + eventName.substr(1);
		var localVar = '_' + onEventName;
		var pType = this.prototype;
		
		var getterFn = function() {
			return this[localVar] || this[onEventName];
		};
		var setterFn = function(callback) {
			var isFn = (typeof callback == 'function');
			if (isFn) {
				this[localVar] = callback;
			} else {
				delete this[localVar];
			}
			this.enableEvent(eventName, isFn);
		};
		if (!pType.hasOwnProperty('_eventNames')) {
			try {
				/** @inner */
				var heritableMap = function() {return this;};
				var superEvents = pType.superclass._eventNames;
				if (superEvents) heritableMap.prototype = superEvents;
				pType._eventNames = new heritableMap();
			} catch (e) {}
		}
		pType._eventNames[eventName] = onEventName;
		
		this.registerAccessors(onEventName, getterFn, setterFn);
		
		// Legacy support. Let's concentrate on removing this soon or at least fixing the casing.
		pType.__defineGetter__(onEventName.toLowerCase(), getterFn);
		pType.__defineSetter__(onEventName.toLowerCase(), setterFn);
	},
	
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	$synthesizePropertyWithState: function(propName, CommandsFn) {
		var lVarName = '_' + propName + 'Map';
		var setterFn;
		if (propName) {
			/** @inner */
			setterFn = function(value, optState) {
				optState |= 0;
			//	NgLogD("Set " + this.type + "." + propName + "[" + optState + "] = " + value);
				(this[lVarName] || (this[lVarName] = {}))[optState] = value;
				CommandsFn.call(this, optState, value);
				return this;
			};
		} else {
			/** @inner */
			setterFn = function(value, optState) {
				CommandsFn.call(this, (optState | 0), value);
				return this;
			};
		}
		
		var getterFn = function(state) {
			return (this[lVarName] || 0)[(state | 0)];
		};
		
		this.registerAccessors(propName, getterFn, setterFn);
	},
	
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	$synthesizeCompoundProperty: function(propName, CommandsFn) {
		var lVarName = '_' + propName;
		var setterFn;
		if (CommandsFn) {
			// Synthesized setters accept EITHER an array of reasonable length OR individual args.
			/** @inner */
			setterFn = function(args) {
				this[lVarName] = (args instanceof Array)
					? args
					: Array.prototype.slice.call(arguments);
				CommandsFn.apply(this, this[lVarName]);
				return this;
			};
		} else {
			/** @inner */
			setterFn = function(args) {
				this[lVarName] = (args instanceof Array) ? args : Array.prototype.slice.call(arguments);
				return this;
			};
		}
		
		this.registerAccessors(propName, function() {return this[lVarName];} , setterFn);
	},
	
	/**
	 * @private
	 * @status Javascript, iOS, Android, Flash, Test
	 */
	$synthesizeProperty: function(propName, CommandsFn) {
		var lVarName = '_' + propName;
		var setterFn;
		if (CommandsFn) {
			// Optional args are still passed through, even though only the first arg is assigned.
			/** @inner */
			setterFn = function(arg) {
				this[lVarName] = arg;
				CommandsFn.apply(this, arguments);
				return this;
			};
		} else {
			/** @inner */
			setterFn = function(arg) {
				this[lVarName] = arg;
				return this;
			};
		}
		
		this.registerAccessors(propName, function() {return this[lVarName];} , setterFn);
	},
	

	$bindPropertyState:function(propertyName, stateName, stateFlags) {
			var caseAdjusted = propertyName[0].toUpperCase() + propertyName.substr(1);
			var gName = 'get' + caseAdjusted;
			var sName = 'set' + caseAdjusted;
			var getterFn = function() {
				return this[gName].call(this, stateFlags);
			};
			var setterFn = function(val) {
				return this[sName].call(this, val, stateFlags);
			};

			this.registerAccessors( stateName + caseAdjusted, getterFn, setterFn );
		}

});


// Event Handlers
Element._init = function() {
	delete Element._init;
	
	/**
	 * Set a function to call when a `load` event occurs. This event occurs when data from a URL has
	 * finished loading.
	 * @name UI.Element#setOnLoad
	 * @event
	 * @example
	 * // Create a new UI.Button object, which inherits from UI.Element, and
	 * // set a function to call when a "load" event occurs.
	 * var button = new UI.Button();
	 * button.setOnLoad(function(event) {
	 *     var url = Core.Base64.decode(event.urlEncoded);
	 *     console.log("Loaded the URL " + url);
	 * });
	 * @cb {Function} loadCallback The function to call when the `load` event occurs.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {String} event.urlEncoded A Base64-encoded version of the URL being loaded.
	 * @cb-returns {void}
	 * @see UI.Element#event:getOnLoad
	 * @status Flash
	 * @returns {void}
	 */
	/**
	 * Retrieve the function to call when a `load` event occurs.
	 * @name UI.Element#getOnLoad
	 * @event
	 * @returns {Function} The current function to call when a `load` event occurs.
	 * @see UI.Element#event:setOnLoad
	 * @status Flash
	 */
	Element.registerEventType('load');
	// per JYopp, we never fire `unload` events, so @ignore the next two methods
	/**
	 * Set a function to call when an `unload` event occurs.
	 * @name UI.Element#setOnUnload
	 * @event
	 * @cb {Function} unloadCallback The function to call when an `unload` event occurs.
	 * @cb-returns {void}
	 * @see UI.Element#event:getOnUnload	
	 * @returns {void}
	 * @ignore
	 */
	/**
	 * Retrieve the function to call when an `unload` event occurs.
	 * @name UI.Element#getOnUnload
	 * @event
	 * @returns {Function} The current function to call when an `unload` event occurs.
	 * @see UI.Element#event:setOnUnload
	 * @ignore	 
	 */
	Element.registerEventType('unload');
};
