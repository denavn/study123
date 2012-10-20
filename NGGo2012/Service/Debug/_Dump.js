/**
 *  @author     Taha Samad, Sheraz Ch
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */

/**
 * @param {object} obj Object to be printed.
 * @param {?boolean} verbose Sets the verbose property of dump function.
 * @param {?number} depth Limit the depth to which objects are printed.
 * @param {?number} indent Sets the number of spaces in indent.
 * @return {Array} Object to be printed.
 * @private
 */
_dump = function(obj, verbose, depth, indent) {
    var structures = _structure([], obj, depth, null, 1, 0, verbose);
    var builded = _build(structures, depth, indent);
    return builded;
};

/**
 * @param {*} obj Object.
 * @return {Array} keys.
 */
var _getObjectKeys = function(obj) {
    var keys = [];
    var key;
    for (key in obj) {
        keys.push(key);
    }
    return keys;
};

/**
 * @param {*} value The value.
 * @return {string} type name. returns: User defined specific name,
 *     "object", "function", "null", "undefined", "array",
 *     "boolean", "date", "regexp", "error", "unknown".
 * @private
 */
var _typeof = function (value)
{
    var type = typeof value;
    if (type !== "object" && type !== "function")
    {
        return type;
    }

    switch (value)
    {
      case null:
        return "null";
      case undefined:
        return "undefined";
    }

    switch (value.constructor)
    {
      case Array:
        return "array";
      case Boolean:
        return "boolean";
      case Date:
        return "date";
      case Object:
        return "object";
      case RegExp:
        return "regexp";
      case ReferenceError:
      case Error:
        return "error";
    }

    if (type === "object")
    {
        return type;
    }
    else if (type === "function")
    {
        return type;
    }
    else
    {
        return "unknown";
    }
};

/**
 * @param {Object} object The object.
 * @return {string} class name. if target object is Object type then return "Object".
 * @private
 */
var _getClassName = function(object)
{
    if (object.constructor)
    {
        var str = object.constructor.toString().replace(/^.*function\s+([^\s]*|[^\(]*)\([^\x00]+$/, "$1");
        var index = str.indexOf("(");
        if (index >= 0)
        {
            str = str.substring(0, index);
        }
        else if (str === "")
        {
            str = "Object";
        }
        return str;
    }
    return "Object";
};

var _structureNGCoreObjectFunctions = function(functions, buflist, obj, depth, suffix, counter, indentOption, verbose)
{
    buflist.push(["_NGCoreObjectFunctions_", obj, depth - 1, true, {}, indentOption]);
    functions = functions.sort();

    indentOption = indentOption + 1;

    var i;
    var len = functions.length;
    for (i = 0; i < len; i++)
    {
        buflist.push(["_NGCoreFunction_", obj[functions[i]], depth - 1, functions[i], {}, indentOption]);
    }
    return buflist;
};

var _structureNGCoreObjectProperties = function(properties, buflist, obj, depth, suffix, counter, indentOption, verbose)
{
    buflist.push(["_NGCoreObjectProperties_", obj, depth - 1, true, {}, indentOption]);
    properties = properties.sort();

    indentOption = indentOption + 1;

    var i;
    var len = properties.length;
    for (i = 0; i < len; i++)
    {
        var child = obj[properties[i]];
        buflist = _structure(buflist, child, depth - 1, properties[i], counter, indentOption, verbose);
    }
    return buflist;
};

var _structureNGCoreObjectSupers = function(supers, buflist, obj, depth, suffix, counter, indentOption, verbose)
{
    supers = supers.sort();

    indentOption = indentOption + 1;

    var i;
    var len = supers.length;
    for (i = 0; i < len; i++)
    {
        var child = obj[supers[i]];
        buflist = _structure(buflist, child, depth - 1, supers[i], counter, indentOption, verbose);
    }
    return buflist;
};

var _updateIndex = function(target, index, counter)
{
    if (target.referFrom) {
        target.referFrom.push(index);
    }
    else {
        target.referFrom = [index];
        target.counter = counter;
        counter = counter + 1;
    }
    return counter;
};

/**
 * @param {Array} structures Any Data Structores.
 * @param {Array} structure target structure.
 * @return {booelan} true or false.
 */
var _isCircularReference = function(structures, structure) {
    var indexs = [];
    var i;
    var len = structures.length;
    for (i = 0; i < len; i++)
    {
        if (_typeof(structure) === "function" || _typeof(structure) === "object")
        {
            if (structures[i][1] === structure)
            {
                indexs.push(i);
            }
        }
    }
    return indexs;
};

var _structureObject = function(buflist, obj, depth, suffix, counter, indentOption, verbose)
{
    buflist.push(["Object", obj, depth, suffix, {}, indentOption]);

    if (depth <= 0) {
        return buflist;
    }

    var keys = _getObjectKeys(obj);
    keys = keys.sort();

    var i;
    var len = keys.length;
    for (i = 0; i < len; i++)
    {
        var child = obj[keys[i]];
        var childDepth = depth - 1;

        var indexs = _isCircularReference(buflist, child);
        if (indexs.length > 0)
        {
            var index = buflist.length; //current index.
            var line = indexs[0]; //target line.

            counter = _updateIndex(buflist[line][4], index, counter);

            buflist.push(["_CircularReference_", buflist[line][1], childDepth, keys[i], {
                'counter': counter,
                'referToObj': buflist[line]
            }, indentOption]);
        }
        else
        {
            buflist = _structure(buflist, child, childDepth, keys[i], counter, indentOption, verbose);
        }
    }
    
    buflist.push(["_ObjectCloseBracket_", null, depth, suffix, {}, indentOption]);
 
    return buflist;
};

var _structureNGCoreObject = function(buflist, obj, depth, suffix, counter, indentOption, verbose)
{
    buflist.push(["_NGCoreObject_", obj, depth, suffix, {}, indentOption]);

    if (depth <= 0) {
        return buflist;
    }
        
    var functions = [];
    var properties = [];
    var supers = [];

    var prop;
    for (prop in obj)
    {
        if (prop === 'superclass')
        {
            supers.push(prop);
        }
        else if (_typeof(obj[prop]) === "function")
        {
            if (verbose || prop.charAt(0) !== "_") {
                functions.push(prop);
            }
        }
        else
        {
            if (verbose || prop.charAt(0) !== "_") {
                    properties.push(prop);
            }
        }
    }

    buflist = _structureNGCoreObjectFunctions(functions, buflist, obj, depth, suffix, counter, indentOption, verbose);
    buflist = _structureNGCoreObjectProperties(properties, buflist, obj, depth, suffix, counter, indentOption, verbose);
    buflist = _structureNGCoreObjectSupers(supers, buflist, obj, depth, suffix, counter, indentOption, verbose);

    buflist.push(["_ObjectCloseBracket_", null, depth, suffix, {}, indentOption]);

    return buflist;
};

/**
 * @param {Array} buflist Buffer list.
 * @param {*} obj Target object.
 * @param {number} depth Current obj depth.
 * @param {string} suffix .
 * @param {number} counter .
 * @param {number} indentOption .
 * @param {boolean} verbose .
 * @return {Array} Buffer list.
 */
_structure = function(buflist, obj, depth, suffix, counter, indentOption, verbose)
{
    var type = _typeof(obj);
    switch(type) {
      case "null":
        buflist.push(["Null", obj, depth, suffix, {}, indentOption]);
        return buflist;
      case "string":
        buflist.push(["String", obj, depth, suffix, {}, indentOption]);
        return buflist;
      case "number":
        buflist.push(["Number", obj, depth, suffix, {}, indentOption]);
        return buflist;
      case "boolean":
        buflist.push(["Boolean", obj, depth, suffix, {}, indentOption]);
        return buflist;
      case "regexp":
        buflist.push(["RegExp", obj, depth, suffix, {}, indentOption]);
        return buflist;
      case "error":
        buflist.push(["Error", obj, depth, suffix, {}, indentOption]);
        return buflist;
      case "date":
        buflist.push(["Date", obj, depth, suffix, {}, indentOption]);
        return buflist;
      case "array":
        if (depth <= 0)
        {
            buflist.push(["_ArrayEllipsis_", null, depth, suffix, {}, indentOption]);
            return buflist;
        }

        buflist.push(["Array", obj, depth, suffix, {}, indentOption]);
        var keys = Object.keys(obj);
        keys = keys.sort();
        
        var i;
        var len = keys.length;
        for (i = 0; i < len; i++)
        {
            buflist = _structure(buflist, obj[keys[i]], depth - 1, keys[i], {}, indentOption, verbose);
        }
        buflist.push(["_ArrayCloseBracket_", null, depth, suffix, {}, indentOption]);
        return buflist;
      case "object":
        if (depth <= 0)
        {
            buflist.push(["_ObjectEllipsis_", null, depth, suffix, {}, indentOption]);
            return buflist;
        }

        if (obj.superclass) {
            return _structureNGCoreObject(buflist, obj, depth, suffix, counter, indentOption, verbose);
        }
        return _structureObject(buflist, obj, depth, suffix, counter, indentOption, verbose);
      case "function":
        buflist.push(["Function", obj, depth, suffix, {}, indentOption]);
        return buflist;
      case "undefined":
        buflist.push(["Undefined", obj, depth, suffix, {}, indentOption]);
        return buflist;
      case "unknown":
        buflist.push(["_Unknown_", obj, depth, suffix, {}, indentOption]);
        return buflist;
      default:
        throw new Error('unimplemented type: ' + type);
    }
};

/**
 * @param {string} type .
 * @param {number} value .
 * @param {string} indentChar .
 * @param {string} suffix .
 * @param {Object} referd .
 * @return {Array} .
 */
var _toString = function(type, value, indentChar, suffix, referd) {
    var buflist = [];

    if(suffix)
    {
        buflist.push(indentChar);
        switch(type) {
          case "_ArrayOpenBracket_":
          case "_ArrayCloseBracket_":
          case "_ObjectOpenBracket_":
          case "_ObjectCloseBracket_":
            break;
          case "Null":
          case "String":
          case "Number":
          case "Boolean":
          case "RegExp":
          case "Error":
          case "Date":
          case "Array":
          case "_ArrayEllipsis_":
          case "_ArrayCloseBracket_":
          case "Object":
          case "_ObjectEllipsis_":
          case "Function":
          case "Undefined":
            buflist.push(suffix + ": ");
            break;
          case "_NGCoreFunction_":
            buflist.push(suffix);
            break;
          case "_CircularReference_":
            buflist.push(suffix + ": ");
            break;
        }
    }

    switch(type)
    {
      case "Null":
        buflist.push("null");
        return buflist;
      case "String":
        buflist.push("'" + value + "'");
        return buflist;
      case "Number":
      case "Boolean":
      case "RegExp":
        buflist.push(value.toString());
        return buflist;
      case "Error":
        buflist.push("Error: '" + value.message + "'");
        return buflist;
      case "Date":
        buflist.push("Date: " + value.toString());
        return buflist;
      case "Array":
        buflist.push("[");
        return buflist;
      case "_ArrayEllipsis_":
        buflist.push("[ (...) ]");
        return buflist;
      case "_ArrayCloseBracket_":
        buflist.push("]");
        return buflist;
      case "Object":
      case "_NGCoreObject_":
        if (referd && referd.counter) {
            buflist.push(_getClassName(value) + " *" + referd.counter + " {");
        }
        else {
            buflist.push(_getClassName(value) + " {");
        }
        return buflist;
      case "_ObjectEllipsis_":
        buflist.push("Object { (...) }");
        return buflist;
      case "_ObjectCloseBracket_":
        buflist.push("}");
        return buflist;
      case "_NGCoreObjectProperties_":
        buflist.push("Properties:");
        return buflist;
      case "_NGCoreObjectFunctions_":
        buflist.push("Functions:");
        return buflist;
      case "_CircularReference_":
        if (referd && referd.referToObj) {
            buflist.push("Circular Reference to *" + referd.referToObj[4].counter);
        }
        else {
            buflist.push("{ (Circular Reference) }");
        }
        return buflist;
      case "Function": 
        var functionName = value.toString().match(/^.*function[\s]*.+?\)/);
        if (referd && referd.counter) {
            buflist.push(functionName + " { (javascript) }" + " *" + referd.counter);
        }
        else {
            buflist.push(functionName + "{ (javascript) }");
        }
        return buflist;
      case "_NGCoreFunction_":
        var matches = value.toString().match(/\(.*?\)/);
        var args = matches ? matches[0] : "()";

        if (referd && referd.counter) {
            buflist.push(args + ";" + " *" + referd.counter);
        }
        else {
            buflist.push(args + ";");
        }
        return buflist;
      case "Undefined":
        buflist.push("undefined");
        return buflist;
      default:
        throw new Error(type);
    }
};

/**
 * @param {number} max Max depth value.
 * @param {number} num Current depth.
 * @return {number} Be calclated depth value.
 */
var _calcDepth = function(max, num) {
    return max - num;
};

/**
 * @param {number} num .
 */
var _calcIndent = function(indent, depth) {
    var spaceChar = " ";
    var buflist = [];
    var i = 0;
    var len = indent * depth;
    for (i = 0; i < len; i++) {
        buflist.push(spaceChar);
    }
    return buflist.join('');
};

/**
 * @param {Array.<Array.<name:String, depth:number, value:object>>} structures .
 * @param {number} depth .
 * @param {number} indent .
 */
_build = function(structures, depth, indent)
{
    var buflist = [];
    var i;
    var len = structures.length;
    for (i = 0; i < len; i++)
    {
        var structure = structures[i];

        var type = structure[0];
        var value = structure[1];
        var suffix = structure[3];
        var referd = structure[4];
        var indentOption = structure[5];

        var indentChar = _calcIndent(_calcDepth(depth, structure[2]) + indentOption, indent);

        //assert codes
        //if (_typeof(type) !== 'string') {throw new Error("not implemented:" + structure);}
        //if (structure.length !== 6) {throw new Error("not implemented:" + structure);}

        buflist.push(_toString(type, value, indentChar, suffix, referd).join(''));
    }
    return buflist;
};

exports._dump = _dump;
