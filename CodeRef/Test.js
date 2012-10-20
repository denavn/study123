var DebugMenu = require('../NGGo/Service/Display/DebugMenu').DebugMenu;
var TestEnv = require('../Config/TestEnv').TestEnv;
var Model = require('./Model').Model;
var SceneFactory = require('../NGGo/Framework/Scene/SceneFactory').SceneFactory;

// スタブモード
if (TestEnv.useStab) {
    require('./Test/Stab').Stab.setup(TestEnv.lang || "en");
}

if (TestEnv.noAuth) {
    var Common   = require('./GameAPI/Common').Common,
        Request  = require('./Network/Request').Request,
        send     = Common.send,
        trequest = null;
    Common.init = function(host, callbacks) {
        trequest = new Request(host);
        callbacks.success({});
    };
    Common.send = function(api, params, callbacks, method, request) {
        params = params || {};
        params.opensocial_owner_id = TestEnv.opensocial_owner_id;
        send(api, params, callbacks, method, trequest);
    };
}


DebugMenu.registerUnitTest(function() {
    describe("test", function() {
        it("success", function() {
            expect(10).toEqual(10);
        });
        it("fail", function() {
            expect(10).toEqual(5);
        });
    });
});
DebugMenu.registerDebugScene("CombineMultiSelectScene", "CombineMultiSelectScene Test", {});
DebugMenu.registerDebugScene("CombineBaseSelectScene", "CombineBaseSelectScene Test", {});
SceneFactory.register(require('./Test/APIDebugScene').APIDebugScene);
DebugMenu.registerDebugScene("APIDebugScene", "APIDebug Test", {}); 

DebugMenu.registerDebugScene("BattleListScene", "BattleListScene Test", {});
DebugMenu.registerDebugScene("EpisodeListScene", "EpisodeListScene Test", {});

var dummyUser = new Model.User({
    id: 1234, 
    mobage_id: 53093, 
    nickname: "テスト", 
    level: 99, 
    tag: {
        a: {
            //id: 317 // 武道
            id: 181   // サンシャイン 
        },
        b: {
            //id: 297 // ネプチューン
            //id: 22  // ミート
            id: 53    // 知恵の輪マン
        }
    }
});

// Item
var dummyItem = new Model.Item({
    item: {
        id: 1,
        name: "カルビ丼",
        price: 300,
        description: "おいしく食べてね"
    },
    user_item: {
        num: 3
    }
});
DebugMenu.registerDebugScene("ShopListScene",   "ShopListScene Test",   {});
DebugMenu.registerDebugScene("ShopItemScene",   "ShopItemScene Test",   {item: dummyItem});
DebugMenu.registerDebugScene("ShopFinishScene", "ShopFinishScene Test", {item: dummyItem}); 

DebugMenu.registerDebugScene("BossAppearScene", "BossAppearScene Test", {});
DebugMenu.registerDebugScene("BossBattleScene", "BossBattleScene Test", {});
DebugMenu.registerDebugScene("BossResultScene", "BossResultScene Test", {});

DebugMenu.registerDebugScene("WinScene", "WinScene Test", {});
DebugMenu.registerDebugScene("LoseScene", "LoseScene Test", {});

DebugMenu.registerDebugScene("CaptureAppearScene", "CaptureAppearScene Test", {});
DebugMenu.registerDebugScene("CaptureBattleScene", "CaptureBattleScene Test", {});
DebugMenu.registerDebugScene("CaptureResultScene", "CaptureResultScene Test", {});

DebugMenu.registerDebugScene("ModalDialogScene", "ModalDialogScene Test", {message: "こんにちは。テストです。\nタッチで消えます"});

SceneFactory.register(require('./Test/HeroDebugScene').HeroDebugScene);
DebugMenu.registerDebugScene("HeroDebugScene", "HeroDebugScene Test", {}); 

DebugMenu.registerDebugScene("BattleReadyScene", "BattleReadyScene Test", {user: dummyUser});
DebugMenu.registerDebugScene("CombineBaseSelectScene", "CombineBaseSelectScene Test", {});  
