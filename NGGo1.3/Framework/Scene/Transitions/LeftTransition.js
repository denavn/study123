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
exports.LeftTransition = MoveTransition.singleton( 
{
    classname: 'LeftTransition',
    _getNewPosition: function (newPosition, result)
    {
        result.setX(-newPosition.getX());
    }
});