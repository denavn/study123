////////////////////////////////////////////////////////////////////////////////
// Class Diagnostics
// UI diagnostic emitter; collects info from UI subsystem.
//
// Copyright (C) 2012 ngmoco:) inc.  All rights reserved.
//
////////////////////////////////////////////////////////////////////////////////

var Core = require('../Core').Core;

////////////////////////////////////////////////////////////////////////////////
    
//
// Create and export a DiagnosticEmitter for UI.  
//

exports.Diagnostics = Core.DiagnosticEmitter.singleton(
{
    classname: 'UI_Diagnostics',

    /**
     * @class the <code>UI.Diagnostics</code> class constructs a singleton object
     * to obtain detailed UI diagnostic information from.
     *
     * The emitter currently emits an object of the form:
     * 
     <code>
        {
	    "name":"UI",                      // Emitter name, 'UI'				          
	}  
     </code>
     * @since 1.7.5
     */
    initialize: function($super) 
    {
	$super('UI');
    }

});

