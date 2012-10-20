var Capabilities = require('./Capabilities').Capabilities;
var MessageEmitter = require('./MessageEmitter').MessageEmitter;
var FileSystem = require('../Storage/FileSystem').FileSystem;

var LocalizationEngine = exports.LocalizationEngine = MessageEmitter.subclass(
/** @lends Core.Localization.prototype */
{
	classname: 'Localization',
    
    /**
     * Specifies the directory path to language files this object will load.
     */
    directoryPath:null,
    
    /**
     * Specifies the directory path to a language file for a specific language.
     */
	languageFilePath:null,
    
	/**
	 * @class The <code>Localization</code> class provides applications with access to localized strings.
	 * Applications supply a language code corresponding to a file in <code>Content/Localization/</code> or a JSON object.<br /><br /> 
     * Loading of dictionary files is an anynchronous process. Applications need to listen for emitted notifications from <code>Localization</code> objects that signal when the language dictionary
     * is modified. When a <code>Localization</code> object emits a notification, localized strings are available to the application (see <code>{@link Core.MessageEmitter#emit}</code>).
	 * @constructs The default constructor.
	 * @augments Core.MessageEmitter
	 * @status iOS, Android, Flash
	 * @since 1.0
	 */
	initialize: function(directoryPath)
	{
		if(!directoryPath){directoryPath = "./Content/Localization/";}
	    NgLogD("Localization : init ("+directoryPath+")");
	    this.directoryPath = directoryPath;
	    
        this.setLanguage(Capabilities.getLanguage());
	},
    
	/**
	 * Aynchronously load the localization dictionary for the specified language.
     * <br /><br />
	 * <b>Notes:</b> 
	 * <ul>
	 * <li>This function looks for the corresponding JSON dictionary file in the <code>Content/Localization</code> directory.
     * For example, <code>Content/Localization/fr.json</code>. If the application cannot load a dictionary, this call has no effect.</li>
     * <li><code>Localization</code> objects emit a notification with the new language string if this call succeeds.</li>
     *</ul>
	 *
	 * @example
	 * Core.Localization.addListener(listener, function()
     * {
     *     listener.label.setText(Core.Localization.getString("Hello World"));
     * });
	 * Core.Localization.setLanguage('es');
	 *
	 * @param {String} language The base name of a JSON dictionary file in <code>./Content/Language</code>.
	 * @see Core.Localization#setDictionary
	 * @see Core.MessageListener
	 * @returns {void}
	 * @status Flash, Test, FlashTested
	 * @since 1.0
	 */    
    setLanguage: function(language)
    {
        var dictionaryPath = this.languageFilePath = this.directoryPath + language + '.json';
        var self = this;
        NgLogD("Localization : reading json file "+ dictionaryPath);
        
        NgLogT("@@@ Localization.setLanguage readFile " + dictionaryPath + " +");
		FileSystem.readFile(dictionaryPath, {}, function(error, data)
        {
            NgLogT("@@@ Localization.setLanguage readFile " + dictionaryPath + " -");
            if(error === '')
            {
                NgLogD("Localization : successfully read json file "+ dictionaryPath);  
                self.setDictionary(language, JSON.parse(data));
            }
            else
            {
                NgLogD("Localization: unable to read json file "+ dictionaryPath + ", use default english setting instead");                
                self.setDictionary(language, null);
            }
        });
    },

	/**
	 * Directly set the language code and localization dictionary.
     * <code>Localization</code> objects emit a message with the new language string during this call.
	 * 
	 * @example
     * var chDictionary =    
     * {
     *     "Hello World": "&#20320;&#22909;&#19990;&#30028;"
     * };
	 * Core.Localization.setDictionary('ch', chDictionary);
	 * label.setText(Core.Localization.getString("Hello World"));
	 *
	 * @param {String} language A string identifying the specified language or localization.
	 * @param {Object} dictionary An object containing key/value pairs for the specified language.
	 * @see Core.Localization#setLanguage
	 * @see Core.MessageEmitter#emit
	 * @returns {void}
	 * @status Flash, Test, FlashTested
	 * @since 1.0
	 */    
    setDictionary: function(lang, dictionary)
    {
        this._lang = lang;
        this._dictionary = dictionary;
        this.emit(this._lang);
    },    
    
    /**
	 * Retrieve a localized string.
     * @param {String} str A localization key.
	 * @returns {String} The localized string or the provided key if the application is unable to lcoate the specified string.
	 * @status Flash, Test, FlashTested
	 * @since 1.0
	 */
	getString: function(str)
	{        
        if(this._dictionary && typeof this._dictionary === 'object')
        {
            var value = this._dictionary[str];
            if(value && typeof value !== 'undefined')
            {
                return value;
            }
        }
        
        return this.unknownString(str);
	},
	
	/** 
	  * @private
	  */
	unknownString:function(str){
		NgLogD("Localization: ... No localization for "+str+" in "+this._lang);
		return str;
	}
});

/**
 * Global Localization Singleton, gets initialized when the device locale is known.
 * @ignore
 */
exports.Localization = LocalizationEngine.singleton({});

