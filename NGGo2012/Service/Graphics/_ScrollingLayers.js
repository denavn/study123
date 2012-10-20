var Core = require('../../../NGCore/Client/Core').Core;
var Animation = require('../../../NGCore/Client/GL2/Animation').Animation;
var NGCoreSprite = require('../../../NGCore/Client/GL2/Sprite').Sprite;

exports.Sprite = NGCoreSprite.subclass(
/** @lends GL2.Sprite.prototype */
{
	classname: 'Sprite',
	
	/**	 
	 * @class This class are based on <code>GL2.Sprite</code>.
   * The <code>Sprite</code> class constructs objects that are used to display either a single image file
	 * (see <code><a href="GL2.Sprite.html#setImage">setImage()</a></code>) or an animation.<br><br>
	 * Sprites apply their composite node transform and color to the final 
	 * rendered output of each <code><a href="GL2.Animation.Frame.html">frame</a></code> they display. Frames manage the
	 * pre-transform offset within the image. The pre-transform offset is used by frames for rotation and scale of the image. Combining these
	 * two features, an application can accurately place an image within the view.<br><br>
	 * Animations that reach the end of the last animation frame will trigger the
	 * <code>AnimationCompleteEmitter</code> (see <code><a href="GL2.Sprite.html#getAnimationCompleteEmitter">getAnimationCompleteEmitter()</a></code>). 
	 * All other cases, such as setting a new
	 * animation, does not trigger the emitter.<br><br>
	 * <b>Note:</b> The tick rate for any animation instantiated through <code>Sprite</code> is set through <code>{@link Core.UpdateEmitter#setTickRate}</code>.
	 * @constructs The default constructor.
	 * @augments GL2.Node
   * @private
	 */
    initialize: function($super)
    {
        $super();
    },
    /**
	 * Set a static image as the current animation for this <code>Sprite</code>.
	 * Internally, this method instantiates a single frame animation of infinite duration using the
	 * specified image. If the sprite is playing another animation at the time of this call, the new animation will take priority over the sprite.
	 * The previous animation will stop and the complete emitter will not respond. This is because the animation did not technically complete a full playback cycle. 
	 * <br><br>
	 * <b>Note:</b> You can release the resources for any image set with <code>setImage()</code> from the native backend if no other frame
	 * contains it.
	 * @example var myImage = new GL2.Sprite();
	 * myImage.setImage('./Content/animation.png', size);
	 * @param {String} image The directory path to an image resource.
	 * @param {Core.Size} [size] The size of the image to display (in pixels).
	 * @param {Core.Point} [anchor] The anchor coordinates that indicate the image center in the animation.
	 * @param {Core.Rect} [uvs] The UV coordinates used to specify the subset of an image.
	 * @returns This function returns <code>this</code> to support method invocation chaining.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested
	 */
    setImage: function(image, size, anchor, uvs)
	{
		this._tryDestroyAnimation();
		
		// Create a single frame animation.
		var args = Array.prototype.slice.call(arguments, 0);
		args.splice(1, 0, 0); // Insert a duration of zero into our arguments.
		var frame = new Animation.Frame();
		frame.constructor.apply(frame, args);
		var animation = new Animation();
    animation.setFilteringEnabled(false); //Texture filtering enabled. Specific Serviec.Graphics.ScrollingLayers modified.
		animation.pushFrame(frame);
		
		this._animation = animation;
		this._ownsAnimation = true;
		
		this._setAnimationSendGen(Core.ObjectRegistry.objectToId(animation),0);
		
		return this;
	}
});
