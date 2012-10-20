/**
 *  @author     Taha Samad, Sheraz Ch.
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
var Class = require('../../../NGCore/Client/Core/Class').Class;

/**
 * @class The <code>DumpSetting</code> class can display information about any JavaScript primitive type, function and object, including both built-in and user defined objects.
 * @constructs This is singleton class,
 * @name Service.Debug.DumpSetting
 * @augments Core.Class
 */
exports.DumpSetting = Class.singleton( /** @lends Service.Debug.DumpSetting.prototype */
{
    classname: 'DumpSetting',

    initialize: function ()
    {
        this._depth = 2;
        this._indent = 2;
        this._verbose = true;
    },

    /**
     * This function is used to set whether private class members should be displayed or not. Any class property whose name starts with an underscore ( _ ) is consider to be a private member.
     * @param {Boolean} bool Sets the verbose property dump function. By default it is ``true``.
     * @example DumpSetting.setVerbose(false);
     */
    setVerbose: function(bool)
    {
        this._verbose = bool;
    },

    /**
     * This function returns the value of setVerbose wheather ``true`` or ``false`` .
     * @return {Boolean} return ``false`` if sets to ``false``, otherwise ``true`` .
     * @example DumpSetting.getVerbose();
     */
    getVerbose: function()
    {
        return this._verbose;
    },

    /**
     * This function is used to set default maximum depth of dump().
     * @param {number} num Sets the default maximum depth.
     * @example DumpSetting.setDepth(4);
     */
    setDepth: function(num)
    {
        this._depth = num;
    },

    /**
     * This function is used to get the default maximum depth of dump().
     * @return {number} Gets default maximum depth.
     * @example DumpSetting.getDepth();
     */
    getDepth: function()
    {
        return this._depth;
    },

    /**
     * This function is used to set default indentation spaces.
     * @param {number} num Sets the number of spaces in indent.
     * @example DumpSetting.setIndent(4);
     */
    setIndent: function(num)
    {
        this._indent = num;
    },

    /**
     * This function is used to get the default indentation spaces.
     * @return {number} Returns the number of spaces in indent.
     * @example DumpSetting.getIndent();
     */
    getIndent: function()
    {
        return this._indent;
    }
});
