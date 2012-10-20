var Router = require('./_Router').Router;
var GSGlobals = require('./GSGlobals');

//Generate 1 instance of our router now and treat as the global instance!
GSGlobals.setRouterInstance(new Router());