var Shape = require('./Shape').Shape;

exports.PolygonShape = Shape.subclass(
/** @lends Physics2.PolygonShape.prototype */
{
	classname: 'PolygonShape',
	
	/**
	 * @class The <code>PolygonShape</code> class constructs objects that define a polygon collision shape.
	 * @constructs The default constructor. 
	 * @augments Physics2.Shape
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function()
	{
		this._vertexes = [];
	},
	
	/**
	 * Destroy this instance and release resources on the backend.
	 * @returns {void}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	destroy: function()
	{
	},
	
	/**
	 * Retrieve the number of vertices from this <code>PolygonShape</code>.
	 * @returns {Number} The current number of vertices.
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getVertexCount: function()
	{
		return this._vertexes.length;
	},
	
	/**
	 * Retrieve a vertex at a specific index of this <code>PolygonShape</code>.
	 * @param {Number} index The index containing the vertex to retrieve.
	 * @returns {Core.Point} The current vertex at the specified index.
	 * @see Physics2.PolygonShape#setVertex
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	getVertex: function(index)
	{
		return this._vertexes[index];
	},
	
    /**
	 * Add a vertex polygon to this <code>PolygonShape</code>.
	 * <pre class="code"><font size="1">var poly = new Physics2.PolygonShape();
	 * ...
	 * poly.pushVertex(new Core.Point(w*2/10, h*5/6));</font></pre>
	 * Calling <code>pushVertex()</code> is equivalent to calling <code>spliceVertexes()</code> in the following way:
	 * <pre class="code"><font size="1">PolygonShape.spliceVertexes(polygon.getVertexCount(), 0, vertex)</font></pre>
	 * @param {Core.Point} vertex The vertex to add.
	 * @see Physics2.PolygonShape#spliceVertexes
	 * @returns {this}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
	pushVertex: function(vertex)
	{
		return this.spliceVertexes(this._vertexes.length, 0, vertex);
	},
	
    /**
	 * Set the vertex at index <i>i</i> for this <code>PolygonShape</code>.
	 * Calling <code>setVertex()</code> is equivalent to calling <code>spliceVertexes()</code> in the following way:
	 * <pre class="code"><font size="2">vertex.spliceVertexes(i, 1, vertex)</font></pre>
	 * @param {Number} <i>i</i> The specified index.
	 * @param {Core.Point} vertex The vertex to set.
	 * @see Physics2.PolygonShape#getVertex
	 * @returns {this}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    setVertex: function(i, vertex)
	{
		return this.spliceVertexes(i, 1, vertex);
	},
	
    /**
	 * Remove <code>len</code> vertices, beginning at <code>start</code> position, and insert vertices at <code>start</code> position.
	 * This method accepts <i>n</i> parameters, assuming that the second parameter and higher are references to vertices.<br /><br />
	 * The following is an example of passing three vertices to insert.
	 * @param {Number} start The index of the first vertex to remove.
	 * @param {Number} len The number of vertices to remove.
	 * @param {Core.Point} vertexes The vertices to remove.
	 * @example
	 * PolygonShape.spliceVertexes(0, 0, vertex1, vertex2, vertex3).
	 * @returns {this}
	 * @status iOS, Android, Flash, Test, iOSTested, AndroidTested, FlashTested
	 * @since 1.0
	 */
    spliceVertexes: function(start, len, vertexes)
	{
		var v = this._vertexes;
		v.splice.apply(v, arguments);
		
		var vertexCount = arguments.length-2;
		this._spliceVertexesSendGen(start,len,vertexCount);
		
		for(var i=0; i < vertexCount; ++i)
		{
			var vertex = arguments[i+2];
			this._vertexSendGen(vertex.getX(),vertex.getY());
		}
		
		return this;
	},
	
// {{?Wg Generated Code}}
	
	///////
	// Class constants (for internal use only):
	_classId: 319,
	// Method create = -1
	// Method destroy = 2
	// Method spliceVertexes = 3
	// Method vertex = 4
	
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
				
				default:
					NgLogE("Unknown instance method id " + cmdId + " in PolygonShape._commandRecvGen from command: " + cmd );
					return;
			}
		}
		else			// Static method.
		{
			switch( cmdId )
			{
				
				default:
					NgLogE("Unknown static method id " + cmdId + " in PolygonShape._commandRecvGen from command: " + cmd );
					return;
			}
		}
	}); if(typeof(PROC_DISPATCH_TABLE) === 'undefined') PROC_DISPATCH_TABLE = {}; PROC_DISPATCH_TABLE[319] = h; return h;})(),
	
	/////// Private recv methods.
	
	/////// Private send methods.
	
	/** @private */
	$_createSendGen: function( __objectRegistryId )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13fffff, [ +__objectRegistryId ] );
	},
	
	/** @private */
	_destroySendGen: function(  )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, []);
#endif*/
		Core.Proc.appendToCommandString( 0x13f0002, this );
	},
	
	/** @private */
	_spliceVertexesSendGen: function( start, len, vertexCount )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), Core.TypeCheck.Arg('integer'), ]);
#endif*/
		Core.Proc.appendToCommandString( 0x13f0003, this, [ +start, +len, +vertexCount ] );
	},
	
	/** @private */
	_vertexSendGen: function( x, y )
	{
/*#if TYPECHECK
        Core.TypeCheck.validateArgs(arguments, [Core.TypeCheck.Arg('number'), Core.TypeCheck.Arg('number'), ]);
#endif*/
		Core.Proc.appendSubcommandToCommandString( [ +x, +y ] );
	},
	
	// This class is expected to implement the following methods outside of
	// the generated block:
	// $create: function( __objectRegistryId ) {}
	
	// destroy: function(  ) {}
	
	// spliceVertexes: function( start, len, vertexCount ) {}
	
	// vertex: function( x, y ) {}
	
	
	0:0 // tame jslint/Closure Compiler for trailing comma.
// {{/Wg Generated Code}}

});
