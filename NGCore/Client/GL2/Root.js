var Core = require('../Core').Core;
var Touch = require('./Touch').Touch;
var Diagnostics = require('./Diagnostics').Diagnostics;
var Node = require('./Node').Node;

/*#if TYPECHECK
var T = Core.TypeCheck;
#endif*/

var Root = exports.Root = Core.Class.singleton(
/** @lends GL2.Root.prototype */
{
	classname: 'Root',

	/**
	 * @class The `GL2.Root` class is a singleton that acts as a container for the `GL2` objects
	 * that comprise the scene graph. `GL2` node trees must be added to the `GL2.Root` singleton so
	 * that their individual nodes can be displayed and can receive touch events.
	 * @name GL2.Root
	 * @augments Core.Class
	 * @constructs
	 * @singleton
	 * @since 1.0
	 */
	initialize: function()
	{
		Core.ObjectRegistry.register(this);
	    Diagnostics.pushCollector(this.nodesInGraph.bind(this));

		this._children = [];

		this._createSendGen(this.__objectRegistryId);

		this._touchTracking = {};
	},

	/**
	 * Add a node tree to the root of the scene graph.
	 * @example
	 * var mainNode = new GL2.Node(),
	 *     sprite = new GL2.Sprite(),
	 *     text = new GL2.Text();
	 * mainNode.addChild(sprite).addChild(text);
	 * GL2.Root.addChild(mainNode);
	 * @param {Object} child The node tree to add. This parameter must contain an object instance
	 *		that inherits from `{@link GL2.Node}`.
	 * @returns {void}
	 * @see GL2.Root#removeChild
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	addChild: function(child)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Node)]);
#endif*/
		this._children.push(child);
		child._didAddToParent(this);

		this._addChildSendGen(Core.ObjectRegistry.objectToId(child));
	},

	/**
	 * Remove a node tree from the root of the scene graph.
	 *
	 * **Note**: Removing a node tree from the scene graph does not destroy the node tree. You must
	 * explicitly call `destroy()` on the parent node and its children when you no longer need to
	 * use the node tree.
	 * @example
	 * var sprite = new GL2.Sprite();
	 * GL2.Root.addChild(sprite);
	 * // Additional code here.
	 * // Later, when the application is no longer using the sprite:
	 * GL2.Root.removeChild(sprite);
	 * @param {Object} child The node tree to remove. This parameter must contain an object instance
	 *		that inherits from `{@link GL2.Node}`.
	 * @throws {Error} The specified node tree is not a child of `GL2.Root`.
	 * @returns {void}
	 * @see GL2.Root#addChild
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	removeChild: function(child)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Node)]);
#endif*/
		child._willRemoveFromParent();

		var index = this._children.indexOf(child);
		if(index == -1)
			throw new Error('removeChild called for a node that is not a child');
		this._children.splice(index, 1);

		this._removeChildSendGen(Core.ObjectRegistry.objectToId(child));
	},

	/**
	 * Translate a location in the global scene's coordinate space to the coordinate space of the
	 * scene graph's root. These two coordinate spaces are identical; therefore, you will not
	 * normally need to call this method.
	 * @param {Core.Point} location The location to transform.
	 * @returns {Core.Point} The location's coordinates within the local coordinate space of the
	 *		scene graph's root.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	screenToLocal: function(location)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Core.Point)]);
#endif*/
		return location;
	},

	/**
	 * Translate a location in the coordinate space of the scene graph's root to the global scene's
	 * coordinate space. These two coordinate spaces are identical; therefore, you will not
	 * normally need to call this method.
	 * @param {Core.Point} location The location to transform.
	 * @returns {Core.Point} The location's coordinates within the global scene's coordinate space.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	localToScreen: function(location)
	{
/*#if TYPECHECK
		T.validateArgs(arguments, [T.Arg(Core.Point)]);
#endif*/
		return location;
	},

	_onTouchEventRecv: function( cmd )
	{
		var msg = {};
		if(!this._onTouchEventRecvGen(cmd, msg))
			return;

		// Build touch object.
		var touchId = msg.touchId;
		var touchAction = msg.touchAction;
		var touch = new Touch();
	        var i, o, track;
		touch._setId(touchId);
		touch._setAction(touchAction);
		touch._setPosition(msg.x, msg.y);

		// Extract all touch targets.
		var ids = [];
		for(i=0; i < msg.touchTargetCount; ++i)
		{
			var t = {};
			if(!this._touchTargetRecvGen(cmd, t))
				return;
			// Add an array entry for every touch event that we have gotten from native.
			ids.push(t.nodeId);
		}

		touch._setTargetIds(ids);

		switch(touchAction)
		{
			case Touch.Action.Start:
				// Dispatch to all touch targets until one handles it.
				for(var key in ids)
				{
					var id=ids[key];
					o = Core.ObjectRegistry.idToObject(id);
					if(o && o.getTouchEmitter().chain(touch))
					{
						this._touchTracking[touchId] = id;
						break;
					}
				}
				break;
			case Touch.Action.End:
				// Dispatch to tracking object.
				track = this._touchTracking[touchId];
				if(track)
				{
					o = Core.ObjectRegistry.idToObject(track);
                    if (o)
                        o.getTouchEmitter().chain(touch);
					delete this._touchTracking[touch.getId()];
				}
				break;
			case Touch.Action.Move:
				// Dispatch to tracking object.
				track = this._touchTracking[touchId];
				if(track)
				{
					o = Core.ObjectRegistry.idToObject(track);
                    if (o)
                        o.getTouchEmitter().chain(touch);
				}
				break;
		}
	},

// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 309,
	// Method create = -1
	// Method addChild = 2
	// Method removeChild = 3
	// Method onTouchEvent = 4
	// Method touchTarget = 5
	
	/** 
	 * Command dispatch.
	 * @private
	 */
	$_commandRecvGen: (function() { var h = (function ( cmd )
	{
		var cmdId = Core.Proc.parseInt( cmd.shift(), 10 );
		
		if( cmdId > 0 )	// Instance Method.
		{
			var instanceId = Core.Proc.parseInt( cmd.shift(), 10 );
			var instance = Core.ObjectRegistry.idToObject( instanceId );
			
			if( ! instance )
			{
				NgLogE("Object instance could not be found for command " + cmd + ". It may have been destroyed this frame.");
				return;
			}
			
			switch( cmdId )
			{
				
				case 4:
					instance._onTouchEventRecv( cmd );
					break;
				case 5:
					instance._touchTargetRecv( cmd );
					break;
				default:
					NgLogE("Unknown instance method id " + cmdId + " in Root._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in Root._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[309] = h; return h;})(),
	
	/////// Private recv methods.
	
	/** @private */
	_onTouchEventRecvGen: function( cmd, obj )
	{ 
		if( cmd.length < 5 )
		{
			NgLogE("Could not parse due to wrong argument count in Root.onTouchEvent from command: " + cmd );
			return false;
		}
		
		obj[ "touchId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "touchId" ] === undefined )
		{
			NgLogE("Could not parse touchId in Root.onTouchEvent from command: " + cmd );
			return false;
		}
		
		obj[ "touchAction" ] = Core.Proc.parseInt( cmd[ 1 ] );
		if( obj[ "touchAction" ] === undefined )
		{
			NgLogE("Could not parse touchAction in Root.onTouchEvent from command: " + cmd );
			return false;
		}
		
		obj[ "x" ] = Core.Proc.parseFloat( cmd[ 2 ] );
		if( obj[ "x" ] === undefined )
		{
			NgLogE("Could not parse x in Root.onTouchEvent from command: " + cmd );
			return false;
		}
		
		obj[ "y" ] = Core.Proc.parseFloat( cmd[ 3 ] );
		if( obj[ "y" ] === undefined )
		{
			NgLogE("Could not parse y in Root.onTouchEvent from command: " + cmd );
			return false;
		}
		
		obj[ "touchTargetCount" ] = Core.Proc.parseInt( cmd[ 4 ] );
		if( obj[ "touchTargetCount" ] === undefined )
		{
			NgLogE("Could not parse touchTargetCount in Root.onTouchEvent from command: " + cmd );
			return false;
		}
		
		cmd.splice(0, 5);
		return true;
	},
	
	/** @private */
	_touchTargetRecvGen: function( cmd, obj )
	{ 
		if( cmd.length < 1 )
		{
			NgLogE("Could not parse due to wrong argument count in Root.touchTarget from command: " + cmd );
			return false;
		}
		
		obj[ "nodeId" ] = Core.Proc.parseInt( cmd[ 0 ] );
		if( obj[ "nodeId" ] === undefined )
		{
			NgLogE("Could not parse nodeId in Root.touchTarget from command: " + cmd );
			return false;
		}
		
		cmd.splice(0, 1);
		return true;
	},
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x135ffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_addChildSendGen: function( child )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1350002, this, [ +child ] );
	},
	
	/** @private */
	_removeChildSendGen: function( child )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x1350003, this, [ +child ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// addChild: function( child ) {}
	
	// removeChild: function( child ) {}
	
	// _onTouchEventRecv: function( cmd ) {}
	// _touchTargetRecv: function( cmd ) {}
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

	,
    // Diagnostics collector
    nodesInGraph: function(interval) 
    {
	var diag = {graph_nodes: 0};

	// Do BFS, don't recurse; SG may be deep
	var nodes = this._children.slice();
	while(nodes.length > 0)
	{
	    var node = nodes.shift();
	    nodes = nodes.concat(node._children);
	    diag.graph_nodes++;
	}

	return diag;
    }
});
