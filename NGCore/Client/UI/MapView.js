var AbstractView = require('./AbstractView').AbstractView;
var Commands = require('./Commands').Commands;
var MapAnnotation = require('./MapAnnotation').MapAnnotation;

var MapView = exports.MapView = AbstractView.subclass(
/** @lends UI.MapView.prototype */
{
	'type':'mapview',
	/**
	* @class <code>MapView</code>
	* @name UI.MapView
	* @augments UI.View
	* @since 1.1.1.2
	*/
	initialize: function($super, properties) {
		this._annotations = [];
		this._region = [];
		return $super(properties);
	},
	
	getCenterCoordinate: function()
	{
		return [this._region[0], this._region[1]];
	},
    
    setCenterCoordinate: function(lat, lon, animated)
    {
        this._region[0] = lat;
        this._region[1] = lon;
        if (!this._region[2])
            this._region[2] = 0.05;
        if (!this._region[3])
            this._region[3] = 0.05;            
        this.setRegion(this._region[0], this._region[1], this._region[2], this._region[3], animated);
    },
	
	getCoordinateSpan: function()
	{
		return [this._region[2], this._region[3]];
	},	
	
	selectAnnotation: function(annotation)
	{
		if (annotation instanceof MapAnnotation) {
			var index = this._annotations.indexOf(annotation);
			if (index != -1) {
				Commands.selectAnnotation.call(this, annotation.__objectRegistryId);
				return;
			}
		}
		Commands.selectAnnotation.call(this, -1);
	},
	
	addAnnotation: function(annotation)
	{
		if (annotation instanceof MapAnnotation) {
			this._annotations.push(annotation);
			
			Commands.addAnnotation.call(this, annotation.__objectRegistryId);
			
		} else throw {message: this.type + ".addAnnotation: " + annotation + " is not a MapAnnotation!"};
		return this;
	},
	
	removeAnnotation: function(annotation)
	{
		if (annotation instanceof MapAnnotation) {
			// Remove this node from parent's child list
			var index = this._annotations.indexOf(annotation);
			if (index != -1) {
				this._annotations.splice(index, 1);
			}
			
			// Remove from the parent at the system level
			Commands.removeAnnotation.call(this, annotation.__objectRegistryId);
		} else throw {message: this.type + ".removeAnnotation: " + annotation + " is not a MapAnnotation!"};
		return annotation;
	},
	
	/**
	 * @private
	 */    
	updateRegionFits: function(lat, lon ,latD , lonD) {
		//console.log(lat + " " + lon + " " + latD + " " + lonD);
		//console.log(this._region[0] + " " + this._region[1] + " " + this._region[2] + " " + this._region[3]);
		this._region[0] = lat;
		this._region[1] = lon;
		this._region[2] = latD;
		this._region[3] = lonD;
	},
	
	/**
	 * @private
	 */    
	performEventCallback: function($super, e) {
		if (e.eventType == 'regionchange') this.updateRegionFits(e.latitude, e.longitude , e.latitudeDelta , e.longitudeDelta);
		$super(e);
	}
});

// Properties
(function() {
	MapView.synthesizeProperty('scrollable', Commands.setScrollable);
	
	MapView.synthesizeProperty('zoomable', Commands.setZoomable);
	
	MapView.synthesizeCompoundProperty('region', Commands.setRegion);
	
	MapView.registerEventType('regionchange');
})();
