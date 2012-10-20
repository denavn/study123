var Core = require('../../NGCore/Client/Core').Core;
var DnButton = require('../../DnLib/Dn/GLUI/Button').Button;
var DnListView = require('../../DnLib/Dn/GLUI/ListView').ListView;


/* usage:

    var CreateDn = require("../Common/CreateDn").CreateDn
    // -----

    var DnButton = CreateDn.button({
                        frame: [x, y, w, h],
                        url: "button.image.png",
                        callback: function(data) { alert(data); }, // alert(2011)
                        callbackData: new Date().setFullYear()
                    });

    var DnList = CreateDn.list({
                        itemSize: [100, 200],
                        frame: [0, 230, 320, 200],
                        data: heroListData,
                        callback: buildListViewCallback
                    });

    function buildListViewCallback(listView, hero, itemIndex) {
        var listItem, hero, name, lv, lv_text, selected, button;

        listItem = CreateCore.image({ url: "common/list_frame.png",
                                      frame: [0, 0, 100, 200] });
        hero     = CreateCore.image({ url: "Content/image/hero/" + hero.id + ".png",
                                      frame: [0, 0, 100, 100],
                                      anchor: [0, 0], uvs: [0.33, 0, 0.33, 0.33] });
        button   = CreateDn.button({ image: "common/transparent.png",
                                     frame: [0, 0, 100, 200],
                                     data: itemIndex,
                                     onclick: onClickListViewItem });
        listItem.addChild(hero);
        listItem.addChild(button);
        listView.addItem(listItem, [hero, button]);
    }

    function onClickListViewItem(selectedItemIndex) { // @param Mix: selected item
        alert(heroListData[selectedItemIndex].id); // hero.id
    }
 */

exports.CreateDn = {
    button: function(param) { // @param { frame, url, callback, callbackData }
                              //  param.frame - NumberArray: [x, y, w, h]
                              //  param.url(= "") - URLString: button url,
                              //  param.callback(= null) - Function:
                              //  param.callbackData(= null) - Mix: callback(data)
                              // @return DnButton:
        var node = new DnButton(),
            url1 = param.url || "";

        node.setFrame(param.frame);
        node.setAnchor([0, 0]);

        if (url1) {
            node.setImage(url1);
        }
        if (param.callback) {
            node.onclick = function() {
                param.callback(param.callbackData);
            }
        }
        return node;
    },

    list: function(param) { // @param Hash: { itemSize, frame, direction, data, callback }
                            //   param.itemSize - NumberArray: [width, height]
                            //   param.frame - NumberArray: [x, y, width, height]
                            //   param.direction - String(= "horizontal"): "vertical" or "horizontal"
                            //   param.data - HashArray: [hash, ...]
                            //   param.callback - Function:
                            // @return GLUI.ListView:
        var listView = new DnListView(),
            dir = param.direction || "horizontal";

        listView.setItemSize(param.itemSize);
        listView.setFrame(param.frame);
        listView.setScrollDirection(dir === "vertical" ? DnListView.ScrollDirection.Vertical
                                                       : DnListView.ScrollDirection.Horizontal);
        param.data.forEach(function(value, index) {
            param.callback(listView, value, index);
        });
        return listView;
    }
};

exports.CreateDn.list.add = function(listView, param) {
    param.data.forEach(function(value, index) {
        param.callback(listView, value, index);
    });
};

exports.CreateDn.list.remove = function(listView, index) {
    listView.removeItem(index);
};

exports.CreateDn.list.clear = function(listView) {
    listView.clearItems();
};

