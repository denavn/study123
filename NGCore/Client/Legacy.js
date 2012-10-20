(function()
{
	if(!Function.prototype.hasOwnProperty('bind'))
	{
		var slice = Array.prototype.slice;
		Function.prototype.bind = function(context)
		{
			var func = this;
			if(arguments.length > 1)
			{
				var args = slice.call(arguments, 1);
				return function()
				{
					if(arguments.length)
					{
						var finalArgs = args.concat(slice.call(arguments));
						return func.apply(context, finalArgs);
					}
					else
					{
						return func.apply(context, args);
					}
				};
			}
			else
			{
				return function()
				{
					if(arguments.length)
						return func.apply(context, arguments);
					else
						return func.call(context);
				};
			}
		};
	}
})();

(function()
{
	if(!Array.prototype.hasOwnProperty('indexOf'))
	{
		Array.prototype.indexOf = function(obj)
		{
			var len = this.length;
			for(var i=0; i < this.length; ++i)
			{
				if(obj === this[i])
					return i;
			}
			return -1;
		};
	}
})();

function userGameInit()
{
	console.log("ngCore calling main()");
	main();
}
//////////////////////////////////////////////////////////////////////////////
/** 
 *  @date:      2010-11-0?
 *  @file:      NgWebEngine.js
 *  Website:    http://www.ngmoco.com/
 *  Copyright:  2010, by ngmoco:)
 *              Unauthorized redistribution of source code is 
 *              strictly prohibited. Violators will be prosecuted.
 * 
 *  @brief:
 */
//////////////////////////////////////////////////////////////////////////////
var NGSetTimeoutRunTimers = require('./UI/NGJSEnvironmentSupport').NGSetTimeoutRunTimers;
var SystemBinding = require('./UI/SystemBinding').SystemBinding;
var Downloader = require("././Network/DownloadManifest").Downloader;
var LocalGameList = require("././Core/LocalGameList").LocalGameList;
var Device = require('././Device').Device;
var Core = require('././Core').Core;
var Capabilities = require('././Core/Capabilities').Capabilities;
var Localization = require('././Core/Localization').Localization;

// Global until oauth does not depend on storage.
var Storage = require('././Storage').Storage;

//////////////////////////////////////////////////////////////////////////////////////////////////
// App switching.

var NgProcID =
{
    PersistProc: -1,
    GameProc: -2
};

//////////////////////////////////////////////////////////////////////////////////////////////////

/**
  * @private
  */

var gNgShutdownPending = false;


/////////////////////////////////////////////////////////////////////////////////////////////////
// Global data.
//////////////////////////////////////////////////////////////////////////////////////////////////

var gNgEngineEntities;
var gNgAddedEngineEntities;
var gNgRemovedEngineEntities;

var gNgUpdateEngineEntities;
var gNgTouchEngineEntities;
var gNgKeyPressEngineEntities;


//////////////////////////////////////////////////////////////////////////////////////////////////
// This function is called once by the html container to initialize the game.
//////////////////////////////////////////////////////////////////////////////////////////////////

/**
  * @private
  */

function NgEngineInitPrivate()
{
	NgLogInit();

	NgApplication.getInstance().restart();

	gNgEngineEntities = [];
	gNgAddedEngineEntities = [];
	gNgRemovedEngineEntities = [];

	gNgUpdateEngineEntities = [];
	gNgTouchEngineEntities = [];
    gNgKeyPressEngineEntities = [];
}

//////////////////////////////////////////////////////////////////////////////////////////////////

/**
  * @private
  */

function NgEngineProcessEntityAddRemove()
{
        var i, e;
	for(i in gNgAddedEngineEntities)
	{
		e = gNgAddedEngineEntities[i];
		if(e.mIsUpdatable) gNgUpdateEngineEntities[e.mId] = e;
	}
	gNgAddedEngineEntities = [];

	for(i in gNgRemovedEngineEntities)
	{
		e = gNgRemovedEngineEntities[i];

		if(e.mIsUpdatable) delete gNgUpdateEngineEntities[e.mId];
	}
	gNgRemovedEngineEntities = [];
}

/**
  * @private
  */

function NgHandleException(ex)
{
	if (Core.Proc.isPrivileged()) {
		NgLogException( ex );
	}
	else {
		NgLogException( ex );
		var exStr = JSON.stringify(ex);
		Core.LocalGameList._forwardException(exStr);
	}
}

function NgEngineInit(inputs)
{
	NgLogD("NgEngineInit beg");
	try
	{
		NgEngineInitPrivate();

		//NgLogD("Initializing Storage");
		//Storage.init();
		//NgLogD("Storage initialized");
		NgLogD("KeyValue Storage initializing...");
		Storage.KeyValueCache.init();
		NgLogD("KeyValue Storage initialized...");
	
		Core.Time.instantiate();
	
		NgLogD("Instantiate the Localization context (singleton), depends on Capabilities");
		Localization.instantiate();

	}
	catch( ex )
	{
		NgHandleException(ex);
	}
	NgLogD("NgEngineInit end");	
	
	return NgEngineUpdate(inputs);
}

function NgPreInit(inputs)
{
	NgLogD("Localization NgPreInit beg");
	return update(inputs);
}

/**
  * @private
  */

function NgGameInit(inputs)
{
	NgLogD("NgGameInit beg");

	Core.Analytics.instantiate();

	try
	{

		userGameInit();
	}
	catch( ex )
	{
		NgHandleException(ex);
	}
	NgLogD("NgGameInit end");

	return update(inputs);
}

/**
  * @private
  */

// TEMPORARY: Until native code is updated to call NgEngineUpdate.
function update ( inputs )
{
	return NgEngineUpdate ( inputs );
}

//Frame loop calls this every time, get the object out of require once ahead of time.
var NGSetTimeoutRunTimers = require("./UI/NGJSEnvironmentSupport").NGSetTimeoutRunTimers;

var setTimeoutOrig = setTimeout;
setTimeout  = function(fn, time)
{
	return setTimeoutOrig(function() 
	{
		try
		{
			fn();
		}
		catch( ex )
		{
			NgHandleException(ex);
		}
	}, time);
	
};


var setIntervalOrig = setInterval;
setInterval  = function(fn, time)
{
	return setIntervalOrig(function() 
	{
		try
		{
			fn();
		}
		catch( ex )
		{
			NgHandleException(ex);
		}
	}, time);
	
};



/**
  *	Main entry point for native to invoke JS.
  * @private
  */
var NgEngineUpdate = (function()
{
	var Core = require('././Core').Core;
	
return function ( inputs )
{
	// time causes a racehorse-sized leak in v8. Only use this for single profiling runs. DO NOT CHECK IN.
//	time.stop('frame');
//	time.start('frame');
	var i;
	try {
		NGSetTimeoutRunTimers();

		if (typeof inputs === "function")
		{
			inputs();
		}
		else if (inputs.length)
		{
			NgEngineProcessEntityAddRemove();
			var commands = inputs.split(':');
			for(i=0; i<commands.length; ++i)
			{
				var command = commands[i];

				// Make sure this isn't an empty input.
				if(0 === command.length) {
					continue;
				}

				switch(parseInt(command))
				{
					case NgEntityTypes.App:
						NgApplication.getInstance().handleCommand(command);
						break;
					case NgEntityTypes.NgFileSys:
						NgApplication.getInstance().getFileSys().handleCommand(command);
                        break;
					case NgEntityTypes.Storage:
						NgLogD("Command for storage is " + command);
						Storage.getInstanceForCommand(command).handleCommand(command);
						break;
					case NgEntityTypes.NgUI:
						var Window = require('././UI/Window').Window;
						Window.handleCommand(command);
						break;
					case NgEntityTypes.NgSystemBinding:
						SystemBinding.handleCommand(command);
						break;
					case 3117:
						console.log('got leet response');
						if(typeof(_WifiDiagCallback) != 'undefined')
							_WifiDiagCallback(command);
						break;
					default:
						Core.Proc._classRecvGen( command.split( ',' ) );
						break;
				}
			}
		}

		if( gNgShutdownPending )
		{
			gNgShutdownPending = false;
		}
		else	// Don't do updates if we're resetting.
		{
			NgEngineProcessEntityAddRemove();
			for(i in gNgUpdateEngineEntities)
			{
				var entity = gNgUpdateEngineEntities[i];
				if(!entity.mRegistered) continue;
				entity.onUpdate();
			}
		}
	}
	catch(ex)
	{
		NgHandleException(ex);
	}
		
	var commandsFromJS = Core.Proc.getCommandString() + NgFlushCommandsToString();
	Core.Proc.clearCommandString();

	return commandsFromJS;
};
})();


//////////////////////////////////////////////////////////////////////////////////////////////////
////	NgApplication class
//////////////////////////////////////////////////////////////////////////////////////////////////

var Capabilities = require('././Core/Capabilities').Capabilities;
var Logger = require('././Core/Logger').Logger;

/** @private */

var NgApplicationCommands = {
	Caps : 0,
	Debug : 1,
	FrameTime : 2,
	FrameRate : 3,
	Start : 4,
	DeviceOrientation: 10,
	SetOrientation: 11,
	BackPress: 12,
	OnBackPressed: 13,
	LaunchExternalNativeApp: 15,
	ExitSystemProcess: 16
};

/**
  * Enumeration values for orientation change events received by
  * {@link NgApplicationObserver}.
  */

var NgApplicationOrientation = {
	Portrait : 0,
	PortraitUpsideDown : 1,
	LandscapeLeft : 2,
	LandscapeRight : 3,
	FaceUp : 4,
	FaceDown : 5
};

/**
  * The NgApplication constructor is invoked during application bootstrap and
  * should not be created by the ngGame application.  Access to the application
  * object should be through the singleton accessor {@link NgApplication#getInstance}.
  * @constructor
  *
  * @class
  * The NgApplication class represents global state and services that are available to
  * ngGame applications.  This includes file system operations,
  * download services, etc.  The application class also manages a time source
  * that is synchronized between the native engine and the ngGame application. <br>
  * The application object is a singleton and should only be accessed through the
  * {@link NgApplication#getInstance} method.
  */

function NgApplication()
{
	/** @private */
	this.mFileSys = Storage.FileSystem;
	/** @private */
	this.mFrameTime = 0.0;
	/** @private */
	this.mObservers = [];
}

// Singleton instance.
/** @private */
NgApplication.sInstance = null;

/**
  * Acquire the singleton instance of the application class.
  * @type NgApplication
  * @return The global application object.
  */

NgApplication.getInstance = function()
{
	if( NgApplication.sInstance === null )
		NgApplication.sInstance = new NgApplication();

	return NgApplication.sInstance;
};

// APITODO: Switch these methods to be defined out-of-line, not by an object literal.

NgApplication.prototype =
{
	mFileSys : null,
	mObservers : [],
	mFrameTime : 0.0,
	
	/** @private */
	restart : function()
	{
	},
	
	/** @private */
	handleCommand : function(command)
	{
		//		NgLogD( "NgApplication command = " + command );

		var commandId = NgPeekCommandId( command );

		switch( commandId )
		{
			case NgApplicationCommands.FrameTime:
				this.parseFrameTime( command );
				break;
			case NgApplicationCommands.Start:
				this.onApplicationStart();
				break;
			case NgApplicationCommands.OnBackPressed:
				this.onApplicationBackPressed();
				break;
			default:
				NgLogE( "NgApplication command unknown: " + command);
				break;
		}
	},
	
	/**
	  * Acquire the file system object.
	  * @type NgFileSys
	  * @return The file system instance.
	  */
	getFileSys : function()
	{
		return this.mFileSys;
	},

	/** @private */
	ngLog : function( level, dbgStr )
	{
		NgPushCommand4( NgEntityTypes.App, NgApplicationCommands.Debug, Core.Base64.encode( dbgStr ), level );
	},
	
	/** @private */
	parseFrameTime : function( command )
	{
		var fields = NgParseCommand2(command,parseInt,parseFloat);
		var frameTime = fields[1];

		if(this.mFrameDelta === undefined)
			this.mFrameDelta = 0;
		else
			this.mFrameDelta = frameTime - this.mFrameTime;

		this.mFrameTime = frameTime;
	},
	
	/**
	  * Get the application time for the current frame.
	  * @type number
	  * @return The time in milliseconds.
	  */
	getFrameTime : function()
	{
		return this.mFrameTime;
	},
	
	/**
	  * Get the application time delta between the current frame and the last frame.
	  * @type number
	  * @return The time delta in milliseconds.
	  */
	getFrameDelta : function()
	{
		return this.mFrameDelta;
	},

	/**
	  * Set the desired application frame rate. <br>
	  * Note: The frame rate specification is not currently fully functional on all 
	  * platforms.
	  * @param {number} frameRate The desired frame rate in hz.
	  * @type void
	  */
	setFrameRate : function(frameRate)
	{
		NgPushCommand3( NgEntityTypes.App, NgApplicationCommands.FrameRate, frameRate);
	},

	/**
	  * Set the current device orientation for the application. <br>
	  * Note: Setting the orientation is not currently fully functional on all
	  * platforms.
	  * @param {NgApplicationOrientation} orientation The desired orientation.
	  * @type void
	  */
	setOrientation : function(orientation)
	{
		NgPushCommand3( NgEntityTypes.App, NgApplicationCommands.SetOrientation, orientation);
	},

	/**
	  * Register an application observer to receive application callbacks.
	  * @param {NgApplicationObserver} obs The observer to register.
	  * @type void
	  */
	registerObserver : function(obs)
	{
		obs.index = this.mObservers.push(obs);
	},

	unregisterObserver : function(obs)
	{
		if (obs.index)
			delete this.mObservers[obs.index - 1];
	},

	/** @private */
	onApplicationStart : function()
	{
		// NgUI.onLoad(); // it should be obsolete
		for (var i in this.mObservers)
		{
			// TODO is this even possible?
			this.mObservers[i].onApplicationStart();
		}
	},
	
	/** @private */
	onApplicationReceivedCustomMessage : function( message )
	{
		for (var i in this.mObservers)
		{
			this.mObservers[i].onApplicationReceivedCustomMessage( message );
		}
	},
	
	/** @private */
	onApplicationBackPressed : function()
	{
			var observerResult = false;
			for (var i in this.mObservers)
			{
				 if (this.mObservers[i].onApplicationBackPressed())
				 {
					observerResult = true;
					break;
				 }
			}
			if (!observerResult)
			{
				// back button was not fully handled. Ask the native application to handle it.
				NgPushCommand2(NgEntityTypes.App, NgApplicationCommands.BackPress);
			}
	},
	
	/** @private */
	exitSystemProcess : function ()
	{
		NgLogD ( "pushing exit command" );
		//This makes java exit the app through android lifecycle
		NgPushCommand2(NgEntityTypes.App, NgApplicationCommands.BackPress);
		NgLogD ( "pushed exit command" );
	}
};

// Observer base class for application events.

/**
  * Initialize a new application observer.
  * @constructor
  *
  * @class
  * The NgApplicationObserver class is used as the base class for any user-defined
  * class that receives application-level callbacks.  This currently includes
  * notifications on all application lifecycle events and device orientation
  * changes. <br>
  * Register the application observer by calling {@link NgApplication#registerObserver}.
  */

function NgApplicationObserver() {}

NgApplicationObserver.prototype =
{
	index: 0,
	/**
	  * Callback for application lifecycle start event.
	  * @type void
	  */
	onApplicationStart:function() {},

	/** @private */
	onApplicationReceivedCustomMessage:function( message ) {},

	/**
	  * Callback for device orientation change events.
	  * @param {NgApplicationOrientation} orientation Orientation enumeration value.
	  * @type void
	  */
	onApplicationDeviceOrientation:function( orientation ) {},

	/*
	 * Listener for when the user pushes the HW back button. Currently Android only.
	 *
	 * @return boolean true if back was handled entirely (eat the event), 
	 * false if it was not
	 *
	 */
	onApplicationBackPressed:function()
	{
		return false;
	}
};

//////////////////////////////////////////////////////////////////////////////////////////////////
// class Entity
// Base class for other entity types.
//////////////////////////////////////////////////////////////////////////////////////////////////

// ObjectTypes
// Defined in
//		JS:  NgEntityTypes in NgWebEngine.js and
//		C++: EntityCommandIds in GameView.h
// 1 = App
// 2 = NgTouchEvent
// 3 = NgKeyPressEvent
// 4 = Accel
// 5 = NgTextInputBox2D
// 6 = Animation (completion events)
// 7 = Sound (completion events)
// 8 = EngineEntity
// 9 = DrawableEntity2D
// 10 = NgCanvas2D
// 11 = NgCamera2D
// 12 = NgSprite2D
// 13 = NgText2D
// 14 = NgWebView2D
// 15 = NgAudioManager
// 16 = NgGroup2D
// 100 = LoadApp

// App Commands
// in:
// capabilities = 0, command dictionary format
// frameTime = 2, double
// out:
// NgLogD = 1, string

// NgTouchEvent Commands
// non-native
//	action: 1 = add, 2 = remove, 3 = modify
//	id: touch instance ID
//	x: x position
//	y: y position
// native
//	action: 4 = add, 5 = remove, 6 = modify
//	id: touch instance ID
//	x: x pos
//	y: y pos
//  eid: entity instance ID
//	lx: local x pos
//  ly: local y pos

// NgKeyPressEvent Commands
// action: 1 = down, 2 = up
// id: instance ID
// value: key value

// InputText Box Commands

// Animation
// in:
// only one kind of event, so first value is id of sprite to callback.

// Sound
// in:
//

// Accel Commands
// out:
// SetEventRate = 0, rate (hz)
// in:
// x, y, z position (floats)

// EngineEntity commands

// DrawableEntity2D commands:
// SetNativeTouchType=1,id,value (None=1, Enable = 2, EnableBounds = 3)

// NgCanvas2D Commands
// NewNgCanvas2D=1, id
// DeleteNgCanvas2D=2, id
// Update=3, id, args... not used currently
// SetRoot=4, id, grp id
// ClearRoot=5, id
// EnableNativePicking=6, id, bool

// NgCamera2D Commands
// NewNgCamera2D=1,		id, canvasId, porperties
// DeleteNgCamera2D=2,	id
// UpdateNgCamera2D=3,	id, properties
//	Properties: vx, vy, vz, vh, vw, cx, cy, ch, cw

// NgSprite2D Commands
// NewNgSprite2D=1,		id, canvasId, texture, properties
// DeleteNgSprite2D=2,	id
// UpdateNgSprite2D=3,	id, properties
//   Properties: x, y, z, w, h, r, a

// NgText2D Operations
// NewNgText2D=1		id, canvasId, properties
// DeleteNgText2D=2	id
// UpdateNgText2D=3	id, properties
//  Properties: x, y, z, w, h, justify, text

// NgGroup2D Operations
// New = 1			id, canvasId, [properties/todo]
// Delete = 2		id
// Update = 3		id, [properties/todo]
// Child = 4		id, subcmd, [child id]
//						subcmd 0 = add, 1 = rem, 2 = remAll (no child id)
// Rot = 5			id, anglef
// Pos = 6			id, xf, yf, zf
// Alpha = 7		id, alphaf
// Scale = 8		id, xf, yf

// APITODO: Clean up these identifiers.
// APITODO: Sound is probably not used any more.
// APITODO: Animation is probably not used any more.

var NgEntityTypes = {
	App : 1,
	NgTouchEvent : 2,
	NgKeyPressEvent : 3,
	Accel : 4,
	NgTextInputBox2D : 5,
	Animation : 6,
	Sound : 7,
	NgEngineEntity : 8,
	NgDrawableEntity2D : 9,
	NgCanvas2D : 10,
	NgCamera2D : 11,
	NgSprite2D : 12,
	NgText2D : 13,
	NgWebView2D : 14,
	NgGroup2D : 16,
	NgPhysics2D: 17,
	NgPrimitive2D: 18,
	NgFileSys: 19,
	Gyro : 22,
	NgUI : 23,
	Storage: 24,
	NgSystemBinding: 25,
	NgCustomMessage : 50,
	LoadApp : 100
};

var NgEngineEntityCommandIDs = {
	SetNativeTouchType : 1
};

/**
 * Initializes instance to default values. <br>
 * mId member defaults to 0 but can be set by application before calling {@link NgEngineEntity#register}.
 * @constructor
 *
 * @class
 * NgEngineEntity is the base class for all game entities, such as NgSprite2D and NgText2D. <br>
 * This class introduces key callback functions for touch, key press and per-frame update
 * notification. <br>
 * Additionally, the class introduces a register/unregister mechanism
 * for controlling the existence of the entity in the native game engine.
 *
 */

function NgEngineEntity()
{
	/** The entity id.  Used by the native engine for identification.  @type number */
	this.mId = 0;
	/** The touch priority.  Touches are routed first to the highest priority entities.  @type number */
	this.mTouchPriority = 0;
	/** The key press priority.  Key presses are routed first to the highest priority entities.  @type number */
	this.mKeyPressPriority = 0;
	/** @private */
	this.mIsTouchable = false;
	/** @private */
	this.mIsKeyable = false;
	/** @private */
	this.mIsUpdatable = false;
	/** @private */
	this.mNativeTouchType = NgEngineEntity.NativeTouchType.Enable;
	/** @private */
	this.mRegistered = false;
}

// Static methods and data.

/**
  * NgEngineEntity touch policy enumeration. <br>
  * Used with {@link NgEngineEntity#setNativeTouchType} and {@link NgCanvas2D#enableNativePicking}. <br>
  * Values: <br>
  * None : Disables native touches for this entity (and its children). <br>
  * Enable : Enables this entity to receive touches (or visits child entities) <br>
  * EnableBounds : Enables this entity to receive touches on its axis-aligned bounding box.  If
  * a touch is received on a group, it will report the touch and _not_ visit the group's children.
  */

NgEngineEntity.NativeTouchType = {
	None : 0,
	Enable : 1,
	EnableBounds : 2
};

/**
  * @private
  */

NgEngineEntity.engineCurrentId = 1;

/**
  * Allocate a unique ID for an entity.
  * @return ID value.
  * @type number
  * @private
  */

NgEngineEntity.newEngineId = function ()
{
	return NgEngineEntity.engineCurrentId++;
};

/**
  * Reclaim an entity ID.
  * @private
  */

NgEngineEntity.deleteEngineId = function ()
{
	// Nothing.
};

// Instance methods.

// Basic entity callbacks.

/** @private */

NgEngineEntity.prototype.newEntity = function() {};

/** @private */

NgEngineEntity.prototype.deleteEntity = function() {};

/**
  *	Callback for standard touch events. <br>
  * Standard touch events correspond to all touches
  * within the game view.  For each touch on the game view, all registered touchable
  * entities will receive the event.  Application logic must perform filtering to determine
  * if a particular entity corresponds to the touch event. <br>
  * Refer to {@link NgEngineEntity#toggleTouchable} for control of an entity's touchable state.
  * @param {NgTouchEvent} touch The touch event.
  * @return The application can return true to indicate that it has consumed this event or false
  * to allow other entities to continue processing this event.
  * @type bool
  */

NgEngineEntity.prototype.onTouch = function(touch)
{
	return false;
};

/**
  * Callback for native touch events. <br>
  * Native touch events are pre-filtered by the game engine
  * to correspond to a specific touchable entity.  For each touch on the game view, the game
  * engine will determine which game entities are selected by the touch event.  Only the 
  * selected entities will receive the onNativeTouch event callback. <br>
  * Native touch capability is not affected by touchable state of the entity determined by
  * {@link NgEngineEntity#toggleTouchable}.  Refer to {@link NgEngineEntity#setNativeTouchType} 
  * for management of an entity's native touch policy.
  * @param {NgNativeTouchEvent} touch The touch event.
  * @return The application can return true to indicate that it has consumed this event or false
  * to allow other entities to continue processing this event.
  * @type bool
  */

NgEngineEntity.prototype.onNativeTouch = function(touch)
{

};

/**
  * Callback for keyboard events. <br>These events correspond to physical or software keyboard events. <br>
  * Enable/disable key press events for an entity with {@link NgEngineEntity#toggleKeyable}.
  * @param {NgKeyPressEvent} keyPress The key press event.
  * @return The application can return true to indicate that it has consumed this event or false
  * to allow other entities to continue processing this event.
  * @type bool
  */

NgEngineEntity.prototype.onKeyPress = function(keyPress)
{
	return false;
};

/**
  *	Callback for update events. <br>Per-frame entity logic should be implemented in this callback. <br>
  * Enable/disable update events for an entity with {@link NgEngineEntity#toggleUpdatable}.
  * The return value of this method is ignored.
  * @type void
  */

NgEngineEntity.prototype.onUpdate = function()
{
};

/**
  *	Register this entity instance with the native game engine. <br>
  * The initialization sequence of engine entities has specific constraints: <br>
  * After construction and before calling
  * the register method, class methods that affect the native engine state cannot be called.  
  * During this period, changes to entity state by changing instance variables will be
  * sent to the native engine on the call to register. <br>
  * After register is called, 
  * changes to instance variables will be ignored.  During this phase, the only
  * way to affect native engine state is through methods that push commands to
  * the native side.
  * @type void
  */

NgEngineEntity.prototype.register = function()
{
	this.mParents = [];

	if( this.mId >= 0 )
	{
		this.mId = NgEngineEntity.newEngineId();
	}

	this.mRegistered = true;
	gNgEngineEntities[this.mId] = this;
	gNgAddedEngineEntities[this.mId] = this;
	this.newEntity();
};

/**
  * Unregister this entity from the native game engine.
  * @type void
  */

NgEngineEntity.prototype.unregister = function()
{
	var parents = this.mParents.concat([]);

	for (var i in parents)
	{
		NgLogD ( "Removing child " + this.mId + " from parent Group " + parents[i].mId + " because the Entity was unregistered");
		parents[i].removeChild( this );
	}

	this.mRegistered = false;
	delete gNgEngineEntities[this.mId];
	// CAUTION : DO NOT SPLICE gNgEngineEntities EVER.
	//gNgEngineEntities.splice(this.mId,1);

	gNgRemovedEngineEntities[this.mId] = this;
	this.deleteEntity();

	if(this.mId >= 0)
		NgEngineEntity.deleteEngineId(this.mId);
};

/**
  * Enable/disable update callbacks for this entity. <br>
  * This method flips the enable state
  * for update events. <br>
  * In order to receive update callbacks, an entity
  * must override the onUpdate event and enable updatable state by calling this 
  * method. <br>
  * The default state is false.
  * @type void
  */

NgEngineEntity.prototype.toggleUpdatable = function()
{
	if(this.mIsUpdatable)
	{
		delete gNgUpdateEngineEntities[this.mId];
	}
	else
	{
		gNgUpdateEngineEntities[this.mId] = this;
	}
	this.mIsUpdatable = !this.mIsUpdatable;
};

/**
  * Set native touch traversal policy. <br>
  * This method controls how the native game engine
  * traverses the game scene graph. <br>
  * The policies are described in further detail with {@link NgEngineEntity#NativeTouchType}. <br>
  * The default state is "Enable".
  * @param {NativeTouchType} type The policy enum for native touch processing.
  * @type void
  */

NgEngineEntity.prototype.setNativeTouchType = function( type )
{
	this.mNativeTouchType = type;
	NgPushCommand4(NgEntityTypes.NgDrawableEntity2D, NgEngineEntityCommandIDs.SetNativeTouchType, this.mId, this.mNativeTouchType );
};
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////
var Core = require('././Core').Core;

// These methods handle all composition for commands being sent back to the
// native engine.

/**
  * @private
  */

var gNgCommandStrings = [];

/**
  * @private
  */

var gNgCommandString = '';

// 0 deferred string composition via user loop
// 1 deferred string composition via internal loop
// 2 on-the-fly string composition.

// TODO: Benchmark all variation on all platforms.  Choose appropriate one(s)
// and prune code for others.

// UPDATE: ALL variations on contructing a string performed IDENTICALLY in
// the iPhone's UIWebView.  Unbelievable.

/**
  * @private
  */

var gNgCommandMode = 2;

/**
  * @private
  */

function NgQueueCommandText(command)
{
	switch(gNgCommandMode)
	{
		case 0:
		case 1:
			gNgCommandStrings.push( command );
			break;
		case 2:
			gNgCommandString += command;
			break;
	}
}

/**
  * @private
  */

function NgFlushCommandsToString()
{
	var outputString = '';
	
	switch(gNgCommandMode)
	{	
		case 0:
			for( var num = 0, end = gNgCommandStrings.length; num < end; ++num )
			{
				outputString += gNgCommandStrings[ num ];
			}
			break;
			
		case 1:
			outputString = String.prototype.concat.apply(gNgCommandStrings);
			break;
	}
	
	switch(gNgCommandMode)
	{
		case 0:
		case 1:
			gNgCommandStrings = [];
			break;
		case 2:
			outputString = gNgCommandString;
			gNgCommandString = '';
			break;
	}
	
	return outputString;	
}

//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

function NgParseString(txt)
{
	return txt;
}

/**
  * @private
  */

function NgParseBase64(txt)
{
	if( txt )
		return Core.Base64.decode(txt);
	else
		return "";
}

/**
  * @private
  */

function NgParseBool(txt)
{
	return parseInt(txt) ? true : false;
}

function NgParseInt(txt)
{
	return parseInt(txt, 10);
}

function NgKVArrayToCmd(kvArray)
{
	var out = "";
	var count = 0;
	for (var s in kvArray)
	{
		var value = kvArray[s];
		
		out += "," + s + "," + Core.Base64.encode(value);
		++count;
	}
	return count + out;
}
//////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Submit a command with 1 argument to the native engine.
 * @private
 */
function NgPushCommand1(arg1)
{
	gNgCommandString += ":" + arg1;
}

/**
 * Submit a command with 2 arguments to the native engine.
 * @private
 */
function NgPushCommand2(arg1, arg2)
{
	gNgCommandString += ":" + arg1 + "," + arg2;
}

/**
 * Submit a command with 3 arguments to the native engine.
 * @private
 */
function NgPushCommand3(arg1, arg2, arg3)
{
	gNgCommandString += ":" + arg1 + "," + arg2 + "," + arg3;
}

/**
 * Submit a command with 4 arguments to the native engine.
 * @private
 */
function NgPushCommand4(arg1, arg2, arg3, arg4)
{
	gNgCommandString += ":" + arg1 + "," + arg2 + "," + arg3 + "," + arg4;
}

/**
 * Submit a command with 5 arguments to the native engine.
 * @private
 */
function NgPushCommand5(arg1, arg2, arg3, arg4, arg5)
{
	gNgCommandString += ":" + arg1 + "," + arg2 + "," + arg3 + "," + arg4 + "," + arg5;
}

/**
 * Submit a command with 6 arguments to the native engine.
 * @private
 */
function NgPushCommand6(arg1, arg2, arg3, arg4, arg5, arg6)
{
	gNgCommandString += ":" + arg1 + "," + arg2 + "," + arg3 + "," + arg4 + "," + arg5 + "," + arg6;
}

/**
 * Submit a command with 7 arguments to the native engine.
 * @private
 */
function NgPushCommand7(arg1, arg2, arg3, arg4, arg5, arg6, arg7)
{
	gNgCommandString += ":" + arg1 + "," + arg2 + "," + arg3 + "," + arg4 + "," + arg5 + "," + arg6 + "," + arg7;
}

/**
 * Submit a command with 8 arguments to the native engine.
 * @private
 */
function NgPushCommand8(arg1, arg2, arg3, arg4, arg5, arg6, arg7,arg8)
{
	gNgCommandString += ":" + arg1 + "," + arg2 + "," + arg3 + "," + arg4 + "," + arg5 + "," + arg6 + "," + arg7 + "," + arg8;
}

/**
 * Submit a command with 8 arguments to the native engine.
 * @private
 */
function NgPushCommand9(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9)
{
	gNgCommandString += ":" + arg1 + "," + arg2 + "," + arg3 + "," + arg4 + "," + arg5 + "," + arg6 + "," + arg7 + "," + arg8 + "," + arg9;
}

/**
 * Submit a command with n arguments to the native engine.
 * @private
 */
function NgPushCommandN()
{
	var argv = arguments;
	var argc = argv.length;
	
	var tmp = ":";
	
	if( argc > 0 )
	{
		tmp += argv[ 0 ];
		
		for( var num = 1; num < argc; ++num )
		{
			tmp += "," + argv[ num ];
		}
	}
	
	gNgCommandString += tmp;
}

/**
 * Peek at the command ID in a command string.  This helps avoid 
 * splitting the string twice in a number of cases.
 * @return Command id or null if parsing failed.
 * @private
 */

function NgPeekCommandId(str)
{
	var vals = str.split ( ",", 2 );
	if( vals.length == 2 )
		return parseInt ( vals[ 1 ] );
	else
		return null;
}

/**
 * Peek at the class and command ID in a command string.  This helps avoid 
 * splitting the string twice in a number of cases.
 * @return Two-element array of ids or null if parsing failed.
 * @private
 */

function NgPeekClassAndCommandId(str)
{
	var vals = str.split ( ",", 2 );
	if( vals.length == 2 )
	{
		vals[ 0 ] = parseInt ( vals[ 0 ] );
		vals[ 1 ] = parseInt ( vals[ 1 ] );
		return vals;
	}
	else
		return null;
}


/**
 * Parse an incoming command string to individual strings.
 * @return an array of fields in serialization order.
 * @private
 */
function NgParseCommandToStrings(src)
{
	return src.split(",");
}

/**
  * @private
  */

function NgParseCommand1(src, func1)
{
	var ret = [];
	
	var fields = src.split(",");
	
	ret[ 0 ] = func1( fields[ 1 ] );
	
	return ret;
}

/**
  * @private
  */

function NgParseCommand2(src, func1, func2)
{
	var ret = [];
	
	var fields = src.split(",");
	
	ret[ 0 ] = func1( fields[ 1 ] );
	ret[ 1 ] = func2( fields[ 2 ] );
	
	return ret;
}

/**
  * @private
  */

function NgParseCommand3(src, func1, func2, func3)
{
	var ret = [];
	
	var fields = src.split(",");
	
	ret[ 0 ] = func1( fields[ 1 ] );
	ret[ 1 ] = func2( fields[ 2 ] );
	ret[ 2 ] = func3( fields[ 3 ] );
	
	return ret;
}

/**
  * @private
  */

function NgParseCommand4(src, func1, func2, func3, func4)
{
	var ret = [];
	
	var fields = src.split(",");
	
	ret[ 0 ] = func1( fields[ 1 ] );
	ret[ 1 ] = func2( fields[ 2 ] );
	ret[ 2 ] = func3( fields[ 3 ] );
	ret[ 3 ] = func4( fields[ 4 ] );
	
	return ret;
}

/**
  * @private
  */

function NgParseCommand5(src, func1, func2, func3, func4, func5)
{
	var ret = [];
	
	var fields = src.split(",");
	
	ret[ 0 ] = func1( fields[ 1 ] );
	ret[ 1 ] = func2( fields[ 2 ] );
	ret[ 2 ] = func3( fields[ 3 ] );
	ret[ 3 ] = func4( fields[ 4 ] );
	ret[ 4 ] = func5( fields[ 5 ] );
	
	return ret;
}


/**
 * Parse an incoming command string to typed values based on passed-in functions.
 * ex: NgParseCommandN("1:1,1.0,ACFHENA==",parseInt, parseFloat, NgParseString);
 * NOTE: The first item is assumed to be the command type, and will be
 * discarded in the output.  I.e., the output starts with the second src element.
 * @return an array of parsed fields in serialization order.
 * @private
 */

function NgParseCommandN(src)
{
	var ret = [];
	
	var argv = arguments;
	var argc = argv.length;
	
	var fields = src.split(",");
	for( var num = 1; num < argc; ++num )
	{
		ret[ num - 1 ] = argv[ num ]( fields[ num ] );
	}
	
	return ret;
}

/**
 * Parse an incoming typed dictionary.  The format of the dictionary is:
 * type,field name,value,type,field name,value[...]
 * Parsed values will be asigned to the field name in the dst array/object.
 * NOTE: Strings passed in this format must not have embedded commas (use
 * base64 encoding if arbitrary strings are being used.
 * @arg src The source command string.
 * @arg srcStart The field index to start parsing dictionary entries from.
 * @arg dst The destination object/array for parsed values.
 * @arg initialFields Optionally store the fields before srcStart in the passed-in array.
 * @return true if all fields were successfully parsed.
 * @private
 */

function NgParseCommandDictionary(src,srcStart,dst,initialFields)
{
	var ret = true;
	var fields = src.split(",");
	var end = fields.length;
	var num;

	if(initialFields)
	{
		for( num = 0; num < srcStart; ++num )
		{
			initialFields[ num ] = fields[ num ];
		}
	}
	
	for( num = srcStart; num < end; )
	{
		var type = fields[ num++ ];
		var name = fields[ num++ ];
		var val = fields[ num++ ];
		var good = true;
		
		switch(type)
		{
			case 'i':	// int
				val = parseInt( val );
				break;
			case 'f':	// float
				val = parseFloat( val );
				break;
			case 's':	// string
				break;
			case 'S':	// base64 string
				val = Core.Base64.decode(val);
				break;
			case 'b':	// bool
				val = parseInt(val) ? true : false;
				break;
			default:
				//				NgLogD("NgParseCommandDictionary unknown type for " + type + " " + name + " " + val);
				ret = false;
				good = false;
				break;
		}
		
		if( good )
		{
			dst[ name ] = val;
			
			// TEMP PRW
			NgLogD( "dict: " + name + " : " + dst[ name ] );
		}
		else
		{
			NgLogD("dict: could not process " + type );
		}
	}
	
	return ret;
}
var Capabilities = require('././Core/Capabilities').Capabilities;
var FileSystem   = require('././Storage/FileSystem').FileSystem;

/**
  * @private
  */

var gNgTrace=null;

//////////////////////////////////////////////////////////////////////////////////////////////////
// Logging functions.
//////////////////////////////////////////////////////////////////////////////////////////////////

/**
  * @private
  */
var NgDebugModes = {
	BrowserTrace : {},
	NgCommand : {},
	NgCommandDocLoc : {}
};

/**
  * @private
  */
var NgLogLevel = {
	Verbose : 5,
	Debug : 4,
	Info : 3,
	Warning : 2,
	Error : 1
};

/**
  * @private
  */
var NgLogStr = [ '', 'e', 'w', 'i', 'd', 'v'];


/**
  * @private
  */

// TEMP... this is not how we want to do this long-term.
function NgSetDebugDefaultDestination()
{
	if (typeof navigator == 'undefined')
	{
		return NgDebugModes.NgCommand;
	}

	var agent=navigator.userAgent.toLowerCase();
	if( ! ( (agent.indexOf('iphone') >=0) || (agent.indexOf('ipad') >= 0) ) )
	{
		return NgDebugModes.BrowserTrace;
	}
	else
	{
		return NgDebugModes.NgCommand;
	}
}

/**
  * @private
  */

var gNgDebugMode = NgSetDebugDefaultDestination();

/**
  * @private
  */

function NgLogInit()
{
	if( gNgDebugMode == NgDebugModes.BrowserTrace )
	{
		gNgTrace = document.getElementById("trace");
	}

	// Other modes don't need initialization.
}

var NgDoVerboseLog = function ( msg ) {
	NgLog(NgLogLevel.Verbose, msg);
};

var NgDoDebugLog = function ( msg ) {
	NgLog(NgLogLevel.Debug, msg);
};

var NgDoInfoLog = function ( msg ) {
	NgLog(NgLogLevel.Info, msg);
};

var NgDoWarningLog = function ( msg ) {
	NgLog(NgLogLevel.Warning, msg);
};

var NgDoErrorLog = function ( msg ) {
	NgLog(NgLogLevel.Error, msg);
};

var NgDoTimingLog = function ( msg ) {
	timingLog(msg);
};

var NgNoLog = function() {};

// defaults
var NgLogV = NgDoVerboseLog;
var NgLogD = NgDoDebugLog;
var NgLogI = NgDoInfoLog;
var NgLogW = NgDoWarningLog;
var NgLogE = NgDoErrorLog;
var NgLogT = NgDoTimingLog;

function NgLogSetLevel(level)
{
	switch( level )
	{
		case NgLogLevel.Debug:
			NgLogV = NgNoLog;
			NgLogD = NgDoDebugLog;
			NgLogI = NgDoInfoLog;
			NgLogW = NgDoWarningLog;
			NgLogE = NgDoErrorLog;
            NgLogT = NgDoTimingLog;
			break;

		case NgLogLevel.Info:
			NgLogV = NgNoLog;
			NgLogD = NgNoLog;
			NgLogI = NgDoInfoLog;
			NgLogW = NgDoWarningLog;
			NgLogE = NgDoErrorLog;
            NgLogT = NgDoTimingLog;
			break;

		case NgLogLevel.Warning:
			NgLogV = NgNoLog;
			NgLogD = NgNoLog;
			NgLogI = NgNoLog;
			NgLogW = NgDoWarningLog;
			NgLogE = NgDoErrorLog;
            NgLogT = NgDoTimingLog;
			break;

		case NgLogLevel.Error:
			NgLogV = NgNoLog;
			NgLogD = NgNoLog;
			NgLogI = NgNoLog;
			NgLogW = NgNoLog;
			NgLogE = NgDoErrorLog;
            NgLogT = NgDoTimingLog;
			break;

		default:
		case NgLogLevel.Verbose:
			NgLogV = NgDoVerboseLog;
			NgLogD = NgDoDebugLog;
			NgLogI = NgDoInfoLog;
			NgLogW = NgDoWarningLog;
			NgLogE = NgDoErrorLog;
            NgLogT = NgDoTimingLog;
			break;
	}
}

NgLogSetLevel(NgLogLevel.Verbose);

var useConsole = ((typeof console != 'undefined') && (typeof console.log == 'function'));

function NgLog( level, msg )
{
	console.log(NgLogStr[level] + ": " + msg);
}
function _exceptionNameDemangleHelper(ex,key){
	try {
		var filename = exception_demangle_require(ex[key]);
		return filename;
	} catch(e){
		//Don't cause exceptions when we're already logging an exception!
	}
	return "";
}
var NgLogException = (function() {
    function ignoreLines(data, lines, start)
    {
        var pos = start;
        var ignoredLines = 0;
        while (ignoredLines < lines) {
            pos = data.indexOf("\n", pos);
            if (pos < 0) {
                break;
            }

            ++pos;
            ++ignoredLines;
        }

        return {
            nextPosition: pos,
            ignoredLines: ignoredLines
        };
    }

		var sourceCodeReadError = function(ex, cb, msg) {
			NgLogV(msg);
			return cb(ex);
		};

    var dumpSourceCodeAroundException =
        function(ex, cb, relFilePath, absFilePath, functionName, lineNumber)
    {
        relFilePath =  relFilePath  || '';
        absFilePath =  absFilePath  || '';
        functionName = functionName || '';
        lineNumber =   +(lineNumber || 0);

		if (parseInt(lineNumber, 10) <= 1) {
			// line breaks may have been removed, do not show source code (this will result in entire code base being printed)
			NgLogV('Line breaks in source may have been removed, source dump not shown');
			return cb(ex);
		}

        if (absFilePath === '' ||  relFilePath === '' || lineNumber <= 0) {
            var msg = 'source dump error: ' +
                      "Could not read '" + absFilePath + "' " +
                      'at ' + lineNumber +
                      "\n";
            return sourceCodeReadError(ex, cb, msg);
        }

        FileSystem.readFile(relFilePath, { binary: false }, function(error, data) {
            if (error) {
                return sourceCodeReadError(ex, cb, 'source dump error: ' + error + "\n");
            }

            var BEFORE_AFTER_LINES = 8;

            var expectBeforeLineNumber = Math.max(lineNumber - BEFORE_AFTER_LINES, 1);
            var beforeRes = ignoreLines(data, expectBeforeLineNumber - 1, 0);
            var beforeLineNumber = beforeRes.ignoredLines + 1;

            if (beforeLineNumber !== expectBeforeLineNumber) {
                var msg = "source dump error: " +
                          "Could not read '" + absFilePath + "' " +
                          'until ' + lineNumber +
                          "\n";
                return sourceCodeReadError(ex, cb, msg);
            }

            var LINE_SIZE = 50;
            var DECORATOR = new Array(50).join('*');

            var totalLines = (lineNumber - beforeLineNumber) + 1 + BEFORE_AFTER_LINES;
            var dumpedSource = ''.concat(
                DECORATOR + "\n",
                'File: ' + absFilePath + "\n",
                functionName ? 'Function: ' + functionName + "\n" : '',
                'Line: ' + lineNumber + "\n",
                "\n"
            );

            var pos = beforeRes.nextPosition;

            for (var i = 0; i < totalLines; ++i) {
                var currLineNumber = beforeLineNumber + i;
                var newlinePos = data.indexOf("\n", pos);
                var currLine =
                    data.substring(pos, newlinePos >= 0 ? newlinePos : data.length);

                dumpedSource = dumpedSource.concat(
                    currLineNumber,
                    currLineNumber === lineNumber ? '> ' : ': ',
                    currLine,
                    "\n"
                );

                if (newlinePos === -1) {
                    break;
                }

                pos = newlinePos + 1;
            }

            dumpedSource += DECORATOR + "\n";

            cb(ex, dumpedSource);
        });
    };

    function dumpForSpiderMonkey(ex, cb)
    {
      var stackTrace = ex.stack || '';
      var matchRes = /^([^\(\s]*)\(.*\)@([^:]*\/([^\/]+\.[^\.:]*)):(\d+)$/m.exec(stackTrace);

      ex.stackWithParams = ex.stack;
      ex.stack = ex.toString() + '\n' + ex.stack.replace(/([^\(\s]*)\(.*\)@([^:]*\/([^\/]+\.[^\.:]*)):(\d+)/g, '\t at $1 ($2:$4)');

      if (matchRes) {
        return dumpSourceCodeAroundException(ex, cb, matchRes[3], matchRes[2], matchRes[1], matchRes[4]);
      } else {
				return cb(ex);
      }
    }

    function dumpForUIWebView(ex, cb)
    {
        var sourceURL = ex.sourceURL || '';

        var jsExtension = '.js';
        var jsEndPos = sourceURL.lastIndexOf(jsExtension);

        if (jsEndPos < 0) {
					return cb(ex);
        }

        jsEndPos = jsEndPos + jsExtension.length;

        var dirSeparator = '/';
        var lastDirPos = sourceURL.lastIndexOf(dirSeparator, jsEndPos);
        var jsStartPos = lastDirPos < 0 ? 0 : lastDirPos + dirSeparator.length;

        var relFilePath = sourceURL.substring(jsStartPos, jsEndPos);
        var absFilePath = sourceURL.substring(0, jsEndPos);

        return dumpSourceCodeAroundException(ex, cb, relFilePath, absFilePath, ex.sourceURL, ex.line);
    }

    function dumpForV8(ex, cb)
    {
        var stackTrace = ex.stack || '';
        var matchRes = /^\s*at\s+([^\(\/]*)\s?\(?([^:]*\/([^\/]+\.js)):(\d+):\d+\)?\s*$/m.exec(stackTrace);

        if (matchRes) {
            return dumpSourceCodeAroundException(ex, cb, matchRes[3], matchRes[2], matchRes[1], matchRes[4]);
        } else {
					return cb(ex); 
        }
    }

    function dumpForFlash(ex, cb)
    {
        var stackTrace = ex.stack || '';
        var matchRes = /^\s*at\s+([^\(\/]*)\s?\(?([^\?]*\/([^\/]+\.js)\?h=[^:]*):(\d+):\d+\)?\s*$/m.exec(stackTrace);

        if (matchRes) {
          return dumpSourceCodeAroundException(ex, cb, matchRes[3], matchRes[2], matchRes[1], matchRes[4]);
        } else {
					return cb(ex);
        }
    }

		function applyStackLevel(ex)
		{
			var stacklevel = ex.stacklevel;
			if (ex.stack && stacklevel && stacklevel > 0) {
				var spiderMatch = /^[^\(\s]*\(.*\)@[^:]*\/[^\/]+\.[^\.:]*:\d+$/;
				var v8Match = /^\s*at\s+[^\(\/]*\s?\(?[^:]*\/[^\/]+\.js:\d+:\d+\)?\s*$/;
				var lines = ex.stack.split('\n');
				for (var i=0, l=lines.length; i<l; ++i) {
					var line = lines[i];
					if ((line.match(spiderMatch) || line.match(v8Match)) && (i + stacklevel) < l) {
						lines.splice(i, stacklevel);
						ex.stack = lines.join('\n');
						break;
					}
				}
			}
		}

		function NgLogExceptionCallback( ex, dumpedSource )
		{
			var exception;
			if (!ex) {
				exception = "NgLogException called with nil exception.\n";
				ex = {toString:function(){
					return exception;
				}};
			} else if (ex.stack) {
				exception = ex.stack;
				if (exception.charAt(exception.length-1) !== '\n') {
					exception += '\n';
				}
			} else {
        exception = ex.toString() + '\n[NO STACK TRACE AVAILABLE]\n';
      }
      // Add exception description/stack trace
			var str = '';
			var handleExceptionStr = '';
			var stackTrace = "\n\nEXCEPTION: " + exception;
			if (Capabilities.getPlatformOS().match(/android/i)) {
				// logcat in Android has a characer limit for each entry so print the exception in two parts: 1) stacktrace and 2) code snippet/properties
				NgLogE(stackTrace);
				handleExceptionStr += stackTrace;
				str += '\n';
			} else {
				// print both the stacktrace and code snippet/properties in one part
				str += stackTrace;
			}

      // Add file info and code snippet
      for (var key in ['sourceFile', 'sourceURL', 'fileName']) {
        if (ex[key]) {
          str += _exceptionNameDemangleHelper(ex, key) + "\n";
          break;
        }
      }
      if (ex.relatedFile) {
        str += "\trelated to file: "+_exceptionNameDemangleHelper(ex,"relatedFile") + "\n";
      }
      str += dumpedSource || '';

      // Add exception properties and values
      for( var prop in ex ) {
        if (prop !== 'stack') {
          str += "PROPERTY: "+ prop+ " VALUE: ["+ ex[prop]+ "]\n";
        }
      }
			str += '\n';

			NgLogE( str );
			handleExceptionStr += str;

      if (! Core.Proc.isPrivileged()) {
        var ErrorEmitter = require('././Core/ErrorEmitter').ErrorEmitter;
        ErrorEmitter._handleUncaughtException(handleExceptionStr);
      }
    }

    return function( ex )
    {
        var os = Capabilities.getPlatformOS();
        var sourceDumper = function( ex, cb ) { cb(ex, ''); };

				applyStackLevel(ex);

        if (os.match(/iphone/i)) {
            if (ex.stack) {
              sourceDumper = dumpForSpiderMonkey;
            } else {
              // UIWebView errors don't have stacktraces
              sourceDumper = dumpForUIWebView;
            }
        } else if (os.match(/android/i)) {
            sourceDumper = dumpForV8;
        } else if (os.match(/flash/i)) {
            sourceDumper = dumpForFlash;
        }

        sourceDumper(ex, NgLogExceptionCallback);
    };
})();
