////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

/**
 * @name Foundation.Math.Ops
 * @class Set of basic utility operations to make my life a little easier.
 * <br><br>
 * Really this is just do a "Collision" test between a point an a box.
 * We should move this to Box2D or something faster....
 */
exports.Ops = {};

/**
 * Generates random number which is in [rangeMin, rangeMax).
 * <br><br>
 * If only <code>rangeMin</code> is passed, It runs like: <code>randomInt(0, rangeMin)</code>.
 * @name Foundation.Math.Ops.randomInt
 * @param {Number} rangeMin Minimum value.
 * @param {Number} rangeMax Maximum value, but results not includes this value it self.
 * @returns {Number} Result random number.
 */
exports.Ops.randomInt = function(rangeMin, rangeMax)
{
    if(rangeMax === undefined)
    {
        rangeMax = rangeMin;
        rangeMin = 0;
    }

    var range = rangeMax - rangeMin;
    return Math.floor(Math.random() * range) + rangeMin;
};

/**
 * Generates random number which is in [-1, +1]
 * <br><br>
 * @returns {Number} Result random number.
 */
exports.Ops.randomMinusOneToOne = function()
{
    return Math.random() * 2.0 - 1.0;
};

/**
 * Clamps the input value to the specified range.
 * <br><br>
 * If the value is not in the range between <code>nMin</code> and <code>nMax</code>, the result is set in this range.
 * @name Foundation.Math.Ops.clamp
 * @param {Number} nValue Input value.
 * @param {Number} nMin Minimum number of result.
 * @param {Number} nMax Maximum number of result.
 * @returns {Number} Result value.
 */
exports.Ops.clamp = function(nValue, nMin, nMax)
{
    return nValue < nMin ? nMin : nValue > nMax ? nMax : nValue ;
};

/**
 * Calculates the linear position for a motion tween object.
 * @name Foundation.Math.Ops.linearTween
 * @param {Number} time Time that has elapsed.
 * @param {Number} begin Begin position.
 * @param {Number} change Change in position so far.
 * @param {Number} duration Duration of the tween.
 * @returns {Number} New potion.
 */
exports.Ops.linearTween = function(time, begin, change, duration)
{
    return change * time / duration + begin;
};

/**
 * Calculates the position for a motion tween object with ease in.
 * @name Foundation.Math.Ops.easeInQuad
 * @param {Number} time Time that has elapsed.
 * @param {Number} begin Begin position.
 * @param {Number} change Change in position so far.
 * @param {Number} duration Duration of the tween.
 * @returns {Number} New potion.
 */
exports.Ops.easeInQuad = function(time, begin, change, duration)
{
    return change * (time /= duration) * time + begin;
};

/**
 * Calculates the position for a motion tween object with ease out.
 * @name Foundation.Math.Ops.easeOutQuad
 * @param {Number} time Time that has elapsed.
 * @param {Number} begin Begin position.
 * @param {Number} change Change in position so far.
 * @param {Number} duration Duration of the tween.
 * @returns {Number} New potion.
 */
exports.Ops.easeOutQuad = function(time, begin, change, duration)
{
    return -change * (time /= duration) * (time - 2) + begin;
};

/**
 * Calculates the position for a motion tween object with exponential ease in.
 * @name Foundation.Math.Ops.easeInExpo
 * @param {Number} time that has elapsed
 * @param {Number} begin position
 * @param {Number} change in position so far
 * @param {Number} duration of the tween
 * @returns {Number} new potion
 */
exports.Ops.easeInExpo = function(time, begin, change, duration)
{
    return change * Math.pow(2, 10 * (time/duration - 1)) + begin;
};

/**
 * Calculates the position for a motion tween object with exponential ease out.
 * @name Foundation.Math.Ops.easeOutExpo
 * @param {Number} time Time that has elapsed.
 * @param {Number} begin Begin position.
 * @param {Number} change Change in position so far.
 * @param {Number} duration Duration of the tween.
 * @returns {Number} New potion.
 */
exports.Ops.easeOutExpo = function(time, begin, change, duration)
{
    return change * (-Math.pow(2, -10 * time/duration) + 1) + begin;
};

/*
exports.Ops.easeInOutExpo = function(time, begin, change, duration)
{
    if ((time/=(duration*0.5)) < 1)
    {
        return change*0.5 * Math.pow(2, 10 * (time - 1)) + begin;
    }
    return change * 0.5 * (-Math.pow(2, -10 * --time) + 2) + begin;
*/
