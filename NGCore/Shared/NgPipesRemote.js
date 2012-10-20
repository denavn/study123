var Network = require('../Client/Network').Network;

var ngPipesRequestNum = 0;

var NgPipesRemote = {
  listeners: [],
  debug: false,

  possibleStates: {
    unknown: {ngPipesRemote:"unknown"},
    finished: {ngPipesRemote:"finished"},
    error: {ngPipesRemote:"error"}
  }
};

NgPipesRemote.addListener = function(listner) {
  this.listeners.push(listner);
  return true;
};

NgPipesRemote.clearQueue = function(queue, callback) {

  if (!queue) {
    return false;
  }

  if (!this.getUrl()) {
    if (callback) {
      callback(NgPipesRemote.possibleStates.finished, []);
    }
    return false;
  }
	var copy_array = queue.slice(0, queue.length);

	var _j, _len2, data;
  while (copy_array && copy_array.length > 0) {
    var to_send = copy_array.slice(0, 10);
    copy_array = copy_array.slice(10);
    data = "";

    for (_j = 0, _len2 = to_send.length; _j < _len2; _j++) {
      data += JSON.stringify(to_send[_j]);
      if (_j+1 < _len2) {
         data += "\r\n";
      } //if len
    } //for

    if (data) {
      NgPipesRemote._makeRequest(data, to_send, callback);
    } //if data
  }//while

};

NgPipesRemote._makeRequest = function(json_data, objs, callback) {
    var request = new Network.XHR(), url = this.getUrl();
    if (this.debug) {
        NgPipesRemote._debugOutput(json_data);
    }

    ngPipesRequestNum++;
    var reqKey = 'pipe'+ngPipesRequestNum;

    var LifecycleEmitter = require('../Client/Device/LifecycleEmitter').LifecycleEmitter;
    LifecycleEmitter.requestEngineKeepAlive(reqKey);

    request.onreadystatechange = function() {
        var status = null;
        try {
            if (this.readyState === 4) {
                LifecycleEmitter.cancelEngineKeepAlive(reqKey);
                status = NgPipesRemote._handleResponse(request.responseText);
            } else {
                status = NgPipesRemote.possibleStates.unknown;
            }
        } catch (ex) {
            status = NgPipesRemote.possibleStates.error;
            NgLogException(ex);
        }

        if (callback) {
            callback(status, objs);
        }

        NgPipesRemote._notifyListeners(status);
        return true;
    };

    request.open("POST", url, true);

    request.setRequestHeader("X-Ngpipes-Api", "1.0");
    request.setRequestHeader("Content-Type", "application/json+batch");
    request.setRequestHeader("If-None-Match", "0");

    request.send(json_data);

    NgPipesRemote._notifyListeners('started');
    return true;
};

NgPipesRemote.setUrl = function(url) {
    this.url = url;
};
NgPipesRemote.getUrl = function() {
    if (this.url)
        return this.url;
    var Capabilities = require("../Client/Core/Capabilities").Capabilities;
    var url = null;
    
    if (Capabilities) {
      //Get the url from the configuration.json
      url = (Capabilities.getConfigs() || {} )["analyticsServer"] || null;
      if (url) {
        url = "https://"+url+"/pipes/r.2/bulk_record_stats";
        if (this.debug) {
          NgLogD("Pipes URL => " + url );
        }
      }
    }
    return url;
};


NgPipesRemote._handleResponse = function(respText) {
  var respObj, result;
  result = NgPipesRemote.possibleStates.unknown;
  if (respText && respText.length > 0) {
    try {
    respObj = JSON.parse(respText);
    } catch (e) {
      //Clean up after ourselves.
      respObj = null;
    }
	if (respObj  && (respObj.success !== null && respObj.success !== undefined ) && respObj.success) {
      if (this.debug) {
        NgLogD("[NgPipesRemote] Got Success" );
      }
      result = NgPipesRemote.possibleStates.finished;
    } else {
      result = NgPipesRemote.possibleStates.error;
    }
  } else {
      if (this.debug) {
        NgLogD('[NgPipesRemote] ERROR posting');
      }

    result = NgPipesRemote.possibleStates.error;
  }
  return result;
};

NgPipesRemote._debugOutput = function(str) {
  var _i, _len, _result, msg, msgs;
  msgs = str.split("\r\n");
  for (_i = 0, _len = msgs.length; _i < _len; _i++) {
    msg = msgs[_i];
    NgLogD("[NgPipesRemote] Message sent: " + msg);
  }
  return false;
};

NgPipesRemote._notifyListeners = function(state) {
  var _i, _len, _ref, l;
  for (_i = 0, _len = (_ref = this.listeners).length; _i < _len; _i++) {
    l = _ref[_i];
    l(state);
  }
  return true;
};

exports.NgPipesRemote = NgPipesRemote;
