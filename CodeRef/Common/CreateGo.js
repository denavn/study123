var Core = require('../../NGCore/Client/Core').Core;
var GL2 = require('../../NGCore/Client/GL2').GL2;
var GLUI = require('../../NGGo/GLUI').GLUI;

/* usage:

    var CreateGo = require("../Common/CreateGo").CreateGo
    // -----

    var GL2Sprite = CreateGo.image({
                        frame: [x, y, w, h],
                        url: "Content/image/dummy.png",
                        anchor: [0.5, 0.5],
                        uvs: [0, 0, 1, 1]
                    });

    var GL2Text = CreateGo.label({
                        frame: [x, y, w, h],
                        text: "Hello World"
                    });
 */

exports.CreateGo = {
    image: function(param) { // @param Hash: { frame, url, uvs, anchor, fit }
                             //  param.frame - NumberArray: [x, y, w, h]
                             //  param.url   - URLString/URLStringArray: url or [url, pressed-url]
                             //  param.uvs(= null) - NumberArray: [x, y, w, h] (ngcore=true only)
                             //  param.anchor(= null) - NumberArray: [x, y]
                             //  param.ngcore(= false) - Boolean(= false): true is new GL2.Sprite()
                             //  param.fit - image fit (ngcore=false only)
                             //                 GLUI.Commands.FitMode.None
                             //                 GLUI.Commands.FitMode.Inside
                             //                 GLUI.Commands.FitMode.Fill
                             //                 GLUI.Commands.FitMode.Stretch
                             //                 GLUI.Commands.FitMode.AspectWidth
                             //                 GLUI.Commands.FitMode.AspectHeight
                             //                 GLUI.Commands.FitMode.InsideNoUpscaling
                             // @return GLUI.Image:
        var node = new GLUI.Image(),
            url1 = Array.isArray(param.url) ? param.url[0] : param.url, // for GLUI.State.Normal image
            url2 = Array.isArray(param.url) ? param.url[1] : "";        // for GLUI.State.Pressed image

        try {

            node.setFrame(param.frame);
            url1 && node.setImage(url1, GLUI.State.Normal,  [param.frame[2], param.frame[3]]);
            url2 && node.setImage(url2, GLUI.State.Pressed, [param.frame[2], param.frame[3]]);

            if (param.anchor) {
                node.setImageGravity(param.anchor);
            }
            if (param.fit) {
                node.setImageFit(param.fit);
            }
        } catch (err) {
            console.log(err + "");
        }
        return node;
    },

    label: function(param) { // @param Hash: { frame, text, size,
                             //                align, color, shadow, debug }
                             //  param.frame  - NumberArray: [x, y, w, h]
                             //  param.text   - String(= ""): 
                             //  param.size   - Number(= 14): font-size
                             //  param.align  - String(= "left"): "left" or "center" or "right"
                             //  param.color  - HexColorString(= "FFFFFF"): color code
                             //  param.shadow - NumberArray: "{{color}} {{offfset}}", eg: "FFFFFF 2"
                             //      color    - HexColorString: color code
                             //      offfset  - String: offfset position
                             //  param.debug  - Boolean(= false):
                             // @return GLUI.label:

        var node = new GLUI.Label();
        var gravity = [0, 0], color;

        switch (param.align || "left") {
        case "left":    gravity = [0.0, 0]; break;
        case "right":   gravity = [1.0, 0]; break;
        case "center":  gravity = [0.5, 0];
        }

        param.color = param.color || "FFFFFF";

        try {
            node.setFrame(param.frame);
            node.setText(param.text + "");

            param.shadow != null && node.setTextShadow(param.shadow);

            node.setTextGravity(gravity);
            node.setTextColor(param.color || "FFFFFF");
            node.setTextSize(param.size || 14);

            if (param.debug) {
                node.setBackgroundColor("333333");
                node.setAlpha(0.8);
            }
        } catch (err) {
            console.log(err + "");
        }
        return node;
    }
};
