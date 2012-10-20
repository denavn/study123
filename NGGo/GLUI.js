////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:	Muzammil Mahmood
 *  Website:	https://developer.mobage.com/
 *  Copyright:  (C) 2011 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

var Commands	 = require("./GLUI/Commands").Commands;
var ViewGeometry = require("./GLUI/ViewGeometry");

/**
 * <p>Classes and objects contained by the GLUI module.</p>
 * @name GLUI
 * @namespace
 * @description <p>The GLUI module is a collection of classes that control user interface components using GL2.
 * Each class handles a specific aspect of the module implementation and contains APIs that support the class:</p>
 * <ul>
 * <li><code>{@link GLUI.AbstractView}</code>A base class object for constructing other UI objects.</li>
 * <li><code>{@link GLUI.CellView}</code>: Construct <code>CellView</code> objects.</li>
 * <li><code>{@link GLUI.CheckBox}</code>: Construct objects that are used as checkboxes in an application.</li>
 * <li><code>{@link GLUI.Element}</code>: A base class object for constructing other UI objects.</li>
 * <li><code>{@link GLUI.Image}</code>: Constructs objects that control the location and size of images used in the user interface.</li>
 * <li><code>{@link GLUI.Label}</code>: Constructs objects that control the look and feel of application labels.</li>
 * <li><code>{@link GLUI.ListView}</code>: Construct <code>ListView</code> objects.</li>
 * <li><code>{@link GLUI.ListViewItem}</code>: Construct <code>ListViewItem</code> objects.</li>
 * <li><code>{@link GLUI.ListViewSection}</code>: Construct <code>ListViewSection</code> objects.</li>
 * <li><code>{@link GLUI.ScrollView}</code>: Construct <code>ScrollView</code> objects.</li>
 * <li><code>{@link GLUI.View}</code>: Construct objects that control the look and feel of the application view state.</li>
 * <li><code>{@link GLUI.ViewGeometry.Rect}</code>: Construct rectangle objects for use as positionable elements in the user interface.</li>
 * <li><code>{@link GLUI.ViewGeometry.Scale}</code>: Construct objects that handle view geometry for different scales of measurement.</li>
 * <li><code>{@link GLUI.Commands.FontLocation}</code>: Font location for GLUI objects.</li>
 * <li><code>{@link GLUI.Commands.FontStyle}</code>: Font Styles for GLUI  Objects.</li>
 * <li><code>{@link GLUI.Commands.State}</code>: Object States for GLUI Objects.</li>
 * <li><code>{@link GLUI.Commands.FitMode}</code>: Image Fit Modes for GLUI Objects.</li>
 * <li><code>{@link GLUI.Window}</code>: Construct application window objects.</li>
 * </ul>
 */


exports.GLUI =
{

    //Modules
    View                : require('./GLUI/View').View,
    Image               : require('./GLUI/Image').Image,
    Label               : require('./GLUI/Label').Label,
    Button              : require('./GLUI/Button').Button,
    CheckBox            : require('./GLUI/CheckBox').CheckBox,
    CellView			: require('./GLUI/CellView').CellView,
    ScrollView			: require('./GLUI/ScrollView').ScrollView,
    ListView			: require('./GLUI/ListView').ListView,
    ListViewSection		: require('./GLUI/ListViewSection').ListViewSection,
    ListViewItem		: require('./GLUI/ListViewItem').ListViewItem,
    Spinner             : require('./GLUI/Spinner').Spinner,
    NavController	: require('./GLUI/NavController').NavController,


	//Application Window and Document
	Window		: require('./GLUI/Window').Window,
	WindowLayer	: require('./GLUI/WindowLayer').WindowLayer,

	//Utils Files
	Commands	: Commands,
	FontLocation: Commands.FontLocation,
	FontStyle	: Commands.FontStyle,
	State	: Commands.State,
	FitMode	: Commands.FitMode,
	ViewGeometry: ViewGeometry,
	Scale	: ViewGeometry.Scale,

	//__Deprecated Modules__
	/**
	 * @deprecated now Replaced by {@link GLUI.Window.document}.
	 * @Note: use GLUI.Window.document.METHOD() now.
	 */
	NGWindow	: require('./GLUI/NGWindow').NGWindow  /* __deprecated__  use GLUI.Window.document instead */
};
