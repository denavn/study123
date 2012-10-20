////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Taha Samad
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
/**
 * <p><code>Transitions</code> module.</p>
 * @name Framework.Scene.Transitions
 * @namespace
 * @description <p><code>Transitions</code> package provides functionality to add Transition for Scene. Below are the predefined Transition Types. You can also integrate your own Transition Types. See Documentation of {@link Framework.Scene.Transitions.Transition} for more detail.</p>
 * <ul>
 * <li><code>{@link Framework.Scene.Transitions.Transition}: Base class of Transition. All Transitions must inherit from this class</li>
 * <li><code>{@link Framework.Scene.Transitions.BottomLeftTransition}: Implements Move In/Out Transition from BottomLeft of Screen.</li>
 * <li><code>{@link Framework.Scene.Transitions.BottomRightTransition}: Implements Move In/Out Transition from BottomRight of Screen.</li>
 * <li><code>{@link Framework.Scene.Transitions.BottomTransition}: Implements Move In/Out Transition from Bottom of Screen.</li>
 * <li><code>{@link Framework.Scene.Transitions.ColorTransition}: Implements Color In/Out Transition.</li>
 * <li><code>{@link Framework.Scene.Transitions.FadeTransition}: Implements Fade In/Out Transition.</li>   
 * <li><code>{@link Framework.Scene.Transitions.LeftTransition}: Implements Move In/Out Transition from Left of Screen.</li>
 * <li><code>{@link Framework.Scene.Transitions.RightTransition}: Implements Move In/Out Transition from Right of Screen.</li>       
 * <li><code>{@link Framework.Scene.Transitions.TopLeftTransition}: Implements Move In/Out Transition from TopLeft of Screen.</li>       
 * <li><code>{@link Framework.Scene.Transitions.TopRightTransition}: Implements Move In/Out Transition from TopRight of Screen.</li>        
 * <li><code>{@link Framework.Scene.Transitions.TopTransition}: Implements Move In/Out Transition from Top of Screen.</li>         
 */
exports.Transitions = {
    BottomLeftTransition: require('./Transitions/BottomLeftTransition').BottomLeftTransition,
    BottomRightTransition: require('./Transitions/BottomRightTransition').BottomRightTransition,
    BottomTransition: require('./Transitions/BottomTransition').BottomTransition,
    ColorTransition: require('./Transitions/ColorTransition').ColorTransition,
    FadeTransition: require('./Transitions/FadeTransition').FadeTransition,
    LeftTransition: require('./Transitions/LeftTransition').LeftTransition,
    RightTransition: require('./Transitions/RightTransition').RightTransition,
    TopLeftTransition: require('./Transitions/TopLeftTransition').TopLeftTransition,
    TopRightTransition: require('./Transitions/TopRightTransition').TopRightTransition,
    TopTransition: require('./Transitions/TopTransition').TopTransition,
    Transition: require('./Transitions/Transition').Transition
};