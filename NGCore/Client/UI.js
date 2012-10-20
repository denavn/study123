var UILoader = function(map) {
	// Internal function to define isolated-scope getters.
	var loadFn = function(object, key, fn) {
		return function() {
			delete object[key];
			return object[key] = fn.call(this);
		};
	};

	for (var key in map) {
		if (typeof map[key] == 'function') {
			this.__defineGetter__(key, loadFn(this, key, map[key]));
		} else {
			this[key] = map[key];
		}
	}
};

/**
 * @name UI
 * @namespace Provide user interface components such as buttons, text fields, and web views.
 * @description
 * The `UI` module provides access to user interface (UI) components. You can use the `UI` module's
 * classes to create all of the following types of UI components:
 *
 * + Alert dialogs (`{@link UI.AlertDialog}`)
 * + Checkboxes (`{@link UI.CheckBox}`)
 * + Date fields (`{@link UI.DateField}`)
 * + Images (`{@link UI.Image}`)
 * + Progress bars (`{@link UI.ProgressBar}`)
 * + Progress dialogs (`{@link UI.ProgressDialog}`)
 * + Progress indicators (`{@link UI.Spinner}`)
 * + Rectangles that help to position UI components (`{@link UI.ViewGeometry}`,
 * `{@link UI.ViewGeometry.Rect}`, `{@link UI.ViewGeometry.Scale}`)
 * + Scrolling lists (`{@link UI.ListView}`, `{@link UI.ListViewItem}`,
 * `{@link UI.ListViewSection}`, `{@link UI.ScrollView}`)
 * + Table cells (`{@link UI.CellView}`)
 * + Temporary messages (`{@link UI.Toast}`)
 * + Text fields, single-line and multi-line (`{@link UI.EditText}`, `{@link UI.EditTextArea}`)
 * + Text labels (`{@link UI.Label}`)
 * + Web views (`{@link UI.WebView}`)
 *
 * The `UI` module also provides the `{@link UI.View}` class, which enables you to group UI
 * components into views. You can then use the `{@link UI.NavController}` class to navigate between
 * views based on user input. In addition, you can use the `{@link UI.Style}` class to create a set
 * of style properties that can be reused by multiple UI components.
 *
 * Finally, the `UI` module provides several static functions that enable you to:
 *
 * + Animate changes to a `UI` object's properties (`{@link UI.animate}`)
 * + Capture a screenshot from the device (`{@link UI.takeScreenshot}`)
 * + Choose a photo from the user's camera roll, or take a new photo using the device's camera
 * (`{@link UI.choosePhoto}`, `{@link UI.choosePhotoCamera}`)
 * + Combine multiple images into a single file (`{@link UI.compositeImages}`)
 * + Measure the dimensions of a text string (`{@link UI.measureText}`)
 *
 * ## UI and GL2 Modules ##
 * The `UI` module includes the `{@link UI.GLView}` class, which provides applications with access
 * to OpenGL. Applications should not attempt to display `UI` and `GL2` objects at the same time,
 * with the sole exception of `{@link UI.GLView}` objects. Displaying other `UI` objects at the same
 * time as `GL2` objects can result in poor performance.
 * 
 * If your application needs to combine UI components and other graphics on the same screen, 
 * consider using the ngGo toolkit. Its `GLUI` module reimplements the `UI` module in OpenGL, 
 * enabling you to combine UI components with other graphics. Although `GLUI` does not support all
 * of the `UI` module's styling options, it offers enough flexibility for many applications.  You
 * can download ngGo from the Downloads section on the
 * [Mobage Developer Portal](https://developer.mobage.com/).
 *
 * ## Handling Events ##
 * Classes in the `UI` module are event-driven. For example, each instance of a `UI` class can fire
 * events when the user makes a selection, or when the UI component appears or disappears. Your
 * application processes these events by defining a callback function for each one. The callback
 * function can then take an action such as processing the user's input, destroying the UI
 * component, or moving to a different view.
 *
 * To determine which events a component supports, review the Events section of the class'
 * documentation. The documentation also explains which parameters are passed to the callback
 * function for each type of event.
 *
 * **Note**: An event will not fire unless you define a callback function to handle the event.
 *
 * ## Styling UI Components ##
 * Each UI component supports a variety of style properties that manage the component's contents and
 * appearance. For example, you can use these style properties to add fills, borders, and rounded 
 * corners to a UI component, or to add images and text to a component.
 * 
 * To determine which style properties a component supports, review the getter and setter methods 
 * the component's class. For example, the `{@link UI.Toast}` class provides one setter method,
 * `{@link UI.Toast#setText}`, which provides access to the style property `text`.
 *
 * **Note**: If you need to access a large number of style properties at once, you can streamline
 * your code by using the component's `setAttributes()` and `getAttributes()` methods, which are
 * inherited from `{@link UI.AbstractView}`. In addition, you can set an object's style properties
 * when you instantiate the object, avoiding the need for separate method calls.
 *
 * ## Managing View States ##
 * The `UI` module defines a collection of view states, which you can use to manage the appearance
 * of UI components based on their state. For example, you can define different styles for a
 * `{@link UI.CheckBox}` object based on whether it is disabled, checked, or pressed. You can also
 * define styles for a component that is in multiple states at once, such as a `{@link UI.CheckBox}`
 * object that is both pressed and checked. In addition, you can define custom view states for your
 * application. See `{@link UI.Commands#State}` for details about the view states that are
 * supported.
 * 
 * There are several ways to specify unique style properties for a specific view state:
 * 
 * 1. Call the setter method for each property, and include the `flags` parameter to define which
 * view states will use the specified style.
 * 2. Define style properties for multiple view states when you instantiate the UI component.
 * To define a style property for a view state, add the name of the view state to the beginning of 
 * the property name, and capitalize the property name. For example, to specify an image border for
 * a UI component that has focus, pass the `focusedImageBorder` property to the constructor. This 
 * approach is supported only for the `normal`, `focused`, `selected`, `pressed`, and `disabled` 
 * view states. To specify a style property for a custom view state, or for a component that is in
 * multiple states, you must use the component's setter methods.
 * 3. Define style properties for multiple view states when you create a `{@link UI.Style}` object.
 * You can define a style property for a view state as described above.
 * 
 * ## Reusing Style Properties for Multiple Objects ##
 * If your application will use the same appearance for multiple objects, create a
 * `{@link UI.Style}` object that defines the style properties for those objects. You can then call
 * the objects' `setStyle()` and `getStyle()` methods to manage the objects' styles, or you can pass
 * the `UI.Style` object in the `style` property of the object's constructor. By using `UI.Style`
 * objects, you reduce the amount of communication between JavaScript and native code, which can 
 * significantly improve your application's performance.
 *
 * In some cases, your application may include two UI components whose style differs only slightly.
 * You can assign a single `UI.Style` object to both of these components, then override the
 * `UI.Style` object's style properties by applying style properties directly to the UI component.
 */

UILoader.prototype = {
/** @lends UI.prototype */

	/**
	 * Animate changes to the `alpha`, `frame`, and `scrollPosition` properties of one or more UI
	 * components. This method also animates the addition and removal of child views.
	 *
	 * To animate a set of changes, you must define a function that actually changes the properties.
	 * You then pass this function to `UI.animate()` in the `action` parameter.
	 *
	 * **Note**: If a UI component is currently being animated, do not animate additional changes to
	 * the component's properties.
	 * @name UI.animate
	 * @function
	 * @static
	 * @example
	 * // Fade in a string of text.
	 * var textProperties = {
	 *     alpha: 0.0,
	 *     text: "Sample text",
	 *     textSize: 24,
	 *     textColor: "000000",
	 *     textFont: "Arial"
	 * };
	 * var label = new UI.Label(textProperties);
	 * var windowSize = [Device.LayoutEmitter.getWidth(),
	 *   Device.LayoutEmitter.getHeight()];
	 * var textDimensions = UI.measureText(textProperties.text, windowSize[0],
	 *   windowSize[1], textProperties.textFont, textProperties.textSize, 
	 *   function(dimensions) {
	 *     // Center the label within the window.
	 *     var xOrigin = (windowSize[0] / 2) - (dimensions.width / 2);
	 *     var yOrigin = (windowSize[1] / 2) - (dimensions.height / 2);
	 *     label.setFrame([xOrigin, yOrigin, dimensions.width, dimensions.height]);
	 *     // Add the label to UI.Window.document.
	 *     UI.Window.document.addChild(label);
	 *     // Animate the change to the label's alpha property, fading the label in
	 *     // over 2 seconds.
	 *     UI.animate(function() {
	 *         label.setAlpha(1.0);
	 *     }, 2000, function(event) {
	 *         console.log("It is " + event.canceled + " that the animation was " +
	 *           "canceled.");
	 *     });
	 * });
	 * @param {Function} action A function that sets the property or properties to be animated.
	 *		This function can change the properties of any number of UI components.
	 * @param {Number} duration The time over which to animate the changes, in milliseconds.
	 * @cb {Function} onCompletion The function to call after the animation ends.
	 * @cb-param {Object} event Information about the event.
	 * @cb-param {Boolean} event.canceled Set to `true` if the animation was canceled.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.0
	 */
    animate: function() { return this.Commands.animate.apply(this,Array.prototype.slice.call(arguments)); },

    /**
	 * Combine multiple images into a single image, and write the single image to the device's
	 * file system.
	 * 
	 * By default, the image is saved in PNG format. To use JPEG format, specify a filename with the
	 * extension .jpg.
	 * @name UI.compositeImages
	 * @function
	 * @static
	 * @example
	 * // Replace the right side of an existing 200 x 200 pixel image, and save
	 * // the new image file to the device's storage.
	 * var filename = "example.png";
	 * var images = [
	 *     {
	 *         image: "./Content/background.png",
	 *         rect: [0, 0, 200, 200]
	 *     },
	 *     {
	 *         image: "./Content/new-right-side.png",
	 *         rect: [100, 0, 100, 100]
	 *     }
	 * ];
	 * UI.compositeImages(200, 200, filename, images, function(data) {
	 *     if (data.error) {
	 *         console.log("Unable to create composite image: " + data.error);
	 *     } else {
	 *         // Update the filename.
	 *         filename = data.filename;
	 *     }
	 * });
	 * @param {Number} w The width, in pixels, of the new image.
	 * @param {Number} h The height, in pixels, of the new image.
	 * @param {String} filename The preferred filename for the new image. Use the extension .jpg to
	 *		save the file in JPEG format. By default, the file is saved in PNG format. **Note**: The
	 *		file may be saved using a different name. Use the callback function to identify the 
	 *		file's actual name.
	 * @param {Object[]} infoArray An array of objects that identify the images to be composited.
	 * @param {UI.Commands#FitMode} [infoArray[].fit=UI.Commands.FitMode.Inside] The image fit mode
	 *		to use when scaling the existing image.
	 * @param {Number[]|UI.ViewGeometry#Gravity} [infoArray[].gravity=[0.5, 0.5]] The image gravity
	 *		to use when placing the existing image within the new image. See
	 *		`{@link UI.Image#setImageGravity}` for more details about this property.
	 * @param {String} infoArray[].image A filename for an existing image to include in the
	 *		composite image.
	 * @param {Number[]} [infoArray[].insets=[0, 0, 0, 0]] The insets that will be used to clip the
	 *		edges of the image. Specified as an array of four floats, starting with the top inset
	 *		and going clockwise around the image.
	 * @param {Number[]} [infoArray[].rect] An array of integers that specify a rectangle where the 
	 *		existing image will be placed in the composite image. (By default, this method uses a
	 *		rectangle that is the same size as the new image.) The array contains the following four
	 *		values, in this order:
	 *
	 * 1. The X origin at which to place the top left corner of the existing image.
	 * 2. The Y origin at which to place the top left corner of the existing image.
	 * 3. The width, in pixels, of the image rectangle.
	 * 4. The height, in pixels, of the image rectangle.
	 * @param {Number[]} [infoArray[].transform] The affine transformation to apply to the existing
	 *		image. See `{@link UI.Image#setImageTransform}` for more information about affine
	 *		transformations. Specified as an array of six floats: `[a, b, c, d, tx, ty]`.
	 * @cb {Function} callback The function to call after creating the composite image.
	 * @cb-param {Object} data Information about the composite image.
	 * @cb-param {String} [data.error] A description of the error, if any.
	 * @cb-param {String} [data.filename] The filename for the composite image. **Note**: This value
	 *		may differ from the value that was sent in the `filename` parameter.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.1.1.2
	 */
    compositeImages: function(w, h, filename, infoArray, callback) {
        var cb = this.Commands.registerTemporaryCallback(callback);
        if (cb) {
			this.Commands.doCompositeImages(w, h, filename, infoArray, cb);
		}
    },

    /**
     * Display a full-screen interface for selecting an existing image from the device's camera
	 * roll, and write the selected image to the device's file system. You can retrieve the image
	 * at its original size, or you can rescale the image to fit within a width and height you
	 * specify.
	 *
	 * By default, the image is saved in PNG format. To use JPEG format, specify a filename with the
	 * extension .jpg.
	 * @name UI.choosePhoto
	 * @function
	 * @static
	 * @example
	 * // Retrieve an image that has been scaled to fit within a 100 x 200 rectangle.
	 * var filename = "example.png";
	 * var view = new UI.View();
	 * UI.choosePhoto(100, 200, filename, {}, function(data) {
	 *     if (data.error) {
	 *         // The user probably canceled instead of choosing an image.
	 *         console.log("Unable to select an image: " + data.error);
	 *     } else {
	 *         // Update the filename.
	 *         filename = data.filename;
	 *     }
	 * }, view);
	 * @param {Number} targetWide The width, in pixels, to use for scaling the image. Use 0 to
	 *		retrieve an unscaled image.
	 * @param {Number} targetHigh The height, in pixels, to use for scaling the image. Use 0 to
	 *		retrieve an unscaled image.
	 * @param {String} filename The preferred filename for the new image. Use the extension .jpg to
	 *		save the file in JPEG format. By default, the file is saved in PNG format. **Note**: The
	 *		file may be saved using a different name. Use the callback function to identify the 
	 *		file's actual name.
	 * @param {Object} options Options for retrieving the image.
	 * @param {UI.Commands#FitMode} [options.fit=UI.Commands.FitMode.Inside] The image fit mode to
	 *		use when scaling the existing image.
	 * @param {Number[]|UI.ViewGeometry#Gravity} [options.gravity=[0.5, 0.5]] The image gravity to
	 *		use when placing the existing image within the retrieved image. See
	 *		`{@link UI.Image#setImageGravity}` for more details about this property.
	 * @param {Number[]} [options.insets=[0, 0, 0, 0]] The insets that will be used to clip the
	 *		edges of the image. Specified as an array of four floats, starting with the top inset
	 *		and going clockwise around the image.
	 * @param {Number[]} [options.rect] An array of integers that specify a rectangle where the 
	 *		existing image will be placed in the new image. (By default, this method uses a
	 *		rectangle that is the same size as the new image.) The array contains the following four
	 *		values, in this order:
	 *
	 * 1. The X origin at which to place the top left corner of the existing image.
	 * 2. The Y origin at which to place the top left corner of the existing image.
	 * 3. The width, in pixels, of the image rectangle.
	 * 4. The height, in pixels, of the image rectangle.
	 * @param {Number[]} [options.transform] The affine transformation to apply to the existing
	 *		image. See `{@link UI.Image#setImageTransform}` for more information about affine
	 *		transformations. Specified as an array of six floats: `[a, b, c, d, tx, ty]`.
	 * @cb {Function} callback The function to call after choosing an image.
	 * @cb-param {Object} data Information about the image.
	 * @cb-param {String} [data.error] A description of the error, if any.
	 * @cb-param {String} [data.filename] The filename for the image. **Note**: This value may
	 *		differ from the value that was sent in the `filename` parameter.
	 * @cb-returns {void}
	 * @param {Object} invokingView The view that is invoking the image picker.
	 * @returns {void}
	 * @since 1.3.1b
	 */
    choosePhoto: function(targetWide, targetHigh, filename, options, callback, invokingView) {
       if (!invokingView || !invokingView.__objectRegistryId) {
            new exports.UI.Toast({
                'text': "Photo picker requires an invoking view.",
                'onDisappear': function() {
                    this.destroy();
                }
            }).show();
            return;
        }

        var cb = this.Commands.registerTemporaryCallback(callback);
		if (cb) {
        	this.Commands.doChoosePhoto(targetWide, targetHigh, filename, options || {}, cb, invokingView.__objectRegistryId);
		}
    },

    /**
     * Display a full-screen interface for taking a new photo with the device's camera, and write
	 * the photo to the device's file system. You can retrieve the photo at its original size, or 
	 * you can rescale the photo to fit within a width and height you specify.
	 *
	 * By default, the image is saved in PNG format. To use JPEG format, specify a filename with the
	 * extension .jpg.
	 * @name UI.choosePhotoCamera
	 * @function
	 * @static
	 * @example
	 * // Take a photo, and scale it to fit within a 100 x 200 rectangle.
	 * var filename = "example.png";
	 * UI.choosePhotoCamera(100, 200, filename, {}, function(data) {
	 *     if (data.error) {
	 *         // The user probably canceled instead of taking a photo.
	 *         console.log("Unable to retrieve a photo: " + data.error);
	 *     } else {
	 *         // Update the filename.
	 *         filename = data.filename;
	 *     }
	 * });
	 * @param {Number} targetWide The width, in pixels, to use for scaling the photo. Use 0 to
	 *		retrieve an unscaled photo.
	 * @param {Number} targetHigh The height, in pixels, to use for scaling the photo. Use 0 to
	 *		retrieve an unscaled photo.
	 * @param {String} filename The preferred filename for the new photo. Use the extension .jpg to
	 *		save the file in JPEG format. By default, the file is saved in PNG format. **Note**: The
	 *		file may be saved using a different name. Use the callback function to identify the 
	 *		file's actual name.
	 * @param {Object} options Options for retrieving the image.
	 * @param {UI.Commands#FitMode} [options.fit=UI.Commands.FitMode.Inside] The image fit mode to
	 *		use when scaling the existing image.
	 * @param {Number[]|UI.ViewGeometry#Gravity} [options.gravity=[0.5, 0.5]] The image gravity to
	 *		use when placing the existing image within the retrieved image. See
	 *		`{@link UI.Image#setImageGravity}` for more details about this property.
	 * @param {Number[]} [options.insets=[0, 0, 0, 0]] The insets that will be used to clip the
	 *		edges of the image. Specified as an array of four floats, starting with the top inset
	 *		and going clockwise around the image.
	 * @param {Number[]} [options.rect] An array of integers that specify a rectangle where the 
	 *		existing image will be placed in the new image. (By default, this method uses a
	 *		rectangle that is the same size as the new image.) The array contains the following four
	 *		values, in this order:
	 *
	 * 1. The X origin at which to place the top left corner of the existing image.
	 * 2. The Y origin at which to place the top left corner of the existing image.
	 * 3. The width, in pixels, of the image rectangle.
	 * 4. The height, in pixels, of the image rectangle.
	 * @param {Number[]} [options.transform] The affine transformation to apply to the existing
	 *		image. See `{@link UI.Image#setImageTransform}` for more information about affine
	 *		transformations. Specified as an array of six floats: `[a, b, c, d, tx, ty]`.
	 * @cb {Function} callback The function to call after taking a photo.
	 * @cb-param {Object} data Information about the photo.
	 * @cb-param {String} [data.error] A description of the error, if any.
	 * @cb-param {String} [data.filename] The filename for the photo. **Note**: This value may
	 *		differ from the value that was sent in the `filename` parameter.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.3.1b
	 */
    choosePhotoCamera: function(width, height, filename, options, callback) {
        var cb = this.Commands.registerTemporaryCallback(callback);
		if (cb) {
        	this.Commands.doChooseCamera(width, height, filename, options || {}, cb);
		}
    },


    /**
	 * Capture a static image of the screen. You can retrieve the screenshot at its original size, 
	 * or you can rescale the image to fit within a width and height you specify.
	 *
	 * By default, screenshots include graphics that were drawn by classes in the `UI` and
	 * `{@link GL2}` modules. Use the `options.screenshotType` parameter to exclude either type of
	 * graphics from the screenshot.
	 *
	 * By default, the image is saved in PNG format. To use JPEG format, specify a filename with the
	 * extension .jpg.
	 * @name UI.takeScreenshot
	 * @function
	 * @static
	 * @example
	 * // Take a screenshot, and scale it to fit within a 100 x 200 rectangle.
	 * var filename = "example.png";
	 * UI.takeScreenshot(100, 200, filename, {}, function(data) {
	 *     if (data.error) {
	 *         console.log("Unable to retrieve a screenshot: " + data.error);
	 *     } else {
	 *         // Update the filename.
	 *         filename = data.filename;
	 *     }
	 * });
	 * @param {Number} targetWide The width, in pixels, to use for scaling the photo. Use 0 to
	 *		retrieve an unscaled image.
	 * @param {Number} targetHigh The height, in pixels, to use for scaling the photo. Use 0 to
	 *		retrieve an unscaled image.
	 * @param {String} filename The preferred filename for the new image. Use the extension .jpg to
	 *		save the file in JPEG format. By default, the file is saved in PNG format. **Note**: The
	 *		file may be saved using a different name. Use the callback function to identify the 
	 *		file's actual name.
	 * @param {Object} options Options for retrieving the screenshot.
	 * @param {UI.Commands#FitMode} [options.fit=UI.Commands.FitMode.Inside] The image fit mode to
	 *		use when scaling the screenshot.
	 * @param {Number[]|UI.ViewGeometry#Gravity} [options.gravity=[0.5, 0.5]] The image gravity to
	 *		use when placing the screenshot within the retrieved image. See
	 *		`{@link UI.Image#setImageGravity}` for more details about this property.
	 * @param {Number[]} [options.insets=[0, 0, 0, 0]] The insets that will be used to clip the
	 *		edges of the image. Specified as an array of four floats, starting with the top inset
	 *		and going clockwise around the image.
	 * @param {Number[]} [options.rect] An array of integers that specify a rectangle where the 
	 *		screenshot will be placed in the new image. (By default, this method uses a rectangle
	 *		that is the same size as the new image.) The array contains the following four values,
	 *		in this order:
	 *
	 * 1. The X origin at which to place the top left corner of the screenshot.
	 * 2. The Y origin at which to place the top left corner of the screenshot.
	 * 3. The width, in pixels, of the image rectangle.
	 * 4. The height, in pixels, of the image rectangle.
	 * @param {Number[]} [options.transform] The affine transformation to apply to the screenshot.
	 *		See `{@link UI.Image#setImageTransform}` for more information about affine
	 *		transformations. Specified as an array of six floats: `[a, b, c, d, tx, ty]`.
	 * @param {UI.Commands.ScreenshotType} [options.screenshotType] Indicates whether to include
	 *		graphics drawn with the `UI` module, the `{@link GL2}` module, or both modules. By
	 *		default, screenshots include graphics from both modules.
	 * @cb {Function} callback The function to call after taking a screenshot.
	 * @cb-param {Object} data Information about the screenshot.
	 * @cb-param {String} [data.error] A description of the error, if any.
	 * @cb-param {String} [data.filename] The filename for the screenshot. **Note**: This value may
	 *		differ from the value that was sent in the `filename` parameter.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.6.5
	 */
	takeScreenshot: function(width, height, filename, options, callback) {
		var cb = this.Commands.registerTemporaryCallback(callback);
		if (cb) {
			this.Commands.takeScreenshot(width, height, filename, options || {}, cb);
		}
	},

	/**
	 * Retrieve the width and height, in pixels, of a text block. The dimensions are measured by
	 * attempting to lay the text out inside of a rectangle whose width and height you specify,
	 * using a font and font size that you specify. If the text overflows the rectangle's height,
	 * only the text that fits within the rectangle is measured.
	 *
	 * You can also measure the dimensions of a text block without width and/or height constraints,
	 * which enables you to determine how much space would be required to display the text block.
	 * @name UI.measureText
	 * @function
	 * @static
	 * @example
	 * // Measure the dimensions of a text block that is allowed to take up the
	 * // entire screen.
	 * var string = "You have to learn the rules of the game. And then you have to " +
	 *   "play better than anyone else.";
	 * var blockSize = [];
	 * var lineWidths = [];
	 * var totalWidth = 0;
	 * UI.measureText(string, Device.LayoutEmitter.getWidth(),
	 *   Device.LayoutEmitter.getHeight(), "DroidSans", 24, function(dimensions) {
	 *     blockSize = [dimensions.width, dimensions.height];
	 *     lineWidths = dimensions.lineWidths;
	 *     totalWidth = dimensions.totalWidth;
	 * });
	 * @param {String} text The string of text to measure.
	 * @param {Number} w The width, in pixels, of the rectangle that will be used to lay out the
	 *		text. Specify an empty string to measure the text without a width constraint.
	 * @param {Number} h The height, in pixels, of the rectangle that will be used to lay out the
	 *		text. Specify an empty string to measure the text without a height constraint.
	 * @param {String} font The name of the font to use for measuring the text.
	 * @param {Number} size The font size, in pixels, to use for measuring the text.
	 * @cb {Function} callback The function to call after measuring the text.
	 * @cb-param {Object} dimensions Information about the text dimensions.
	 * @cb-param {Number} dimensions.height The height, in pixels, of the block of text.
	 * @cb-param {Number[]} dimensions.lineWidths The widths, in pixels, of each line in the block
	 *		of text.
	 * @cb-param {Number} dimensions.totalWidth The combined width, in pixels, of all of the lines
	 *		in the text block.
	 * @cb-param {Number} dimensions.width The width, in pixels, of the block of text.
	 * @cb-returns {void}
	 * @returns {void}
	 * @since 1.4.2
	 */
	measureText: function( text, w, h, font, size, callback) {
		var cb = this.Commands.registerTemporaryCallback(callback);
		if (cb !== '') {
			this.Commands.measureText(text, w || -1, h || -1, font, size, cb);
		}
	},
	/**
	 * Hide the on-screen keyboard if it is showing, regardless of which text field or text area is 
	 * selected.
	 * @name UI.hideKeyboard
	 * @function
	 * @static
	 * @returns {void}
	 * @since 1.6.5
	 */
	hideKeyboard: function() {
		this.Commands.hideKeyboard();
	}
};

exports.UI = new UILoader({
	"Commands": function() { return require("./UI/Commands").Commands; },
	"FontStyle": function() { return this.Commands.FontStyle; },
	"State": function() { return this.Commands.State; },
	"FitMode": function() { return this.Commands.FitMode; },
	
	"Window": function() { return require("./UI/Window").Window; },
	"Element": function() { return require("./UI/Element").Element; },
	"ViewGeometry": function() { return require("./UI/ViewGeometry").ViewGeometry; },
	"Scale": function() { return exports.UI.ViewGeometry.Scale; },
	"View": function() { return require("./UI/View").View; },
	"Label": function() { return require("./UI/Label").Label; },
	"Image": function() { return require("./UI/Image").Image; },
	"Button": function() { return require("./UI/Button").Button; },
	"GLView": function() { return require("./UI/GLView").GLView; },
	"NavController": function() { return require("./UI/NavController").NavController; },
	"WebView": function() { return require("./UI/WebView").WebView; },
	"ScrollView": function() { return require("./UI/ScrollView").ScrollView; },
	"ListView": function() { return require("./UI/ListView").ListView; },
	"ListViewSection": function() { return require("./UI/ListViewSection").ListViewSection; },
	"ListViewItem": function() { return require("./UI/ListViewItem").ListViewItem; },
	"CellView": function() { return require("./UI/CellView").CellView; },
	"CheckBox": function() { return require("./UI/CheckBox").CheckBox; },
	"EditText": function() { return require("./UI/EditText").EditText; },
	"EditTextArea": function() { return require("./UI/EditTextArea").EditTextArea; },
	"DateField": function() { return require("./UI/DateField").DateField; },
	"AlertDialog": function() { return require("./UI/AlertDialog").AlertDialog; },
	"ProgressDialog": function() { return require("./UI/ProgressDialog").ProgressDialog; },
	"Toast": function() { return require("./UI/Toast").Toast; },
	"Style": function() { return require("./UI/Style").Style; },
	"Spinner": function() { return require("./UI/Spinner").Spinner; },
	"ProgressBar": function() { return require("./UI/ProgressBar").ProgressBar; },
	"Diagnostics": function() { return require("./UI/Diagnostics").Diagnostics; },
/** @private */
	"AdView": function() { return require("./UI/AdView").AdView; },
	"DocumentView": function() { return require("./UI/DocumentView").DocumentView; },
	"CheckoutView": function() { return require("./UI/CheckoutView").CheckoutView; },
	"MapView": function() { return require("./UI/MapView").MapView; },
	"MapAnnotation": function() { return require("./UI/MapAnnotation").MapAnnotation; },
	"_CutSceneView": function() { return require("./UI/_CutSceneView").CutSceneView; }
});

