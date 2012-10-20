////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Chris Jimison
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 *              Unauthorized redistribution of source code is 
 *              strictly prohibited. Violators will be prosecuted.
 * 
 *  @brief:     
 */
////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
// Requires
var Class = require('../../../Foundation/Class').Class;
var Component = require('../Component').Component;
var UUID = require('../Component').UUID;

var XHR          = require('../../../../NGCore/Client/Network/XHR').XHR;
var NGGOError    = require('../../../Foundation/NGGOError').NGGOError;
var HTTPRequest  = require('../../../Service/Network/HTTPRequest').HTTPRequest;
var Observable   = require('../../../Foundation/Observable').Observable;

////////////////////////////////////////////////////////////////////////////////
// Class FlowFactory
exports.XHR = Component.subclass(
/** @lends Framework.FlowScript.XHR.prototype */
{
    classname : "XHR",
  
    inPorts : {
        SEND : 0
    },

    outPorts : {
        OUT : 0,
        ON_DATA_RECIEVED : 1,
        ON_ERROR_FILE_NOT_FOUND : 2,
        ON_ERROR_CONNECTION : 3
    },

    _onReceive : function(port, ip)
    {
        if(this._iip && this._iip.required && this._iip.required.server)
        {
            var url = this._iip.required.server;
            if(ip.serverURL)
            {
                url = this.serverURL;
            }

            if(this._iip.optional)
            {
                var first = true;
                for(var arg in this._iip.optional)
                {
                    if(first)
                    {
                        url +="?";
                    }
                    else
                    {
                        url +="&";
                    }
                    url += arg + "=" + this._iip.optional[arg];
                }
            }
            var req = new HTTPRequest();
            var self = this;
            req.adObserver({
                onSuccess: function(res)
                {
                    ip.active = res;
                    ip.networkResponse = res;
                    self.send(this.outPorts.ON_DATA_RECIEVED, ip); 
                },
                onFailure: function(res)
                {
                    if(res.statusCode === 404)
                    {
                        self.send(this.outPorts.ON_ERROR_FILE_NOT_FOUND, ip); 
                    }
                    else
                    {
                        self.send(this.outPorts.ON_ERROR_CONNECTION, ip); 
                    }
                }
            });
            req.get(url);
            this.send(this.outPorts.OUT, ip);
        }
    }
}); // end of class XHR

exports.XHR.factoryUUID = UUID.XHR;
