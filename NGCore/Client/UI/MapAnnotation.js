var Element = require('./Element').Element;
var Commands = require('./Commands').Commands;

var MapAnnotation = exports.MapAnnotation = Element.subclass(
/** @lends UI.MapAnnotation.prototype */
{
	'type':'mapannotation',
	/**
	* @class <code>MapAnnotation</code>
	* @name UI.MapAnnotation
	* @augments Core.Class
	* @since 1.1.1.2
	*/
	initialize: function($super, properties) {
		return $super(properties);
	},

	setCalloutLeftView: function(view)
	{
		this._calloutLeftView = view;
		Commands.setCalloutLeftView.call(this, view.__objectRegistryId);
	},

	getCalloutLeftView: function()
	{
		return this._calloutLeftView;
	},

	setCalloutRightView: function(view)
	{
		this._calloutRightView = view;
		Commands.setCalloutRightView.call(this, view.__objectRegistryId);
	},

	getCalloutRightView: function()
	{
		return this._calloutRightView;
	},

	setView: function(view)
	{
		this._view = view;
		Commands.setView.call(this, view.__objectRegistryId);
	},

	getView: function()
	{
		return this._view;
	},

	setImage: function(image)
	{
		console.log("WARNING : MapAnnotation.setImage has been deprecated. Use MapAnnotation.setView instead.");
		var iV = new UI.Image();
		iV.setImage(image);
		iV.setFrame([0, 0, 40, 40]);
		this.setView(iV);
	},

	/**
	 * @private
	 */    
	performEventCallback: function($super, e) {
		$super(e);
	}
});

// Properties
(function() {

	MapAnnotation.synthesizeCompoundProperty('coordinate', Commands.setCoordinate);
	
	MapAnnotation.synthesizeCompoundProperty('centerOffset', Commands.setCenterOffset);
	
	MapAnnotation.synthesizeProperty('calloutTitle', Commands.setCalloutTitle);

	MapAnnotation.synthesizeProperty('calloutSubtitle', Commands.setCalloutSubtitle);
	
	MapAnnotation.synthesizeProperty('calloutEnabled', Commands.setCalloutEnabled);

	MapAnnotation.registerEventType('select');
	MapAnnotation.registerEventType('deselect');
})();
