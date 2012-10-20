//////////////////////////////////////////////////////////////////////////////
/** 
 *  @date:      April 13, 2011 
 *  @file:      ScreenConfigModule.js
 *  @author:    Chris Jimison
 *  Website:    http://www.ngmoco.com
 *  Copyright:  2010, by NGMOCO LLC
 *              Unauthorized redistribution of source code is 
 *              strictly prohibited. Violators will be prosecuted.
 * 
 *  @brief:
 */
//////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////
// Require Block

//////////////////////////////////////////////////////////////////////////////
// Globals

//////////////////////////////////////////////////////////////////////////////
/**
 * _ModuleScreenConfig:  This is the main module code that will get the init and destroy callbacks
 */
var _ModuleScreenConfig = 
{
    Init : function()
    {
        console.log("Screen Config Module started");
    },

    Destroy : function()
    {
        console.log("Screen Config Module stopped");
    }
};

var _defaultScreenConfig
{

};

exports.Register = function(map)
{
    // Build up the URL Map
    map.GET.ScreenConfig = _defaultScreenConfig;
    
    map.Modules.push(_ModuleScreenConfig);
};
