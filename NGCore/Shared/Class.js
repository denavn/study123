/**
 * @constructor
 * @class <code>Core.Class</code> provides an object-oriented programming (OOP) framework for ngCore
 * apps.
 * @name Core.Class
 */
var Class = function() {};
exports.Class = Class;

/**
 * Create a new class by extending <code>Core.Class</code> or another existing class.
 * <br /><br />
 * The <code>extensions</code> parameter is an object literal whose properties will be added to the
 * new class. See the <a href="https://developer.mobage.com/en/resources/app_development">App
 * Development</a> documentation on the <a href="https://developer.mobage.com/">Mobage Developer
 * Portal</a> for more information about using the <code>extensions</code> parameter.
 * <br /><br />
 * The <code>conditions</code> parameter, which is optional, allows you to create design-by-contract
 * checks for the class. This parameter was added in ngCore 1.8.
 * <br /><br />
 * <strong>Note</strong>: By default, the development server disables design-by-contract checks. You
 * must enable the checks when you start the development server. See the SDK's
 * <code>README-server</code> file for details.
 * <br /><br />
 * Design-by-contract checks can examine any of the following:
 * <ul>
 * <li><strong>Precondition checks</strong> examine characteristics of the method call, such as the
 * presence and type of arguments. The class calls its precondition checks before it executes the
 * method. The parameters from the method call are passed to the precondition check.</li>
 * <li><strong>Postcondition checks</strong> examine the results of the method call. The class calls
 * its postcondition checks after it completes the method call. The method call's return value,
 * followed by the parameters from the method call, is passed to the postcondition check.</li>
 * <li><strong>Invariant checks</strong> examine characteristics of the class that should never
 * change, such as the type of an object property. The class calls its invariant checks after it
 * completes a method call and evaluates the postcondition checks for the method call.</li>
 * </ul>
 * Design-by-contract checks should return either <code>true</code> if the check was successful or
 * <code>false</code> if the check failed.
 * <br /><br />
 * <strong>Note</strong>: If a design-by-contract check fails, the method will throw an error. You
 * can use <code>try</code> and <code>catch</code> blocks to trap the error and handle it
 * appropriately.
 * @example
 * // Create a new class.
 * var MyClass = Class.subclass({
 *    classname: "MyClass",
 *
 *    initialize: function() {
 *        console.log("constructor");
 *    },
 *
 *    foo: function(v) {
 *        console.log("MyClass.foo('" + v + "')");
 *    }
 * });
 * var instance = new MyClass();  // logs "constructor"
 * instance.foo("param");         // logs "MyClass.foo('param')"
 * @example
 * // Create a new class with design-by-contract checks.
 * var checks = {
 *     "setA.pre": function(a) {
 *         return a > 0;
 *     },
 *     invariant: function() {
 *         // If a is defined, ensure that a is a number.
 *         // The assert() function throws an error if a is not a number.
 *         if(typeof this.a !== "undefined") {
 *             assert(typeof this.a === "number", "this.a is not a number!");
 *         }
 *         // If b is defined, ensure that b is a boolean.
 *         // The assert() function throws an error if b is not a boolean.
 *         if(typeof this.b !== "undefined") {
 *             assert(typeof this.b === "boolean", "this.b is not a boolean!");
 *         }
 *         // We will only get here if both of the checks passed.
 *         return true;
 *     }
 * };
 *
 * var MyClass = Class.subclass({
 *     initialize: function() {
 *         this.a = 23;
 *         this.b = true;
 *     },
 *
 *     setA: function(a) {
 *         this.a = a;
 *     },
 *
 *     setB: function(b) {
 *         this.b = b;
 *     }
 * }, checks);
 *
 * var instance = new MyClass();
 * instance.setA(-1);             // Error! The setA.pre check fails.
 * instance.setB({});             // Error! The invariant check fails.
 * @name Core.Class.subclass
 * @function
 * @static
 * @param {Object} extensions Object literal containing new methods for the class.
 * @param {Object} [conditions] Object literal containing design-by-contract checks. Each check
 *		should return <code>true</code> if the check passes or <code>false</code> if the check
 *		fails. Available since ngCore 1.8.
 * @param {Function} [conditions.invariant] The invariant checks for the class. Called after the
 *		method and its postcondition checks have executed.
 * @param {Function} [conditions.methodName.post] The postcondition checks for the method
 *		<code>methodName</code> (replace <code>methodName</code> with the name of your method).
 *		Called after the method has executed.
 * @param {Function} [conditions.methodName.pre] The precondition checks for the method
 *		<code>methodName</code> (replace <code>methodName</code> with the name of your method).
 *		Called before the method has executed.
 * @returns {Function} A function for instantiating the derived class.
 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
 */
Class.subclass = (function()
{
/**#@+ @ignore */
	// Parse a function body and extract the parameter names.
	function argumentNames(body)
	{
	        var names;
		// optimized path for SpiderMonkey
		if (Function.prototype.__arguments) {
			names = body.__arguments();
			if (names) {
			    return names;   
			}
		}
		names = body.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
			.replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
			.replace(/\s+/g, '').split(',');
		return names.length == 1 && !names[0] ? [] : names;
	}
	
	// Create a function that calls overrideBody with a closure to ancestorBody.
	function overrideMethod(overrideBody, ancestorBody)
	{
	    var override;
		if(ancestorBody !== undefined)
		{
			// Create a function that calls overrideBody with a closure to ancestorBody as the first param.
			override = function()
			{
				var localThis = this;
				var $super = function() { return ancestorBody.apply(localThis, arguments); };
				Array.prototype.unshift.call(arguments, $super);
				return overrideBody.apply(this, arguments);
			};
		}
		else
		{
			// Create a function that calls overrideBody with undefined as the first param, because ancestorBody is undefined.
			override = function()
			{
				Array.prototype.unshift.call(arguments, undefined);
				return overrideBody.apply(this, arguments);
			};
		}

		// Hide our dirty tricks from the rest of the world.
		override.valueOf = function() { return overrideBody.valueOf(); };
		override.toString = function() { return overrideBody.toString(); };
		return override;
	}

/*#if DBCCHECK
        var dbc_curry = function(obj, p, cond) {
	    var prename = p + '.pre';
	    var postname = p + '.post';
	    var pre = cond[prename];
	    var post = cond[postname];
	    var invariant = cond.invariant;
	    var fn = obj[p];

	    var f = function() {
		if (!pre || pre.apply(this, arguments)) {
		    var rval = fn.apply(this, arguments);
		    if (post && !post.call(this, rval, arguments)) {
			throw new Error("Failed post-condition for " + this.classname);
		    }
		}
		if (invariant && !invariant.call(this)) {
		    throw new Error("Failed invariant for " + this.classname);
		}
		return rval;
	    };
	    return f;
	}

        var bindConditions = function(obj, cond) {
	    if(!cond)
		return;

	    for(var p in obj) {
		if(obj.hasOwnProperty(p) && typeof obj[p] === 'function' && p[0] != '$')
		{
		    obj[p] = dbc_curry(obj, p, cond);
		} 
	    }
	}
#endif*/

	// Define some empty functions used later. This is a speed optimization.
	function TempClass() {}
	function emptyFunction() {}
	
	return function()
	{
		// Constructor for new class to be created.
		var properties = arguments[0];
	        var conditions = arguments[1];
	        var property;

/*#if DBCCHECK
	        bindConditions(properties, conditions);
#endif*/

		var classname = properties.classname || "AnonymousClass";
		if (typeof $_ASSIGNENGINEBINDINGS !== "undefined" && typeof properties._classId !== "undefined")
			$_ASSIGNENGINEBINDINGS(properties, properties._classId);
		var NewClass = eval('(function ' + classname + '(){this.initialize.apply(this, arguments)})');
		
		// Copy statics from this.
		for(property in this)
		{
			if(!this.hasOwnProperty(property)) continue;
			NewClass[property] = this[property];
		}
		
		// Copy prototype from this.
		var ancestorPrototype = this.prototype;
		TempClass.prototype = ancestorPrototype;
		NewClass.prototype = new TempClass();
		NewClass.prototype.superclass = ancestorPrototype;
		NewClass.prototype.constructor = NewClass;
	        var value;		
		// Copy properties into NewClass prototype.
		for(property in properties)
		{
			if(!properties.hasOwnProperty(property)) continue;

			// getters / setters behave differently than normal properties.
			var getter = properties.__lookupGetter__(property);
			var setter = properties.__lookupSetter__(property);

		        if(getter || setter)
			{
				if(getter)
				{
					// Copy getter into klass.
					value = getter;
					if(argumentNames(value)[0] == "$super")
						value = overrideMethod(value, ancestorPrototype.__lookupGetter__(property));
					NewClass.prototype.__defineGetter__(property, value);
				}

				if(setter)
				{
					// Copy setter into klass.
					value = setter;
					if(argumentNames(value)[0] == "$super")
						value = overrideMethod(value, ancestorPrototype.__lookupSetter__(property));
					NewClass.prototype.__defineSetter__(property, value);
				}
			}
			else
			{
				value = properties[property];
				if(typeof value === "function" && property[0] != '$')
				{
					if(argumentNames(value)[0] == "$super")
					{
						// Create override method if first param is $super.
						value = overrideMethod(value, ancestorPrototype[property]);
					}
					else if(property == 'initialize')
					{
						var ancestorInitialize = ancestorPrototype.initialize;
						if(ancestorInitialize)
						{
							// Automatically call inherited constructor.
							var derivedInitialize = value;
							value = function()
							{
								ancestorInitialize.apply(this, arguments);
								derivedInitialize.apply(this, arguments);
							};
						}
					}
					else if(property == 'destroy')
					{
						var ancestorDestroy = ancestorPrototype.destroy;
						if(ancestorDestroy)
						{
							// Automatically call inherited destructor.
							var derivedDestroy = value;
							value = function()
							{
								derivedDestroy.apply(this, arguments);
								ancestorDestroy.apply(this, arguments);
							};
						}
					}

					// Copy function into new class prototype.
					NewClass.prototype[property] = value;
				}
				else
				{
					if(property[0] == '$')
						property = property.slice(1);

					// Copy enum into new class and the prototype.
					NewClass[property] = value;
					NewClass.prototype[property] = value;
				}
			}
		}
		
		// Make sure the is an initialize function.
		if(!NewClass.prototype.initialize)
			NewClass.prototype.initialize = emptyFunction;

		if (typeof $_REGISTERCLASSTOENGINE !== "undefined" && typeof properties._classId !== "undefined")
			$_REGISTERCLASSTOENGINE(properties, properties._classId);

		return NewClass;
	};
/**#@-*/
})();

/**
 * Create a singleton by extending a class.
 * <br /><br />
 * The <code>extensions</code> parameter is an object literal whose properties will be added to the
 * new singleton. See the <a href="https://developer.mobage.com/en/resources/app_development">App
 * Development</a> documentation on the <a href="https://developer.mobage.com/">Mobage Developer
 * Portal</a> for more information about using the <code>extensions</code> parameter.
 * <br /><br />
 * The <code>conditions</code> parameter, which is optional, allows you to create design-by-contract
 * checks for the singleton. See the <code>{@link Core.Class.subclass}</code> documentation for
 * details.
 * @example
 * // Create a new singleton.
 * var MySingleton = Class.singleton({
 *    classname: "MySingleton",
 *
 *    initialize: function() {
 *        console.log("constructor");
 *    },
 *
 *    foo: function(v) {
 *        console.log("MySingleton.foo('" + v + "')");
 *    }
 * });
 * MySingleton.foo("param");   // logs "constructor", then "MySingleton.foo('param')"
 * @function
 * @name Core.Class.singleton
 * @static
 * @param {Object} extensions Object literal containing new methods for the class.
 * @param {Object} [conditions] Object literal containing design-by-contract checks. Each check
 *		should return <code>true</code> if the check passes or <code>false</code> if the check
 *		fails. Accepts the same properties as the <code>conditions</code> parameter to
 *		<code>{@link Core.Class.subclass}</code>.
 * @returns {Object} The singleton instance.
 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
 */
Class.singleton = function()
{
	// Create sublcass as normal.
	var tempClass = this.subclass.apply(this, arguments);
	
	// Hide the initialize.
	var initialize = tempClass.prototype.initialize;
	tempClass.prototype.initialize = function() {};
	
	// Now instantiate.
	var instance = new tempClass();
	
	// Hide every prototype function with an instance function that calls initialize.
	var functions = [];
	/** 
	 * Ensure that the singleton has been created and fully initialized.
	 * @inner
	 * @status iOS, Android, Flash
	 */
	var instantiate = function(real)
	{
		// Delete all of the instance functions we added.
		for(var i in functions)
		{
			var func = functions[i];
			delete instance[func];
		}
		
		// Restore the initialize function and call it.
		instance.initialize = initialize;
		instance.initialize();
		
		// Replace instantiate method with an empty function.
		instance.instantiate = function() {};
		
		// Call the function that caused this instantiation.
		var args = Array.prototype.slice.call(arguments, 1);
		return real.apply(instance, args);
	};
	
	// Iterate over all prototype functions.
	for(var i in instance)
	{
		// Don't do anything for setters or getters.
		if(instance.__lookupGetter__(i)
			|| instance.__lookupSetter__(i))
		{
			//TODO Should put proxies here too.
			continue;
		}
			
		var value = instance[i];
		if(typeof(value) == 'function')
		{
			// Remember the function names that we added so that instantiate() can remove them.
			functions.push(i);
			
			// Add an instance function to hide the prototype function, which will call instantiate.
			instance[i] = instantiate.bind(this, value);
		}
	}
	
	// Add instantiate method.
	instance.instantiate = instantiate.bind(this, function() {});
	
	// Return the isntance.
	return instance;
};

/**
 * @ignore
 */
Class.prototype.bind = function(func)
{
	var context = this;
	if(arguments.length < 2)
	{
		// Fast path if only the 'this' pointer is being bound.
		return function()
		{
			return func.apply(context, arguments);
		};
	}
	else
	{
		// Slower path if additional parameters are being bound.
		var args = Array.prototype.slice.call(arguments, 1);
		return function()
		{
			var finalArgs = args.concat(Array.prototype.slice.call(arguments, 0));
			return func.apply(context, finalArgs);
		};
	}
};

/**
 * @ignore
 */
Class.prototype.toString = function()
{
	return this.constructor.name;
};

// Debug implementation that will replace every method in destroyed objects with a grenade.
/*Class.prototype.destroy = function()
{
	function suicide()
	{
		throw new Error('Function called on destroyed object');
	}
	
	for(var i in this)
	{
		var value = this[i];
		if(typeof(value) == 'function')
		{
			this[i] = suicide;
		}
	}
}*/
