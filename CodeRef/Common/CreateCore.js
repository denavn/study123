var Core = require('../../NGCore/Client/Core').Core;
var GL2 = require('../../NGCore/Client/GL2').GL2;

/* usage:

    var CreateCore = require("../Common/CreateCore").CreateCore
    // -----

    var GL2Sprite = CreateCore.image({
                        frame: [x, y, w, h],
                        url: "Content/image/dummy.png",
                        anchor: [0.5, 0.5],
                        uvs: [0, 0, 1, 1]
                    });

    var GL2Text = CreateCore.label({
                        frame: [x, y, w, h],
                        text: "Hello World"
                    });
 */

exports.CreateCore = {
    image: function(param) { // @param Hash: { frame, url, anchor, uvs }
                             //  param.frame - NumberArray: [x, y, w, h]
                             //  param.url   - URLString/URLStringArray: url or [url]
                             //  param.anchor(= [0, 0]) - NumberArray: [x, y]
                             //  param.uvs(= null)    - NumberArray: [x, y, w, h]
                             // @return GL2.Sprite:
        var node = new GL2.Sprite(),
            url1 = Array.isArray(param.url) ? param.url[0] : param.url, // for GLUI.State.Normal image
            url2 = Array.isArray(param.url) ? param.url[1] : "";        // for GLUI.State.Pressed image

        try {
            node.setPosition(param.frame[0], param.frame[1]);
            if (param.uvs) {
                node.setImage(url1,
                              [param.frame[2], param.frame[3]], param.anchor || [0, 0],
                              new Core.Rect(param.uvs[0], param.uvs[1], param.uvs[2], param.uvs[3]));
            } else {
                node.setImage(url1,
                              [param.frame[2], param.frame[3]], param.anchor || [0, 0]);
            }
        } catch (err) {
            console.log(err + "");
        }
        return node;
    },

    label: function(param) { // @param Hash: { frame, text, size,
                             //                align, color, shadow }
                             // @return GLUI.Label:
                             //  param.frame  - NumberArray: [x, y, w, h]
                             //  param.text   - String(= ""): 
                             //  param.size   - Number(= 12): font-size
                             //  param.align  - String(= "left"): "left" or "center" or "right"
                             //  param.color  - HexColorString(= "FFFFFF"): color code
                             //  param.shadow - NumberArray: "{{color}} {{offfset}}", eg: "FFFFFF 2"
                             //      color    - HexColorString: color code
                             //      offfset  - String: offfset position
                             // @return GL2.Text:

        function parse(color) { // @param HexColorString: "FFFFFF"
                                // @return Hash: { r, g, b }, r:g:b = 0.0 ~ 1.0
            var r = parseInt(color.slice(0, 2), 16);
            var g = parseInt(color.slice(2, 4), 16);
            var b = parseInt(color.slice(4, 6), 16);

            r = ((r / 2.55 + 0.5) | 0) / 100; // 0 ~ 1
            g = ((g / 2.55 + 0.5) | 0) / 100; // 0 ~ 1
            b = ((b / 2.55 + 0.5) | 0) / 100; // 0 ~ 1

            return { r: r, g: g, b: b };
        }

        var node = new GL2.Text();
        var gravity = [0, 0], color;

        switch (param.align || "left") {
        case "left":    gravity = [0.0, 0]; break;
        case "right":   gravity = [1.0, 0]; break;
        case "center":  gravity = [0.5, 0];
        }

        param.color = param.color || "FFFFFF";

        try {
            color = parse(param.color);

            node.setPosition(param.frame[0], param.frame[1]);
            node.setSize(param.frame[2], param.frame[3]);
            node.setAnchor(0, 0);
            node.setText(param.text + "");
            node.setFontSize(param.size || 12);
            node.setColor(color.r, color.g, color.b);
            node.setHorizontalAlign(gravity[0] === 0.5 ? GL2.Text.HorizontalAlign.Center :
                                    gravity[0] === 1.0 ? GL2.Text.HorizontalAlign.Right :
                                                         GL2.Text.HorizontalAlign.Left);
            if (param.shadow != null) {
                NgLogE("NOT_IMPL");
            }
        } catch (err) {
            console.log(err + "");
        }
        return node;
    }

};
