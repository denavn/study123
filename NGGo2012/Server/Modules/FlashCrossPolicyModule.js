//////////////////////////////////////////////////////////////////////////////
/** 
 *  @date:      April 13, 2011 
 *  @file:      FlashCrossPolicyModule.js
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
var net = require('net');

//////////////////////////////////////////////////////////////////////////////
// Globals
var _policyFile = '<?xml version="1.0"?> <!DOCTYPE cross-domain-policy SYSTEM "/xml/dtds/cross-domain-policy.dtd"> <cross-domain-policy> <site-control permitted-cross-domain-policies="master-only"/> <allow-access-from domain="*" to-ports="*" /></cross-domain-policy>'; 


//////////////////////////////////////////////////////////////////////////////
/**
 * _ModuleScreenConfig:  This is the main module code that will get the init and destroy callbacks
 */
var _ModuleScreenConfig = 
{
    Init : function()
    {
        console.log("Flash Cross Policy Module started");
        this.server = net.createServer(function (socket)
        {
            socket.write(_policyFile);
            socket.pipe(socket);
            socket.end();
        });
        this.server.listen(843);
    },

    Destroy : function()
    {
        console.log("Screen Config Module stopped");
        this.server.close();
    }
};

var _CrossPolicyFile = function(req, res, URL)
{
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(_policyFile);
};

exports.Register = function(map)
{
    // Build up the URL Map
    map.GET.CrossPolicyFile = _CrossPolicyFile;
    
    map.Modules.push(_ModuleScreenConfig);
};
