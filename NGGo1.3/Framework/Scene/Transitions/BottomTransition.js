////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Taha Samad
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
// Require Block
var MoveTransition = require('./_MoveTransition').MoveTransition;
////////////////////////////////////////////////////////////////////////////////
exports.BottomTransition = MoveTransition.singleton(
{
    classname: 'BottomTransition',
    _getNewPosition: function (newPosition, result)
    {
        result.setY(newPosition.getY());
    }
});