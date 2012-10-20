// TypeCheck.js

// lowest level validate functions.
var isNumber = function (x) { return typeof x === 'number' && x === x; };  // NOTE: if x !== x it's a NaN
var isInteger = function (x) { return typeof x === 'number' && ((x % 1) === 0); }; 
var isString = function (x) { return typeof x === 'string'; };
var isFunction = function (x) { return typeof x === 'function'; };
var isBoolean = function (x) { return typeof x === 'boolean'; };
var isUndefined = function (x) { return typeof x === 'undefined'; };
var isAny = function (x) { return true; };
var isInstanceMaker = function (ctor) { return function (x) { return x instanceof ctor; }; };

// maps string to appropriate validate function
var typeToValidateFunctionMap = {
	'number': isNumber,
	'integer': isInteger,
	'string': isString,
	'function': isFunction,
	'boolean': isBoolean,
	'undefined': isUndefined,
	'any': isAny
};

// Pretty printing helper.
// Useful because it differentiates between the following:
//   * The number 10 = 10
//   * The string 10 = '10'
//   * An array with a single element which is the number 10 = [10]
//   * An array with a single element which is the string 10 = ['10']
// Also, it doesn't invoke toString on functions.
var pp = function(x) {
	if (x instanceof Array) {
		return '[' + x + ']';  // slap braces around x
	} else if (typeof x === 'string') {
		return "'" + x + "'";  // slap quotes around x
	} else if (typeof x === 'function') {
		return 'function';
	} else {
		return x;
	}
};

// Internal class used to hold Arg, OptionalArg, ArgArray, OptionalArgArray, NonEmptyArgArray, OptionalNonEmptyArgArray.
var TypeDef = function (type, check, verify) {
	this.type = type;
	this.check = check;
	this.verify = verify;
};
TypeDef.prototype.toString = function () {
	return '#TypeDef(' + pp(this.type) + ')';
};

// looks up validate function and returns it.
var lookupValidateFunc = function (typeOrFunc) {
	// validate just checks to see if a value is of a specific type.
	var validate;
	if (typeof typeOrFunc === 'string') {
		validate = typeToValidateFunctionMap[typeOrFunc];
		if (validate === undefined) {
			throw new TypeError("Unknown type '" + typeOrFunc + "'");
		}
	} else if (typeof typeOrFunc === 'function') {
		validate = isInstanceMaker(typeOrFunc);
	}
	return validate;
};

// User facing functions to construct new Args
var Arg = function (typeOrFunc, verifyFunc) {
	var validate = lookupValidateFunc(typeOrFunc);
	return new TypeDef(typeOrFunc, ifNotValidMaker(validate, false), verifyFunc);
};
var OptionalArg = function (typeOrFunc, verifyFunc) {
	var validate = lookupValidateFunc(typeOrFunc);
	return new TypeDef(typeOrFunc, ifNotValidMaker(validate, true), verifyFunc);
};
var ArgArray = function (typeOrFunc, verifyFunc) {
	var validate = lookupValidateFunc(typeOrFunc);
	return new TypeDef(typeOrFunc, ifNotValidArrayMaker(validate, 0, false), verifyFunc);
};
var OptionalArgArray = function (typeOrFunc, verifyFunc) {
	var validate = lookupValidateFunc(typeOrFunc);
	return new TypeDef(typeOrFunc, ifNotValidArrayMaker(validate, 0, true), verifyFunc);
};
var NonEmptyArgArray = function (typeOrFunc, verifyFunc) {
	var validate = lookupValidateFunc(typeOrFunc);
	return new TypeDef(typeOrFunc, ifNotValidArrayMaker(validate, 1, false), verifyFunc);
};
var OptionalNonEmptyArgArray = function (typeOrFunc, verifyFunc) {
	var validate = lookupValidateFunc(typeOrFunc);
	return new TypeDef(typeOrFunc, ifNotValidArrayMaker(validate, 1, true), verifyFunc);
};

// A union of primitive types, constructed by Or function.
var TypeUnion = function (typeDefs) {
	this.typeDefs = typeDefs;
	var last = typeDefs[typeDefs.length - 1];
	if (typeof last === 'function') {
		this.typeDefs = typeDefs.slice(0, -1);
		this.verify = last;
	} else {
		this.typeDefs = typeDefs;
	}
};
TypeUnion.prototype.toString = function () {
	return '#TypeUnion(' + this.typeDefs.join(', ') + ')';
};

// user facing function for creating type unions.
var Or = function () {
	var typeDefs = Array.prototype.slice.call(arguments);
	return new TypeUnion(typeDefs);
};

// An array of primitive types, constructed by the Array function.
var TypeArray = function (typeDefs) {
	var last = typeDefs[typeDefs.length - 1];
	if (typeof last === 'function') {
		this.typeDefs = typeDefs.slice(0, -1);
		this.verify = last;
	} else {
		this.typeDefs = typeDefs;
	}
};
TypeArray.prototype.toString = function () {
	return '#TypeArray(' + this.typeDefs.join(', ') + ')';
};

// User facing function for creating type arrays.  NOTE: Not named Array here so it won't shadow the built-in JavaScript Array class constructor.
// NOTE: if the last argument is a function, it will be used as a user supplied verification function.
var ArrayFunc = function () {
	var typeDefs = Array.prototype.slice.call(arguments);
	return new TypeArray(typeDefs);
};

// Object of primitive types, constructed by the Object function.
var TypeObject = function (obj, verify) {
	this.obj = obj;
	this.verify = verify;
};
TypeObject.prototype.toString = function () {
	return '#TypeObject()';
};

// User facing function for creating object args with optional verify functions.
var ObjectFunc = function (obj, verify) {
	if (typeof obj !== 'object') {
		throw TypeError('Object expected object parameter');
	}
	return new TypeObject(obj, verify);
};

// Helper higher-order function which wraps the isTypeFunc with error reporting.
var ifNotValidMaker = function (isTypeFunc, isOptional) {
	return function (schema, x, name) {
		if (!(isOptional && isUndefined(x)) && !isTypeFunc(x)) {
			if (typeof schema.type === 'function')
				return name + ' ' + pp(x) + ' is not a valid class instance';
			else
				return name + ' ' + pp(x) + ' is not a valid ' + schema.type;
		}
	};
};

// Helper higher-order function which wraps the isTypeFunc for arrays with iteration over the array and error reporting.
var ifNotValidArrayMaker = function (isTypeFunc, minLen, isOptional) {
	return function (schema, x, name) {
		var i;
		if (isOptional && isUndefined(x))
			return;
		if (!(x instanceof Array)) {
			return name + ' ' + pp(x) + ' is not an array';
		}
		if (x.length < minLen) {
			return name + ' ' + pp(x) + ' must have at least ' + minLen + ' element' + ((minLen !== 1) ? 's' : '');
		}
		for (i = 0; i < x.length; i++) {
			if (!isTypeFunc(x[i])) {
				return name + '[' + i + '] ' + x[i] + ' is not a valid ' + schema.type;
			}
		}
	};
};

// Assumes schema is an array of schemas.
// Iterates over x, and returns an error if any elements do not match the associated sub-schema.
// NOTE: if the last element of the schema is a function, that function is assumed to be a user supplied validation function, and is invoked on x.
var checkArray = function (schema, x, name) {
	//console.log('checkArray: x = ' + pp(x));
	if (!(x instanceof Array)) {
		return name + ' ' + x + ' is not an array';
	}

	// Check to see if the last element of the schema is a function, if so use it as the verify function.
	var last = schema[schema.length - 1];
	var len = schema.length;
	var verify;
	if (typeof last === 'function') {
		var length = schema.length - 1;
		verify = last;
	}

	// Iterate over each element of the array, stop at first error.
	var error;
	for (var i = 0; i < len; i++) {
		error = check(schema[i], x[i], name + '[' + i + ']');
		if (error)
			return error;
	}

	// Invoke user-supplied verify function.
	if (verify) {
		error = verify(x);
		if (error) {
			return name + ' ' + error;
		}
	}
};

// Assumes schema is an object with string keys, and schema values.
// Iterates over object, and returns error if any elements do not match the associated sub-schema.
// NOTE: there is no way a user can pass in a user-supplied verification function for this.
var checkObject = function (schema, x, name) {
	//console.log('checkObj: x = ' + pp(x));

	if (typeof x !== 'object') {
		return name + ' ' + x + ' is not an object';
	}

	var error;
	for (var key in schema) {
		error = check(schema[key], x[key], name + '.' + key);
		if (error)
			return error;
	}
};

// Assume schema is a TypeDef instance.
// Invoke the TypeDef.check function, followed by the TypeDef.verify function if present.
var checkTypeDef = function (schema, x, name) {
	//console.log('checkTypeDef: x = ' + pp(x) + ', schema = ' + schema);
	var error;
	var func = schema.check;
	if (!func) {
		throw new TypeError(schema.type + ' is not a valid TypeDef type!');
	}

	error = func(schema, x, name);
	if (error) {
		return error;
	}

	if (schema.verify) {
		error = schema.verify(x);
		if (error) {
			return name + ' ' + error;
		}
	}
};

// Assume schema is a TypeUnion instance.
// Try each sub-schema of the union, in order.  Only return an error if they ALL fail.
var checkTypeUnion = function (schema, x, name) {
	//console.log('checkTypeUnion: x = ' + pp(x) + ', schema = ' + schema);
	var i, error, errors = [];
	for (i = 0; i < schema.typeDefs.length; i++) {
		error = check(schema.typeDefs[i], x, name);
		if (!error)
			return;
		errors.push(error);
	}
	if (errors) {
		return errors.join(', ');
	}

	// Invoke user-supplied verify function.
	if (schema.verify) {
		error = schema.verify(x);
		if (error) {
			return name + ' ' + error;
		}
	}
};

// Assume schema is a TypeArray instance.
// check each element against it's sub-schema, return first error.
var checkTypeArray = function (schema, x, name) {
	//console.log('checkTypeArray: x = ' + pp(x) + ', schema = ' + schema);
	var i, error;
	for (i = 0; i < schema.typeDefs.length; i++) {
		error = check(schema.typeDefs[i], x[i], name);
		if (error)
			return error;
	}

	// Invoke user-supplied verify function.
	if (schema.verify) {
		error = schema.verify(x);
		if (error) {
			return name + ' ' + error;
		}
	}
};

// Assume schema is a TypeObject instance.
// check each object value against it's sub-schema, return first error.
var checkTypeObject = function (schema, x, name) {
	//console.log('checkTypeObject: x = ' + pp(x));

	if (typeof x !== 'object') {
		return name + ' ' + x + ' is not an object';
	}

	var error;
	for (var key in schema.obj) {
		error = check(schema.obj[key], x[key], name + '.' + key);
		if (error)
			return error;
	}

	// Invoke user-supplied verify function.
	if (schema.verify) {
		error = schema.verify(x);
		if (error) {
			return name + ' ' + error;
		}
	}
};

// Dispatch to specialized check function based on type of schema.
var check = function (schema, x, name) {
	//console.log('check: x = ' + pp(x));
	var func, error, i;
	if (schema instanceof Array) {
		return checkArray(schema, x, name);
	} else if (schema instanceof TypeDef) {
		return checkTypeDef(schema, x, name);
	} else if (schema instanceof TypeUnion) {
		return checkTypeUnion(schema, x, name);
	} else if (schema instanceof TypeArray) {
		return checkTypeArray(schema, x, name);
	} else if (schema instanceof TypeObject) {
		return checkTypeObject(schema, x, name);
	} else if (typeof schema === 'object') {
		return checkObject(schema, x, name);
	}
};

/** Function which checks arguments against the given type schema.
 *  The simplest case of type schema are basic types, constructed with the Arg() function.
 *  @example
 *    function add(a, b) {
 *      validate(arguments, [Arg('number'), Arg('number')]);
 *    }
 *
 *  There are several basic type strings that can be passed as parameters to the Arg function:
 *    * 'number'
 *    * 'integer'
 *    * 'string'
 *    * 'function'
 *    * 'undefined'
 *    * 'boolean'
 *    * constructor function - used to see if object is an instanceof the given constructor function.
 *
 *  Additionally there is the ability to specify optional and array argument types.
 *    * OptionalArg
 *    * ArgArray
 *    * NonEmptyArgArray
 *    * OptionalArgArray
 *    * OptionalNonEmptyArgArray
 *
 *  Compound types can be created by using arrays or maps of Arg's:
 *    * [Arg('string'), OptionalArg('number')] - an array with a string followed by an optional number
 *    * {name: Arg('string'), size: OptionalArg('number')} - a map where the name key must be a string, but the size key is an optional number.
 *
 *  Custom validation functions can be passed as a second argument to the Arg function.
 *  They are expected to return strings on error, and undefined otherwise.
 *
 *  @example
 *    function reciprocal(numerator) {
 *      validate(arguments, [Arg('number', function (x) {
 *        if (x === 0) {
 *           return 'divide by zero';
 *        }
 *      })]);
 *
 *  @throws TypeError if types within args do not match the schema.
 *  @param {array|Arguments} args parameters to check against the type schema.
 *  @param schema - descriptive structure of the types, names and additional verification functions for the args.
 */
var validateArgs = function () {
	var args = Array.prototype.slice.call(arguments);
	var first = args.shift();
	first = Array.prototype.slice.call(first);
	var rest = args;
	var schema = Or.apply(undefined, rest);
	var ex;
	var error = check(schema, first, 'arguments');
	if (error) {
		// output to log, because sometimes exeptions go down a hole.
		console.log('validateArgs: ' + error);
		ex = new TypeError(error);
		ex.stacklevel = 2;  // this will report exception occuring at the call made before the call to validateArgs
		throw ex;
	}
};

var validate = function (args, schema) {
	var error = check(schema, args, 'arguments');
	var ex;
	if (error) {
		ex = new TypeError(error);
		ex.stacklevel = 2;  // this will report exception occuring at the call made before the call to validateArgs
		throw ex;
	}
};

exports.TypeCheck = {
	validate: validate,
	validateArgs: validateArgs,
	Arg: Arg,
	OptionalArg: OptionalArg,
	ArgArray: ArgArray,
	OptionalArgArray: OptionalArgArray,
	NonEmptyArgArray: NonEmptyArgArray,
	OptionalNonEmptyArgArray: OptionalNonEmptyArgArray,
	Or: Or,
	Array: ArrayFunc,
	Object: ObjectFunc
};
