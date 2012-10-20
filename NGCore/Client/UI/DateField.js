var EditText = require('./EditText').EditText;

function isValidDate(d) {
	if ( !d || !d.getTime )
		return false; 
		
	return !isNaN(d.getTime());
}

/*
 Date Parser code to handle WebKit's lack of following the implementation.
 http://stackoverflow.com/questions/3085937/safari-js-cannot-parse-yyyy-mm-dd-date-format/3085993#3085993
 */
function parseDate(input, format) {
  format = format || 'yyyy-mm-dd'; // default format
  var parts = input.match(/(\d+)/g), 
      i = 0, fmt = {};
  if (parts === null) { //Don't throw exceptions if the input isn't parsable
	return null;
  }
  // extract date-part indexes from the format
  format.replace(/(yyyy|dd|mm)/g, function(part) { fmt[part] = i++;});
  return new Date(parts[fmt['yyyy']], parts[fmt['mm']]-1, parts[fmt['dd']]);
}
/*
 * Our Code is not actually passing its format to parseDate (already had all the code to rejigger the date pieces to yyyy-mm-dd before I realized the problems with webkit's date constructor / date string parser). -fbartho 2010-11-30
 */

exports.DateField = EditText.subclass(
/** @lends UI.DateField.prototype */
{
	classname: "DateField",
	/**
	 * @class The `UI.DateField` class creates text entry fields for dates. The user's input is 
	 * normalized to a format specified by the application. By default, the date is normalized to
	 * the format `yyyy-mm-dd`, where `yyyy` is the four-digit year, `mm` is the two-digit month, 
	 * and `dd` is the two-digit day. 
	 * @name UI.DateField
	 * @augments UI.EditText
	 * @constructs Create a date field.
	 * @example
	 * // Create a new UI.DateField object without setting any of its properties.
	 * var dateField = new UI.DateField();
	 * @example
	 * // Create a new UI.DateField object, setting the date format and text color.
	 * var dateField = new UI.DateField({
	 *     dateFormat: "mm-dd-yyyy",
	 *     textColor: "CCCCCC"
	 * });
	 * @param {Object} [properties] An object whose properties will be added to the new
	 *		`UI.DateField` object. See `{@link UI.EditText}` for information about properties that
	 *		are supported.
	 * @since 1.0
	 */
	
	/** @ignore */
	initialize: function($super, properties) {
		var constructorRVal = $super(properties);
		this.setDateFormat("yyyy-mm-dd");
		this.ondatechange = function(newDate){};
		
		this.setInputType(EditText.InputTypes.Date);
		return constructorRVal;
	},
    
	/**
	 * Trigger an event callback for this `DateField`.
	 * @param {$super} $super This parameter is a reference to the base class implementation and is stripped out during execution. Do not supply it.
	 * @param {String} event The event that triggers a callback function.
	 * @private
	 * @status Javascript, iOS, Android, Flash
	 */
	performEventCallback: function($super, event) {
		try {
			if (event.eventType == 'change') {
				// Make Sure the Text is changed (call $super), before we call our listeners!
				var oldText = this.getText();
				$super(event);
				this.ondatechange(this.getDate());
			}
		} catch(e) {
			NgHandleException(e);
		}
	},
	_filterAndInsertDashes:function(oldText,newText) {
		var t = newText;
		if((oldText.length == t.length + 1) && oldText[oldText.length-1] == "-") {
			//This lets the user backspace through - marks as if they weren't there.
			// fbartho: Currently not in use! 2010-12-10
			//this.setText(t.substring(0,t.length-1));
			return t.substring(0,t.length-1);
		}
		
		var nt = "";
		var j = 0;
		for(var i = 0; i < t.length && nt.length < this.formatStr.length; i++,j++) {
			if(j < this.formatStr.length && this.formatStr[j] == "-" && i < t.length){
				if(t[i] == "-"|| t[i] == "/"){
					nt+="-";
					continue;
				}
				else {
					nt+="-";
					nt+=t[i];
					continue;
				}
			}
			if ( i < t.length && (t[i] == "-" || t[i] == "/") ) {
				--j; 
				continue;
			}
			nt+=t[i];
		}
		
		if(this.formatStr.length > j && (this.formatStr[j] == "-" || this.formatStr[j] == "/") ) {
			nt+="-";
		}
		
		return nt;
	},
	/**
	 * Normalize the format of the user's text input, converting forward slashes to dashes.
	 * @returns {void}
	 * @status Javascript, iOS, Android, Flash, Test
	 * @since 1.0
	 */    
	normalizeDateLayout:function() {
		var ot = this.getText();
		var nt = this._filterAndInsertDashes(this.getText(),this.getText());
		if(ot!=nt)this.setText(nt);
	},
	/**
	 * Retrieve the current date format that will be used to normalize the user's input.
	 * @returns {String} The current date format that will be used to normalize the user's input.
	 * @see UI.DateField#setDateFormat
	 * @status Javascript, iOS, Android, Flash, Test
	 * @since 1.0
	 */
	getDateFormat:function() {
		return this.formatStr;
	},
	/**
	 * Set the date format that will be used to normalize the user's input. Valid values include
	 * the following, where `mm` is the two-digit month, `dd` is the two-digit day, and `yyyy` is
	 * the four-digit year:
	 * 
	 * + `yyyy-mm-dd`
	 * + `mm-yyyy`
	 * + `yyyy-mm`
	 * + `mm-dd-yyyy`
	 * + `dd-mm-yyyy`
	 * @param {String} dateFormat The new date format that will be used to normalize the user's
	 *		input.
	 * @returns {void}
	 * @see UI.DateField#getDateFormat
	 * @status Javascript, iOS, Android, Flash, Test
	 * @since 1.0
	 */
	setDateFormat:function(fStr) 
	{
		if (   fStr != "yyyy-mm-dd"
			&& fStr != "mm-yyyy"
			&& fStr != "yyyy-mm"
			&& fStr != "mm-dd-yyyy"
			&& fStr != "dd-mm-yyyy" ) {
			// Invalid Format String Error Case
			NgLogD("Error: Invalid Format String set for Birthdate Field!!\n");
			
			return;
		}
		
		this.formatStr = fStr;
		this.setPlaceholder(this.formatStr);
		return;
	},
	/**
	 * Retrieve the user's input, normalized to the date field's current date format.
	 * @returns {String} The user's text input, normalized to the current date format for this
	 *		text field.
	 * @status Javascript, iOS, Android, Flash, Test
	 * @see UI.DateField#setDateFormat
	 * @since 1.0
	 */
	getDate:function() {
		return this._dateFromText(this._filterAndInsertDashes(this.getText(),this.getText()));
	}, 
	_dateFromText:function(text) 
	{
		var tmp = null;
		var t = text;
		var bits = null;
		var b2 = null;
		if ( this.formatStr == "dd-mm-yyyy" ) {
			bits = t.split("-");
			if(bits.length != 3 || bits[2].length != 4)
				return null;
			
			b2 = [];
			b2.push(bits.pop());
			b2.push(bits.pop());
			b2.push(bits.pop());
			tmp = parseDate(b2.join("-"));
		} else if ( this.formatStr == "mm-yyyy" ) {
			bits = t.split("-");
			if(bits.length != 2 || bits[1].length != 4)
				return null;
			
			b2 = [];
			b2.push(bits.pop());
			b2.push(bits.pop());
			b2.push("01");
			var tStr = b2.join("-");
			
			tmp = parseDate(tStr);
		} else if ( this.formatStr == "yyyy-mm" ) {
			bits = t.split("-");
			if(bits.length != 2 || bits[0].length != 4)
				return null;
			
			tmp = parseDate(t+"-01");
		} else if ( this.formatStr == "mm-dd-yyyy" ) {
			bits = t.split("-");
			if(bits.length != 3 || bits[2].length != 4)
				return null;
			
			b2 = [];
			b2.push(bits.pop());
			b2.push(bits.shift());
			b2.push(bits.shift());
			tmp = parseDate(b2.join("-"));
		} else {
			tmp = parseDate(t);
		}
		
		if(!isValidDate(tmp)) {
			NgLogD("Failed to parse date: "+text+"   -  "+tmp+"\n");
			return null;
		}
		return tmp;
	}
});

//TODO: make a proper DatePicker?
