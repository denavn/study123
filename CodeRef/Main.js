/* {{{ @++ ngCore */
var GL2 = require('../NGCore/Client/GL2').GL2;
var UI = require('../NGCore/Client/UI').UI;
var Social = require('../NGCore/Client/Social').Social;
/* }}} @--  */

/* {{{ @++ ngGo */
var ScreenManager = require('../NGGo/Service/Display/ScreenManager').ScreenManager;
var ConfigurationManager = require('../NGGo/Framework/ConfigurationManager').ConfigurationManager;
var SplashScreenManager = require('../NGGo/Service/Display/SplashScreenManager').SplashScreenManager;
var SceneDirector = require('../NGGo/Framework/Scene/SceneDirector').SceneDirector;
var GUIBuilder = require('../NGGo/Framework/GUIBuilder').GUIBuilder;
/* }}} @--  */

/* {{{ @++ DnLib */
var DnListView = require('../DnLib/Dn/GLUI/ListView').ListView;
var DnButton = require('../DnLib/Dn/GLUI/Button').Button;
var AvatarSprite = require('../DnLib/Dn/GL2/AvatarSprite').AvatarSprite;
/* }}} @--  */

var Layer = require('./Layer').Layer;
var GameAPI = require('./GameAPI').GameAPI;
var Pool = require('./Pool').Pool;
var Scene = require('./Scene').Scene;
var Env = require('../Config/Env').Env;
var HeaderController = require('./Controller/HeaderController').HeaderController;
var ImageText = require('./GLUI/ImageText').ImageText;
var ImageBarGauge = require('./GLUI/ImageBarGauge').ImageBarGauge;
var PieGraph = require('./GLUI/PieGraph').PieGraph;
var ReplaceLabel = require('./GLUI/ReplaceLabel').ReplaceLabel;
var Spin = require('./GLUI/Spin').Spin;
var Model = require('./Model').Model;
var HeroStat = require('./Common/Util/HeroStat').HeroStat;
var HeroScrollList = require('./Common/HeroScrollList').HeroScrollList;
var HeroAvatar = require('./Common/Util/HeroAvatar').HeroAvatar;
var CombineHeroScroller = require('./Common/Util/CombineHeroScroller').CombineHeroScroller;

function main() {
    ConfigurationManager.begin(function(err) {
        var firstView = "MyPageScene";
        
        
       
        if (err) {
            NgLogE("ConfigurationManager load error");
            return;
        }
        // ÃƒÂ§Ã‚Â¸Ã‚Â¦ÃƒÂ¥Ã¯Â¿Â½Ã¢â‚¬ËœÃƒÂ£Ã¯Â¿Â½Ã¯Â¿Â½
        ScreenManager.setPortrait();
        // ÃƒÂ¨Ã‚Â«Ã¢â‚¬â€œÃƒÂ§Ã¯Â¿Â½Ã¢â‚¬Â ÃƒÂ£Ã¢â‚¬Å¡Ã‚ÂµÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¤ÃƒÂ£Ã¢â‚¬Å¡Ã‚ÂºÃƒÂ¨Ã‚Â¨Ã‚Â­ÃƒÂ¥Ã‚Â®Ã…Â¡
        ScreenManager.register({
            type: "LetterBox",
            name: "LetterBox",
            logicalSize: [320, 480]
        });
        ScreenManager.setDefault("LetterBox");

        // SplashScreenManagerÃƒÂ£Ã¯Â¿Â½Ã‚Â¨ScreenManagerÃƒÂ£Ã¢â‚¬Å¡Ã¢â‚¬â„¢ÃƒÂ©Ã¢â€šÂ¬Ã‚Â£ÃƒÂ¦Ã¯Â¿Â½Ã‚ÂºÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬Â¢ÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬ÂºÃƒÂ£Ã¢â‚¬Å¡Ã¢â‚¬Â¹ÃƒÂ¥Ã‚Â Ã‚Â´ÃƒÂ¥Ã¯Â¿Â½Ã‹â€ ÃƒÂ£Ã¯Â¿Â½Ã‚Â¯ÃƒÂ¥Ã¢â‚¬Â¦Ã‹â€ ÃƒÂ£Ã¯Â¿Â½Ã‚Â«ScreenManager.getRootNode()ÃƒÂ£Ã¢â‚¬Å¡Ã¢â‚¬â„¢RootÃƒÂ£Ã¯Â¿Â½Ã‚Â«addChildÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬â€�ÃƒÂ£Ã¯Â¿Â½Ã‚Â¦ÃƒÂ£Ã¯Â¿Â½Ã…Â ÃƒÂ£Ã¯Â¿Â½Ã¯Â¿Â½
        GL2.Root.addChild(ScreenManager.getRootNode());

        // ÃƒÂ£Ã†â€™Ã¢â‚¬Â¡ÃƒÂ£Ã†â€™Ã¯Â¿Â½ÃƒÂ£Ã†â€™Ã†â€™ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â°ÃƒÂ¨Ã‚Â¨Ã‚Â­ÃƒÂ¥Ã‚Â®Ã…Â¡ -- on/offÃƒÂ£Ã¯Â¿Â½Ã‚Â¯manifest.jsonÃƒÂ£Ã¯Â¿Â½Ã‚Â§ÃƒÂ¨Ã‚Â¡Ã…â€™ÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬Å¾ÃƒÂ£Ã¯Â¿Â½Ã‚Â¾ÃƒÂ£Ã¯Â¿Â½Ã¢â€žÂ¢
        if (DebugMenu) {
            // DebugMenu.createButton();
        }

        // ÃƒÂ¨Ã‚Â¿Ã‚Â½ÃƒÂ¥Ã…Â Ã‚Â ÃƒÂ£Ã¯Â¿Â½Ã‚Â®ÃƒÂ¨Ã‚Â¨Ã‚Â­ÃƒÂ¥Ã‚Â®Ã…Â¡ÃƒÂ£Ã¢â‚¬Å¡Ã¢â‚¬â„¢ÃƒÂ£Ã†â€™Ã¢â€šÂ¬ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¦ÃƒÂ£Ã†â€™Ã‚Â³ÃƒÂ£Ã†â€™Ã‚Â­ÃƒÂ£Ã†â€™Ã‚Â¼ÃƒÂ£Ã†â€™Ã¢â‚¬Â°
        SplashScreenManager.addObserver("onStartBackgroundTask", function(node) {
            NgLogD("onStartBackgroundTask");
            var initers = [],
                next = function () {
                    if (initers.length > 0)
                        (initers.shift())();
                };
            initers = [
                function() {
                    NgLogD("initFont");
                    require('./GLUI/ImageText').ImageTextIniter.init(next);
                },
                function() {
                    NgLogD("initAPI");
                    var onError = function(r) {
                        SceneDirector.popToRoot();
                        SceneDirector.transition("MyPageScene");
                        SceneDirector.push("ModalDialogScene", {message:"ÃƒÂ£Ã†â€™Ã¯Â¿Â½ÃƒÂ£Ã†â€™Ã†â€™ÃƒÂ£Ã†â€™Ã‹â€ ÃƒÂ£Ã†â€™Ã‚Â¯ÃƒÂ£Ã†â€™Ã‚Â¼ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¯ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¨ÃƒÂ£Ã†â€™Ã‚Â©ÃƒÂ£Ã†â€™Ã‚Â¼ÃƒÂ£Ã¯Â¿Â½Ã…â€™ÃƒÂ§Ã¢â€žÂ¢Ã‚ÂºÃƒÂ§Ã¢â‚¬ï¿½Ã…Â¸ÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬â€�ÃƒÂ£Ã¯Â¿Â½Ã‚Â¾ÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬â€�ÃƒÂ£Ã¯Â¿Â½Ã…Â¸ÃƒÂ£Ã¢â€šÂ¬Ã¢â‚¬Å¡\nÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬â€�ÃƒÂ£Ã¯Â¿Â½Ã‚Â°ÃƒÂ£Ã¢â‚¬Å¡Ã¢â‚¬Â°ÃƒÂ£Ã¯Â¿Â½Ã¯Â¿Â½ÃƒÂ£Ã¯Â¿Â½Ã…Â ÃƒÂ¥Ã‚Â¾Ã¢â‚¬Â¦ÃƒÂ£Ã¯Â¿Â½Ã‚Â¡ÃƒÂ£Ã¯Â¿Â½Ã¯Â¿Â½ÃƒÂ£Ã¯Â¿Â½Ã‚Â ÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬Â¢ÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬Å¾"});
                    };
                    var onException = function(r) {
                        SceneDirector.push("ModalDialogScene", {message: r.message});
                    };
                    var onRequestBegin = function() {
                        if (SceneDirector.currentScene.sceneName !== "LoadingScene") {
                            SceneDirector.push("LoadingScene");
                        }
                    };
                    var onRequestDone = function() {
                        if (SceneDirector.currentScene.sceneName === "LoadingScene") {
                            SceneDirector.pop();
                        }
                    };
                    GameAPI.showWelcome = function () {
                        firstView = "WelcomeScene";
                        next();
                    };
                    GameAPI.init(Env.game_server.host, {
                        success: function (r) {
                            firstView = "MyPageScene";
                            // ÃƒÂ£Ã†â€™Ã‚Â¦ÃƒÂ£Ã†â€™Ã‚Â¼ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¶ÃƒÂ£Ã†â€™Ã‚Â¼ÃƒÂ£Ã†â€™Ã¢â‚¬Â¡ÃƒÂ£Ã†â€™Ã‚Â¼ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¿ÃƒÂ¥Ã¯Â¿Â½Ã¢â‚¬â€œÃƒÂ¥Ã‚Â¾Ã¢â‚¬â€�
                            GameAPI.User.getSelfStatus(next);
                            // ÃƒÂ¥Ã¢â‚¬Â¦Ã‚Â±ÃƒÂ©Ã¢â€šÂ¬Ã…Â¡ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¨ÃƒÂ£Ã†â€™Ã‚Â©ÃƒÂ£Ã†â€™Ã‚Â¼
                            GameAPI.Common.onFail  = onError;
                            GameAPI.Common.onError = onError;
                            GameAPI.Common.onException = onException;

                            // ÃƒÂ£Ã†â€™Ã‚ÂªÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¯ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¨ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¹ÃƒÂ£Ã†â€™Ã‹â€ ÃƒÂ©Ã¢â‚¬â€œÃ¢â‚¬Â¹ÃƒÂ¥Ã‚Â§Ã¢â‚¬Â¹ÃƒÂ¦Ã¢â€žÂ¢Ã¢â‚¬Å¡ÃƒÂ£Ã¯Â¿Â½Ã‚Â«ÃƒÂ¥Ã¢â‚¬ËœÃ‚Â¼ÃƒÂ£Ã¯Â¿Â½Ã‚Â°ÃƒÂ£Ã¢â‚¬Å¡Ã…â€™ÃƒÂ£Ã¢â‚¬Å¡Ã¢â‚¬Â¹
                            GameAPI.Common.onRequestBegin = onRequestBegin;

                            // ÃƒÂ£Ã†â€™Ã‚Â¬ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¹ÃƒÂ£Ã†â€™Ã¯Â¿Â½ÃƒÂ£Ã†â€™Ã‚Â³ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¹ÃƒÂ¥Ã¯Â¿Â½Ã¢â‚¬â€œÃƒÂ¥Ã‚Â¾Ã¢â‚¬â€�ÃƒÂ¦Ã¢â€žÂ¢Ã¢â‚¬Å¡ÃƒÂ£Ã¯Â¿Â½Ã‚Â«ÃƒÂ§Ã‚ÂµÃ¯Â¿Â½ÃƒÂ¦Ã…Â¾Ã…â€œÃƒÂ£Ã¯Â¿Â½Ã‚Â«ÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬Â¹ÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬Â¹ÃƒÂ£Ã¢â‚¬Å¡Ã¯Â¿Â½ÃƒÂ£Ã¢â‚¬Å¡Ã¢â‚¬Â°ÃƒÂ£Ã¯Â¿Â½Ã…Â¡ÃƒÂ¥Ã¢â‚¬ËœÃ‚Â¼ÃƒÂ£Ã¯Â¿Â½Ã‚Â°ÃƒÂ£Ã¢â‚¬Å¡Ã…â€™ÃƒÂ£Ã¢â‚¬Å¡Ã¢â‚¬Â¹
                            GameAPI.Common.onRequestDone = onRequestDone;
                        },

                        welcome: GameAPI.showWelcome
                    });
                },
                function () {
                    NgLogD("onStartBackgroundTask :: FIN");
                    SplashScreenManager.enableSkip();
                }
            ];

            // SceneÃƒÂ§Ã¢â€žÂ¢Ã‚Â»ÃƒÂ©Ã…â€™Ã‚Â²
            Scene.register();

            // GUIBuilder ÃƒÂ¥Ã‹â€ Ã¯Â¿Â½ÃƒÂ¦Ã…â€œÃ…Â¸ÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬Â¹
            initGUIBuilder();

            Pool.Mine = new Model.User();

            next();
        });

        // Splash
        SplashScreenManager.loadConfigFromFile("Content/view/splash.json", function(e){
            SplashScreenManager.start(function(er) {
                if (er) {
                    NgLogException(er);
                    return;
                }

                NgLogD("INIT");

                // ÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬Å“ÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬Å“ÃƒÂ£Ã¯Â¿Â½Ã¢â‚¬Â¹ÃƒÂ£Ã¢â‚¬Å¡Ã¢â‚¬Â°ÃƒÂ¥Ã‹â€ Ã¯Â¿Â½ÃƒÂ¦Ã…â€œÃ…Â¸ÃƒÂ¥Ã…â€™Ã¢â‚¬â€œ
                // ÃƒÂ¥Ã‚Â¿Ã‚ÂµÃƒÂ£Ã¯Â¿Â½Ã‚Â®ÃƒÂ£Ã¯Â¿Â½Ã…Â¸ÃƒÂ£Ã¢â‚¬Å¡Ã¯Â¿Â½ÃƒÂ£Ã†â€™Ã¢â‚¬ÂºÃƒÂ£Ã†â€™Ã‚Â¯ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¤ÃƒÂ£Ã†â€™Ã‹â€ ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¹ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â¯ÃƒÂ£Ã†â€™Ã‚ÂªÃƒÂ£Ã†â€™Ã‚Â¼ÃƒÂ£Ã†â€™Ã‚Â³ÃƒÂ£Ã¢â‚¬Å¡Ã¢â‚¬â„¢ÃƒÂ§Ã¢â€žÂ¢Ã‚Â»ÃƒÂ©Ã…â€™Ã‚Â²
                var background = new GL2.Sprite();
                background.setImage("Content/blank.png", ScreenManager.logicalSize, [0, 0]);
                Layer.addRootChild(background, 0);

                // mobage button
                Social.Common.Service.showCommunityButton([0,0],'default', function (error) {
                    NgLogE(error);
                });

                // header
                GUIBuilder.loadConfigFromFile("Content/view/HeaderView.json",HeaderController, function (e){
                    HeaderController.update();
                    Layer.addRootChild(HeaderController.HeaderView, Layer.Depth.HEADER);
                    Pool.Mine.addListener("headerUpdate", function() {HeaderController.update();});
                });

                // ÃƒÂ¦Ã…â€œÃ¢â€šÂ¬ÃƒÂ¥Ã‹â€ Ã¯Â¿Â½ÃƒÂ£Ã¯Â¿Â½Ã‚Â®sceneÃƒÂ£Ã¢â‚¬Å¡Ã¢â‚¬â„¢push
                SceneDirector.push(firstView);
            });
        });
    });
}

function initGUIBuilder() {
    // GUIBuilderÃƒÂ£Ã¯Â¿Â½Ã‚Â®ÃƒÂ£Ã†â€™Ã¢â‚¬Â¡ÃƒÂ£Ã†â€™Ã¢â‚¬Â¢ÃƒÂ£Ã¢â‚¬Å¡Ã‚Â©ÃƒÂ£Ã†â€™Ã‚Â«ÃƒÂ£Ã†â€™Ã‹â€ ÃƒÂ¥Ã¢â€šÂ¬Ã‚Â¤ÃƒÂ£Ã¢â‚¬Å¡Ã¢â‚¬â„¢ÃƒÂ¨Ã‚Â¨Ã‚Â­ÃƒÂ¥Ã‚Â®Ã…Â¡
    GUIBuilder.defaultAnchor = [0,0];
    GUIBuilder.defaultDepth  = Layer.Depth.DEFAULT;

    // extra typeÃƒÂ£Ã¢â‚¬Å¡Ã¢â‚¬â„¢ÃƒÂ¨Ã‚Â¿Ã‚Â½ÃƒÂ¥Ã…Â Ã‚Â 
    GUIBuilder.registerTypeMethod("list", function (controller, def) {
        var listview = new DnListView(),
            direction = (def.attrs.direction == 'vertical') ? DnListView.ScrollDirection.Vertical : DnListView.ScrollDirection.Horizontal;
        listview.setItemSize(def.attrs.itemSize);
        listview.setFrame(def.attrs.frame);
        listview.setScrollDirection(direction);
        // ListViewÃƒÂ¦Ã¢â‚¬Â¹Ã‚Â¡ÃƒÂ¥Ã‚Â¼Ã‚Âµ
        listview.getItemSize = function () {
            return listview._itemSize;
        };
        return listview;
    });

    GUIBuilder.registerTypeMethod("listButton", function (controller, def) {
        var button = new DnButton(),
            attrs  = def.attrs;

        button.setFrame(attrs.frame);

        if (attrs.image) {
            button.setImage(attrs.image.url, UI.State.Normal);
        }
        if (attrs.normalImage) {
            button.setImage(attrs.normalImage.url, UI.State.Normal);
        }
        if (attrs.pressedImage) {
            button.setImage(attrs.pressedImage.url, UI.State.Pressed);
        }
        if (attrs.disabledImage) {
            button.setImage(attrs.disabledImage.url, UI.State.Disabled);
        }
        if (attrs.action) {
            button.onclick = GUIBuilder._createActionCaller(controller, button, attrs.action);
        }

        return button;
    });

    GUIBuilder.registerTypeMethod("avatar", function (controller, def) {
        var frame = def.attrs.frame || [0, 0, 64, 64],
            size = def.attrs.size || [frame[2], frame[3]],
            mobage_id = def.attrs.id || Pool.Mine.mobage_id,
            avatar = new AvatarSprite({
                cache:          def.attrs.cache          || true,
                directory:      def.attrs.directory      || 'usericon',
                localcachetime: def.attrs.localcachetime || 3600,
                cachesize:      def.attrs.cachesize      || 100
            });
        if (def.attrs.defaultImage) {
            avatar.setDefaultImage(def.attrs.defaultImage, size);
        }
        avatar.setAvatarImage(mobage_id, size);
        avatar.setPosition(frame[0], frame[1]);
        return avatar;
    });

    GUIBuilder.registerTypeMethod("imageText", function (controller, def) {
        if (typeof def.attrs.text === "number") {
            def.attrs.text = "" + def.attrs.text; // Number to String
        }
        var imageText = new ImageText({
            frame:           def.attrs.frame || [0, 0, 64, 20],
            text:            def.attrs.text  || "",
            textSize:        def.attrs.textSize || def.attrs.frame[3] || 20,
            fontName:        def.attrs.fontName || "",
            space:           def.attrs.space    || 0,
            colorTop:        def.attrs.colorTop || [1,1,1],
            colorBottom:     def.attrs.colorTop || [0.5,0.5,0.5],
            textGravity:     def.attrs.textGravity || [0,0]
        });
        var glObject = imageText.getGLObject();
        glObject.gluiobj = imageText;
        return glObject;
    });

    GUIBuilder.registerTypeMethod("imageGauge", function (controller, def) {
        var imageGauge = new ImageBarGauge({
            frame:             def.attrs.frame             || [0, 0, 64, 20],
            backgoundImageUrl: def.attrs.backgoundImageUrl || "Content/image/bar/back_black.png",
            validImageUrl:     def.attrs.validImageUrl     || "Content/image/bar/front_blue.png",
            invalidImageUrl:   def.attrs.invalidImageUrl   || "Content/image/bar/back_gray.png",
            value:             def.attrs.value             || 0.5
        });
        var glObject = imageGauge.getGLObject();
        glObject.gluiobj = imageGauge;
        return glObject;
    });

    GUIBuilder.registerTypeMethod("pieGraph", function(controller, def) {
        var pie, glObject;

        pie = new PieGraph(def.attrs || {});

        glObject = pie.getGLObject();
        glObject.gluiobj = pie;

        return glObject;
    });

    GUIBuilder.registerTypeMethod("replaceLabel", function(controller, def) {
        var label, glObject;

        label = new ReplaceLabel(def.attrs || {});
        glObject = label.getGLObject();
        glObject.gluiobj = label;

        return glObject;
    });

    GUIBuilder.registerTypeMethod("spin", function(controller, def) {
        var spin, glObject;

        spin = new Spin(def.attrs || {});
        glObject = spin.getGLObject();
        glObject.gluiobj = spin;

        return glObject;
    });
    GUIBuilder.registerTypeMethod("heroStat", function (controller, def) {
        var heroStat = new HeroStat({
            frame:             def.attrs.frame             || [0, 0, 64, 20],
            backgroundImageUrl: def.attrs.backgroundImageUrl || "Content/image/combine/bg_powerparam.png",
            hero:             def.attrs.hero             || null
        });
        var glObject = heroStat.getGLObject();
        glObject.gluiobj = heroStat;
        return glObject;
    });
    GUIBuilder.registerTypeMethod("heroScrollList", function (controller, def) {
        var heroScrollList = new HeroScrollList({
            frame:             def.attrs.frame             || [0, 0, 64, 20]
        });
        var glObject = heroScrollList.getGLObject();
        glObject.gluiobj = heroScrollList;
        return glObject;
    });
    GUIBuilder.registerTypeMethod("baseHeroButton", function (controller, def) {
        var baseHeroButton = new BaseHeroButton({
            frame:             def.attrs.frame             || [0, 0, 64, 20],
            backgroundImageUrl: def.attrs.backgroundImageUrl || "Content/image/combine/tag_choice_red.png",
            borderImageUrl: def.attrs.borderImageUrl || "Content/image/combine/btn_basehero_bg.png",
            hero:             def.attrs.hero             || null
        });
//        baseHeroButton.setOnClick(controller.action_click(def.name, def.attrs.action.param));
        var glObject = baseHeroButton.getGLObject();
        glObject.gluiobj = baseHeroButton;
        return glObject;
    });
    GUIBuilder.registerTypeMethod("avatarButton", function(controller, def){
    	var avatar = new HeroAvatar({
    		frame:		def.attrs.frame || [0,90,98,96],
    		borderImage:		def.attrs.borderImage || null,
    		bgImage:		def.attrs.bgImage || null,
    		hero:		def.attrs.hero	|| null
    	});
    	var glObject = avatar.getGLObject();
    	
    	glObject.gluiobj = avatar;
    	return glObject;
    });
    GUIBuilder.registerTypeMethod("heroListScroll", function(controller, def){
    	var info = def.attrs;
    	var scroll = new CombineHeroScroller(controller, info.size, info.itemViewed, info.speed, info.path);
    	var s = new GL2.Sprite();
    	s.setPosition(info.frame[0], info.frame[1]);
    	s.addChild(scroll.getNode());
    	s.scroll = scroll;
    	return s;
    });
}
