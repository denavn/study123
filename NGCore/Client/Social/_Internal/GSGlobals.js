/**
 * Annoyingly necessary file to break circular dependencies.
 */
var theRouter = null;
exports.setRouterInstance = function(router){
	theRouter = router;
};
exports.getRouterInstance = function(){
	return theRouter;
};
