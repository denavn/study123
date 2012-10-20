/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
var Core = require('../../../NGCore/Client/Core').Core;
var VFXActions = require('./VFXActions').VFXActions;
var ActionList = Core.Class.subclass(
{ /** @lends Service.Graphics.ActionList.prototype */
    classname: "ActionList",
    /**
     * @class The <code>ActionList</code>  class is a effect task class.
     * @constructs The default constructor.
     * @augments Core.Class
     */
    initialize: function ()
    {
        this._actions = [];
        this._frequency = 1;
        var i, j;
        for(i = 0; i < arguments.length; i++)
        {
            var item = arguments[i];
            if(item.length && item instanceof Object)
            {
                for(j = 0; j < item.length; j++)
                {
                    if(item[j] instanceof ActionList)
                    {
                        this._actions.push(item[j]._generate(item[j]));
                    }
                    else
                    {
                        this._actions.push(item[j]);
                    }
                }
            }
            else
            {
                if(item instanceof ActionList)
                {
                    this._actions.push(item._generate(item));
                }
                else
                {
                    this._actions.push(item);
                }
            }
        }
    },
    /**
     * Apply any function as the task. It can be used if any callback is required after any action within the sequence.
     * @example
     *  var sequence = VFX.sequence().rotate(4, 180, Ops.easeInQuad).move(3, [200, 0], Ops.easeInQuad).blink(4, 0.5, [1, 0]).callFunc(function(){
     *  console.log("My custom function executed");	
     *  });
     *  sequence.play(this._node);
     * @param {Function} custom function. It takes "functon" as parameter and this function is registered as a task in the sequence.
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or at-once (simultaneously).
     */
    callFunc: function ()
    {
        var custFunction = VFXActions.callFunc.apply(VFXActions, arguments);
        this._actions.push(custFunction);
        return this;
    },
    /**
     * Creates a Move action which moves a node by the delta position passed, in given duration.  
     * @param {Number} duration the time it takes moving[Seconds].
     * @param {Core.Point | Core.Vector | Array} deltaPosition
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    move: function ()
    {
        var move = VFXActions.move.apply(VFXActions, arguments);
        this._actions.push(move);
        return this;
    },
    /**
     * Creates a Move action which moves a node to target position passed, in given duration. 
     * @param {Number} duration The time it takes in moving[Seconds].
     * @param {Core.Point | Core.Vector | Array} targetPosition
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad , "easeOutQuad".
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    moveTo: function ()
    {
        var moveTo = VFXActions.moveTo.apply(VFXActions, arguments);
        this._actions.push(moveTo);
        return this;
    },
    /**
     * Creates a Scale action which scales a node by delta scale passed, in given duration.
     * @param {Number} duration the time it takes in scaling[Seconds].     
     * @param {Core.Point | Core.Vector | Array} deltaScale
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    scale: function ()
    {
        var scale = VFXActions.scale.apply(VFXActions, arguments);
        this._actions.push(scale);
        return this;
    },
    /**
     * Creates a Scale action which scales a node to target scale passed, in given duration.
     * @param {Number} duration the time it takes in scaling[Seconds].
     * @param {Core.Point | Core.Vector | Array} targetScale
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    scaleTo: function ()
    {
        var scaleTo = VFXActions.scaleTo.apply(VFXActions, arguments);
        this._actions.push(scaleTo);
        return this;
    },
    /**
     * Creates a Blink action which applies blinking effect to a node, for given duration.  
     * @param {Number} duration the time it takes for blinking[Seconds].
     * @param {Number} term Time duration for completing a blinking cycle default = 0.5.
     * @param {Number} alphas ranage of alphas to blink. default = [1,0]
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    blink: function ()
    {
        var blink = VFXActions.blink.apply(VFXActions, arguments);
        this._actions.push(blink);
        return this;
    },
    /**
     * Creates FadeIn action which applies fading in effect on a node, in given duration.
     * @param {Number} duration the time it takes to fade in[Seconds].
     * @param {Number} alpha default=1.
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    fadeIn: function ()
    {
        var fadeIn = VFXActions.fadeIn.apply(VFXActions, arguments);
        this._actions.push(fadeIn);
        return this;
    },
    /**
     * Creates FadeOut action which applies fading out effect on a node, in given duration.
     * @param {Number} duration the time it takes to fade out[Seconds].
     * @param {Number} alpha default=0.
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    fadeOut: function ()
    {
        var fadeOut = VFXActions.fadeOut.apply(VFXActions, arguments);
        this._actions.push(fadeOut);
        return this;
    },
    /**
     * Creates an Alpha action which modifies opacity of a node by passed delta alpha, in given duration. 
     * @param {Number} duration the time it takes for action[Seconds].
     * @param {Number} deltaAlpha 
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    alpha: function ()
    {
        var alpha = VFXActions.alpha.apply(VFXActions, arguments);
        this._actions.push(alpha);
        return this;
    },
    /**
     * Creates an Alpha action which modifies opacity of a node to passed target alpha, in given duration.
     * @param {Number} duration the time it takes moving[Seconds].
     * @param {Number} targetAlpha 
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    alphaTo: function ()
    {
        var alphaTo = VFXActions.alphaTo.apply(VFXActions, arguments);
        this._actions.push(alphaTo);
        return this;
    },
    /**
     * Creates a Rotate action which rotates a node by passed delta angle, in given duration.
     * @param {Number} duration the time it takes in rotation[Seconds].
     * @param {Number} deltaRot delta angle(degree)
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    rotate: function ()
    {
        var rotate = VFXActions.rotate.apply(VFXActions, arguments);
        this._actions.push(rotate);
        return this;
    },
    /**
     * Creates a Rotate action which rotates a node to passed target angle, in given duration.
     * @param {Number} duration the time it takes in rotation[Seconds].
     * @param {Number} targetRot target rotation angle in degrees.
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    rotateTo: function ()
    {
        var rotateTo = VFXActions.rotateTo.apply(VFXActions, arguments);
        this._actions.push(rotateTo);
        return this;
    },
    /**
     * Creates a Color action which modifies color filter of a node by passed deltaRGB, in given duration.
     * @param {Number} duration the time it takes changing color[Seconds].
     * @param {Number} dr change in red component of color.
     * @param {Number} dg change in green component of color.
     * @param {Number} db change in blue component of color.
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    color: function ()
    {
        var color = VFXActions.color.apply(VFXActions, arguments);
        this._actions.push(color);
        return this;
    },
    /**
     * Creates a Color action which modifies color filter of a node to passed targetRGB, in given duration.
     * @param {Number} duration the time it takes changing color[Seconds].
     * @param {Number} tr target red component of color.
     * @param {Number} tg target green component of color.
     * @param {Number} tb target blue component of color.
     * @param {Function | String} easing easing function. i.e. Ops.easeInQuad, "easeOutQuad".
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    colorTo: function ()
    {
        var colorTo = VFXActions.colorTo.apply(VFXActions, arguments);
        this._actions.push(colorTo);
        return this;
    },
    /**
     * Creates a Bezier action which moves the target node to the destination point, moving it through a curve created from the control points passed in configuration object, in the duration passed. 
     * @param {Number} duration Time duration for action.
     * @param {Object} Object Contains 3 points controlPoint_1{Point},controlPoint_2{Point},endPosition{Point}
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously. 
     * @example
     * var obj = {};
        obj.controlPoint_1 = [75,200];
        obj.controlPoint_2 = [150,400];
        obj.endPosition = [250,300];
        var spawn = VFX.spawn().bezierTo(5,obj).blink(4,0.5,[1,0]);
        spawn.play(node);
     */
    bezier: function ()
    {
        var bezier = VFXActions.bezier.apply(VFXActions, arguments);
        this._actions.push(bezier);
        return this;
    },
    /**
     * Creates a Bezier action which moves the target node by the delta position, moving it through a curve created from the control points passed in configuration object, in the duration passed.  
     * @param {Number} duration Time duration for action.
     * @param {Object} Object containing 3 points ControlPoint_1{Point},ControlPoint_2{Point},EndPosition{Point}
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously. 
     */
    bezierTo: function ()
    {
        var bezierTo = VFXActions.bezierTo.apply(VFXActions, arguments);
        this._actions.push(bezierTo);
        return this;
    },
    /**
     * Creates a Jump action which moves the target node by delta position, while giving it a jumping effect. Number of jumps and height of each jump can be confiugred by parameters.
     * @param {Number} duration Time duration for action.
     * @param {Core.Point | Core.Vector | Array} deltaPosition
     * @param {Number} height for Jump.
     * @param {Number} numberofJumps
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously. 
     */
    jump: function ()
    {
        var jump = VFXActions.jump.apply(VFXActions, arguments);
        this._actions.push(jump);
        return this;
    },
    /**
     * Creates a Jump action which moves the target node to destination, while giving it a jumping effect. Number of jumps and height of each jump can be configured by parameters. 
     * @param {Number} duration Time duration for action.
     * @param {Core.Point | Core.Vector | Array} targetPosition
     * @param {Number} height for Jump.
     * @param {Number} numberofJumps
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously. 
     */
    jumpTo: function ()
    {
        var jumpTo = VFXActions.jumpTo.apply(VFXActions, arguments);
        this._actions.push(jumpTo);
        return this;
    },
    /**
     * Creates a Place action which changes the position relative to the node after the given duration.
     * @param {Number} duration Time duration for Place action.
     * @param {Core.Point | Core.Vector | Array} deltaPosition
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    place: function ()
    {
        var place = VFXActions.place.apply(VFXActions, arguments);
        this._actions.push(place);
        return this;
    },
    /**
     * Creates a Place action which changes the position of the node to destination point, after a given duration.
     * @param {Number} duration Time duration for that particular task.
     * @param {Core.Point | Core.Vector | Array} targetPosition
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    placeTo: function ()
    {
        var placeTo = VFXActions.placeTo.apply(VFXActions, arguments);
        this._actions.push(placeTo);
        return this;
    },
    /**
     * Creates a Visibility action which instantly toggles the visibility of a node.
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously. 
     */
    toggleVisible: function ()
    {
        var toggleVisible = VFXActions.toggleVisible.apply(VFXActions, arguments);
        this._actions.push(toggleVisible);
        return this;
    },
    /**
     * Creates a Hop action which makes a node jump with velocity under the effect of gravity. Velocity and gravity are configurable. 
     * @param {Number} velocity first speed.
     * @param {Number} gravity damping rate.
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    hop: function ()
    {
        var hop = VFXActions.hop.apply(VFXActions, arguments);
        this._actions.push(hop);
        return this;
    },
    /**
     * Creates a Visibility action which makes the node appear instantly. 
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    appear: function ()
    {
        var appear = VFXActions.appear.apply(VFXActions, arguments);
        this._actions.push(appear);
        return this;
    },
    /**
     * Creates a Visibility action which makes a node disappear instantly.
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    disappear: function ()
    {
        var disappear = VFXActions.disappear.apply(VFXActions, arguments);
        this._actions.push(disappear);
        return this;
    },
    /**
     * Creates a wait action which stops running actions for given duration.
     * @param {Number} time seconds
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously.
     */
    waitFor: function ()
    {
        var waitFor = VFXActions.waitFor.apply(VFXActions, arguments);
        this._actions.push(waitFor);
        return this;
    },
    /**
     * Repeat current sequence | spawn for given number of times. 
     * @param {Number} frequency
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously. 
     * */
    repeat: function (frequency)
    {
        this._frequency = frequency;
        return this;
    },
    /**
     * Repeat current sequence | spawn forever.
     * @returns {Service.Graphics.ActionList} sequence or spawn to play actions in sequence or simultaneously. 
     */
    repeatForEver: function ()
    {
        this._frequency = -1;
        return this;
    },
    /**
     * Starts already created sequence | spawn on passed node.
     * @param {GL2.Node} node 
     * @example 
     * var callback = function() {
     * console.log("Sequence Ended...");
     * };
     * var sequence = VFX.sequence().moveTo(4,new Core.Point(200,200),Ops.easeInQuad).moveTo(4,new Core.Point(20,20),Ops.easeInQuad);
     * sequence.play(node,callback);
     * 
     * */
    play: function (node, callback)
    {
        var actions = this._generate();
        actions.play(node, callback);
    },
    /**
     * Stop all remained tasks of passed node.
     *
     * @param {GL2.Node} node Target node object.
     */
    stop: function (node)
    {
        VFXActions.stopAction(node);
    },
    /**
     * Destroy the current sequence or spawn and release resources on backend.
     */
    destroy: function ()
    {
        delete this._actions;
        delete this._frequency;
    }
});
var SequenceGenerator = ActionList.subclass(
{
    classname: "SequenceGenerator",
    initialize: function ()
    {},
    /**
     * private method..
     */
    _generate: function ()
    {
        var sequence = VFXActions.createSequence(this._actions);
        if(this._frequency)
        {
            if(this._frequency === -1)
            {
                sequence.repeatForEver();
            }
            else
            {
                sequence.repeat(this._frequency);
            }
        }
        return sequence;
    }
});
var SpawnGenerator = ActionList.subclass(
{
    classname: "SpawnGenerator",
    initialize: function ()
    {},
    /**
     * private method..
     */
    _generate: function ()
    {
        var spawn = VFXActions.createSpawn(this._actions);
        if(this._frequency)
        {
            if(this._frequency === -1)
            {
                spawn.repeatForEver();
            }
            else
            {
                spawn.repeat(this._frequency);
            }
        }
        return spawn;
    }
});
exports.VFX = Core.Class.singleton(
{ /** @lends Service.Graphics.VFX.prototype */
    classname: "VFX",
    /**
     * @class The <code>VFX</code> class extends Core.Class and is a singleton class to create Sequences and Spawns.
     * @constructs The default constructor.
     * @augments Core.Class
     */
    initialize: function ()
    {},
    /**
     * Creates a sequence for provided actions. If  want to run sequence or spawn inside a sequence then earlier sequence and spawn can be passed as argument. 
     * @param {SpawnGenerator | SequenceGenerator} actions earlier created sequence and spawn can be passed as argument.
     * @return {SequenceGenerator} currently created sequence.
     * @example
     * var callback = function() {
     * console.log("Sequence Completed.");
     * }
     * var node = new GL2.Node();
     * GL2.Root.addChild(node);
     * var tankImage = new GL2.Sprite();
     * tankImage.setPosition(0, 0);
     * tankImage.setDepth(-1);
     * tankImage.setImage('Content/tank.png', [64, 64], [0.5, 0.5], [0, 0, 1 / 5, 1]);
     * node.addChild(tankImage);
     * node.setPosition(40, 240);
     * var sequence = VFX.sequence().move(3, [50, -50], Ops.easeInQuad).alphaTo(1, 0.5, Ops.easeInQuad).rotate(3, 200, Ops.easeInQuad).alphaTo(1, 1.0, Ops.easeInQuad).repeat(3);
     * sequence.play(node,callback); //  instanceof GL2.Node.
     * 
     */
    sequence: function ()
    {
        return new SequenceGenerator(arguments);
    },
    /**
     * Creates a spawn for provided actions. If  want to run sequence or spawn inside a spawn then earlier sequence and spawn can be passed as argument. 
     * @param {SpawnGenerator | SequenceGenerator} actions earlier created sequence and spawn can be passed as argument.
     * @return {SequenceGenerator} currently created spawn.
     * @example
     * var callback = function() {
     * console.log("Spawn Completed.");
     * }
     * var node = new GL2.Node();
     * GL2.Root.addChild(node);
     * var tankImage = new GL2.Sprite();
     * tankImage.setPosition(0, 0);
     * tankImage.setDepth(-1);
     * tankImage.setImage('Content/tank.png', [64, 64], [0.5, 0.5], [0, 0, 1 / 5, 1]);
     * node.addChild(tankImage);
     * node.setPosition(40, 240);
     * var spawn = VFX.spawn().move(3, [50, -50], Ops.easeInQuad).alphaTo(1, 0.5, Ops.easeInQuad).rotate(3, 200, Ops.easeInQuad).blink(1, 0.5, [1,0]).repeat(3);
     * spawn.play(node,callback); //  instanceof GL2.Node.
     * 
     */
    spawn: function ()
    {
        return new SpawnGenerator(arguments);
    },
    /**
     * Stops all running actions.
     */
    stopAll: function ()
    {
        VFXActions.stopActions();
    },
    /**
     * Pause all running actions.
     */
    pause: function ()
    {
        VFXActions.pause();
    },
    /**
     * Resume all paused actions.
     */
    resume: function ()
    {
        VFXActions.resume();
    },
    /**
     * Return true if actions are active else false.
     * @return {Boolean} true if actions are active else false. 
     */
    isActive: function ()
    {
        return VFXActions.isRunning();
    }
});