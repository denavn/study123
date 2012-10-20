//////////////////////////////////////////////////////////////////////////////
/** 
 *  @date:     <DATE>
 *  @file:      <FILE_NAME>.js
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
var _ServerUptimeValue;

//////////////////////////////////////////////////////////////////////////////
/**
 * _ModulePing:  This is the main module code that will get the init and destroy callbacks
 */
var _ModulePing = 
{
    Init : function()
    {
        console.log("Ping Module started");
        _ServerUptimeValue = new Date;
    },

    Destroy : function()
    {
        console.log("Ping Module stopped");
    }
};

var _UpTime = function(req, res, URL)
{
    var now = new Date;
    var uptime = now.getTime() - _ServerUptimeValue.getTime();
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end('{"Time" : "' + uptime + '"}\n');
};

var _IsAlive = function(req, res, URL)
{
    // Hook up the time part to this...
    res.writeHead(200, {'Content-Type': 'application/json'});
    var now = new Date;
    
    res.end('{"alive" : "yes"}\n');
};

var _defaultPing = function(req, res, URL)
{
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end('{"message" : "I am easy Ping, but not THAT easy"}\n');
};

exports.Register = function(map)
{
    // Build up the URL Map
    map.GET.Ping = _defaultPing;
    map.GET.Ping.IsAlive = _IsAlive;
    map.GET.Ping.Time = _UpTime;
    
    map.Modules.push(_ModulePing);
};