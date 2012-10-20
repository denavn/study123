/**
 *  @author     Taha Samad, Sheraz Ch.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */

var DumpSetting = require("./DumpSetting").DumpSetting;
var _dump = require("./_Dump")._dump;

/**
 * This function displays the information about the object that is passed to it up to mentioned depth.Default maxDepth value is unlimited.
 * @param {Object} obj Object to be printed.
 * @param {?boolean} verbose (Optional Parameter) Sets the verbose property of dump() function. By default it is ``true``. if set ``null`` then use Default setting.
 * @param {?number} depth (Optional Parameter) Limit the depth to which objects are printed. if set ``null`` then use Default setting.
 * @param {?number} indent (Optional Parameter) Sets the number of spaces in indent. if set ``null`` then use Default setting.
 * @return {string} Object to be printed string.
 * @example dump(object);
 *  dump(object, true);
 *  dump(object, false, 3);
 *  dump(object, false, 3, 4);
 */
exports.dump = function (obj, verbose, depth, indent)
{
    verbose = (verbose === false) ? verbose : DumpSetting.getVerbose();
    depth = (depth > 0) ? depth : DumpSetting.getDepth();
    indent = (indent > 0) ? indent : DumpSetting.getIndent();

    var result = _dump(obj, verbose, depth, indent);

    var i;
    var len = result.length;
    for (i = 0; i < len; i++)
    {
        console.log(result[i]);
    }
    return result.join("\n");
};
