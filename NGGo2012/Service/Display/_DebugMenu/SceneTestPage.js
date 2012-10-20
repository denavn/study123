////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

// ngCore
var Button     = require('../../../../NGCore/Client/UI/Button').Button;
var ScrollView = require('../../../../NGCore/Client/UI/ScrollView').ScrollView;
var Gravity    = require('../../../../NGCore/Client/UI/ViewGeometry').Gravity;
var Window     = require('../../../../NGCore/Client/UI/Window').Window;

// NGGo
var DebugMenuPage     = require('../_DebugMenu/DebugMenuPage').DebugMenuPage;
var Scene             = require('../../../Framework/Scene/Scene').Scene;
var SceneDirector     = require('../../../Framework/Scene/SceneDirector').SceneDirector;


var TestSceneBench = Scene.subclass(
{
    classname: "TestSceneBench",
    initialize: function (window, testfixture)
    {
        this._testfixture = testfixture;
        this._window = window;
        this._button = new Button(
        {
            textGravity: Gravity.Center,
            gradient:
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "66000000 0.0", "66000000 1.0" ]
            },
            highlightedGradient:
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "FF6666FF 0.0", "FF333388 1.0" ]
            },
            frame: [1, 1, 48, 48],
            text: "X",
            textSize: 16,
            normalTextColor: "FFFFFF",
            highlightedTextColor: "FFFFFF",
            onClick: function()
            {
                SceneDirector.pop();
            }
        });
        Window.document.addChild(this._button);
    },
    onEnter: function (prevScene, option)
    {
        var DebugMenu = require('../DebugMenu');
        SceneDirector.push(this._testfixture, option);
        this._window.setVisible(false);
    },
    onResume: function (prevScene, option)
    {
        console.log("@@ pop scene:" + String(option));
        this._window.setVisible(true);
        this._button.destroy();
        this.exit();
    }
});


/** @private */
exports.SceneTestPage = DebugMenuPage.subclass(
{
    classname: "SceneTestPage",
    mode: 2,
    destroy: function()
    {
        this._updaters = [];
    },
    onDrawPage: function(window, pageFrame, contentRectWidth)
    {
        this._updaters = [];
        var height = this._screen.convertNumber(24);
        var scrollView = new ScrollView(
        {
            frame: pageFrame.array()
        });

        this.elems.push(scrollView);
        window.addChild(scrollView);

        var itemRect = pageFrame;
        itemRect.y = 0;
        var contentRectHeight = 0;
        var scenes = this._param;
        var i;
        for (i=0;i<scenes.length;++i)
        {
            var scene = scenes[i];
            var buttonRect = itemRect.sliceVertical(height);
            this._createSceneButton(scene, window, scrollView, buttonRect);
            itemRect.sliceVertical(5);
            contentRectHeight += height + 5;
        }
        scrollView.setContentSize(this._screen.convert([contentRectWidth, contentRectHeight]));
    },
    _createSceneButton: function(scene, window, scrollView, rect)
    {
        var sceneName = scene[0];
        var sceneObject = scene[1];
        var option = scene[2];
        var that = this;
        var callback = function(event)
        {
            var bench = new TestSceneBench(window, sceneObject);
            SceneDirector.push(bench, option);
        };
        this.createButton(sceneName, scrollView, rect, callback);
    }
});
