/*
 * This class is ported based on DnGlobalTouchEmitter class of DnLib
 * 
 * @Purpose: To manage all touch events in game and make management of touch events easier
 * 
 */

var Core = require('../../NGCore/Client/Core').Core;
var GL2  = require('../../NGCore/Client/GL2').GL2;


exports.GlobalTouchEmitter = Core.MessageListener.subclass({
	
	//--------------------------------------------------------------------------
	initialize: function() {
		
		this.target = new GL2.TouchTarget();
		this.target.setAnchor( [0, 0] );
		this.target.setSize(
			Core.Capabilities.getScreenHeight(), //----- adapt to landscape
			Core.Capabilities.getScreenWidth()
		);
		this.target.getTouchEmitter().addListener( this, this.onTouch );
		this.target.setDepth( 65535 );
		
		this.node = new GL2.Node();
		this.node.addChild( this.target );
		GL2.Root.addChild( this.node );
		
		this.listeners = {};
		this.index = 0;
		this.isActivated = true;
	},
	
	//--------------------------------------------------------------------------
	destroy: function() {
		this.node.destroy();
	},
	
	//--------------------------------------------------------------------------
	activate:   function() { this.isActivated = true;  },
	deactivate: function() { this.isActivated = false; },
	
	//--------------------------------------------------------------------------
	addListener: function( object, touchTarget, handler, onFingerOutHandler ) {
		
		if (typeof( handler ) !== 'function') {
			NgLogD( "dn.GlobalTouchEmitter.addListener - handler is not function" );
			return false;
		}
		
		this.index++;
		var listener = {};
		listener.object  = object;
		listener.target  = touchTarget;
		listener.handler = handler;
		listener.hasHandled = false;
		listener.onFingerOutHandler = onFingerOutHandler;
		this.listeners[ this.index ] = listener;
		object.touchObserverIndex = this.index;
		
		//NgLogD( "add listener: " + this.index );
		return true;
	},
	
	//--------------------------------------------------------------------------
	removeListener: function( object ) {
		
		if (! object.touchObserverIndex) {
			NgLogD( "dn.GlobalTouchEmitter.removeListener - object is not registered" );
			return false;
		}
		
		delete this.listeners[ object.touchObserverIndex ];
		delete object.touchObserverIndex;
		//NgLogD( "remove listener: " + this.index );
		return true;
	},
	
	//--------------------------------------------------------------------------
	onTouch: function( touch ) {
		
		if (! this.isActivated) { return false; }
		
		//----- call listeners
		for (var i in this.listeners) {
			var listener = this.listeners[i];
			if (listener.target) {
				if (touch.getIsInside( listener.target )) {
					listener.handler.apply( listener.object, [touch] );
					listener.hasHandled = true;
				} else {
					if (listener.hasHandled) {
						listener.hasHandled = false;
						if (listener.onFingerOutHandler) {
							listener.onFingerOutHandler.apply( listener.object );
						}
					}
				}
			} else {
				listener.handler.apply( listener.object, [touch] );
			}
		}
		
		//----- return true to capture subsequent Move / End event.
		//----- In this case, lower priority handlers cannot capture the event.
		if (touch.getAction() === touch.Action.Start) {
			return true;
		}
		return false;
	}
	
});


