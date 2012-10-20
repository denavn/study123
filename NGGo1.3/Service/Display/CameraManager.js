////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Chris Jimison
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block
var ServerSync  = require('../../Service/Data/ServerSync').ServerSync;

var CameraManager = ServerSync.singleton(
/** @lends Service.Display.CameraManager.prototype */
{
    classname: "CameraManager",
    /**
     * Error code of <code>CameraManager</code> class.
     * @namespace error
     */
    error:
    {
        /** */
        ERROR_NONE : 0,
        /** */
        ERROR_ARGUMENTS : 1,
        /** */
        ERROR_JSON_PARSE : 2,
        /** */
        ERROR_JSON_FORMAT : 3,
        /** */
        ERROR_ASSET_NOT_FOUND : 4
    },
    /**
     * @class <code>CameraManager</code> handles all the tuning value types available for {@link Service.Display.Camera}.
     * @borrows Foundation.Observable#addObserver
     * @borrows Foundation.Observable#deleteObserver
     * @borrows Foundation.Observable#deleteObservers
     * @borrows Foundation.Observable#countObservers
     * @borrows Foundation.Observable#notify
     * @constructs This is singleton class.
     * @name Service.Display.CameraManager
     * @augments Core.Class
     */
    initialize : function()
    {
        this._tunables = {};
        this._loadDefaultTunableValues();
        this.setNotifyKey("onCameraTunablesUpdated");
    },
    /**
     * Returns the tunable set for a given key.
     *
     * @param {String} key Name to get the tunable set for.
     * @returns {Object} Camera Tunable values.
     */
    getTunableValuesForKey : function(key)
    {
        return this._tunables[key];
    },

    /** @private */
    __onLoadData : function(data)
    {
        for(key in data)
        {
            if(data.hasOwnProperty(key))
            {
                this._tunables[key] = data[key];
            }
        }
    },
    /** @private */
    _loadDefaultTunableValues : function()
    {
        // Setup the generic tunables table
        this._tunables.__generic = {};
        this._tunables.__generic.camera_zoom_in = 1.55;
        this._tunables.__generic.camera_zoom_out = 1.0;
        this._tunables.__generic.camera_double_tap_dist = 64;
        this._tunables.__generic.camera_double_tap_time = 400;
        this._tunables.__generic.camera_zoom_time = 0.3;
        this._tunables.__generic.camera_boarder_stretch_top = 0.1;
        this._tunables.__generic.camera_boarder_stretch_side = 0.1;
        this._tunables.__generic.camera_velocity_friction = 0.85;
        this._tunables.__generic.camera_delta_friction = 0.2;
        this._tunables.__generic.camera_snap_decay = 0.6;
        this._tunables.__generic.camera_max_velocity = 40;
        this._tunables.__generic.camera_friction = 0.875;
        this._tunables.__generic.camera_starting_zoom = 1.0;
        this._tunables.__generic.camera_soft_velocity_friction = 0.8;
        this._tunables.__generic.camera_soft_velocity_rebound_friction = 1.6;
    }
});

exports.CameraManager = CameraManager;
