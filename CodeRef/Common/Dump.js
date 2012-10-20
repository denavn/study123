// Dump.js

function dump(source,   // @param Mix:
              option) { // @param Hash(= { lf: "\n", sp: "    ", depth: 5, escape: false }):
                        //  option.lf - String(= "\n"): LineFeed, "\n", "<br/>"
                        //  option.sp - String(= "    "): space
                        //  option.depth - Number(= 5): Max depth
                        //  option.escape - Boolean(= false): escape
                        // @return String:
    if (!option) {
        option = { lf: "\n", sp: "    ", depth: 5, escape: false };
    }
    return _dump(source, option, 1);
}

var _ngword = /(?:[\x00-\x1f]|\"|\\[bfnrt\\])/g;

// JSON escape characters
var _escapeJSONChars = {
        '\x00': '\\u0000',
        '\x01': '\\u0001',
        '\x02': '\\u0002',
        '\x03': '\\u0003',
        '\x04': '\\u0004',
        '\x05': '\\u0005',
        '\x06': '\\u0006',
        '\x07': '\\u0007',
        '\b'  : '\\b',      // backspace       U+0008
        '\t'  : '\\t',      // tab             U+0009
        '\n'  : '\\n',      // line feed       U+000A
        '\x0b': '\\u000b',
        '\f'  : '\\f',      // form feed       U+000C
        '\r'  : '\\r',      // carriage return U+000D
        '\x0e': '\\u000e',
        '\x0f': '\\u000f',
        '\x10': '\\u0010',
        '\x11': '\\u0011',
        '\x12': '\\u0012',
        '\x13': '\\u0013',
        '\x14': '\\u0014',
        '\x15': '\\u0015',
        '\x16': '\\u0016',
        '\x17': '\\u0017',
        '\x18': '\\u0018',
        '\x19': '\\u0019',
        '\x1a': '\\u001a',
        '\x1b': '\\u001b',
        '\x1c': '\\u001c',
        '\x1d': '\\u001d',
        '\x1e': '\\u001e',
        '\x1f': '\\u001f',
        '"'   : '\\"',      // quotation mark  U+0022
        '\\'  : '\\\\'      // reverse solidus U+005C
    };

// inner - repeat string
function repeat(str, count) {
    return Array(count + 1).join(str)
}

// inner - custom escape
function customEscape(mix) {
    return mix.split("").map(function(v, c) {
        c = v.charCodeAt(0);
        return c === 0x22 ? "%22"  // 0x22 (")
             : c === 0x27 ? "%27"  // 0x27 (')
             : c === 0x5c ? "%5c"  // 0x5c (\)
             : c === 0x7f ? "%7f"  // 0x7f (DEL)
             : c < 0x10  ? ("%0" + c.toString(16))  // 0x00 ~ 0x0f (control code) -> "%0f"
             : c < 0x20  ? ("%"  + c.toString(16))  // 0x10 ~ 0x1f (control code) -> "%1f"
             : c < 0x80  ? v                        // 0x20 ~ 0x7f (ascii)        -> "#=<>()[]"
             : c < 0x100 ? ("%"  + c.toString(16))  // 0x80 ~ 0xff (ascii)
             : ("%u" + (c + 0x10000).toString(16).slice(1)); // 0x0100 ~ 0xffff -> "%u0000"
    }).join("");
}

/* test case
escape('\t\n !"#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~あいうアイウ愛飢え');
unescape(escape('\t\n !"#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~あいうアイウ愛飢え'));

customEscape('\t\n !"#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~あいうアイウ愛飢え');
unescape(customEscape('\t\n !"#$%&()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~あいうアイウ愛飢え'));
 */

// inner - _dump impl
function _dump(mix,    // @param Mix: value
               option, // @param Hash: { lf, sp, depth, escape }
                       //   option.lf    - String(= ""):
                       //   option.sp    - String(= ""):
                       //   option.depth - Number(= 5):
                       //   option.escape - Boolean(= false): escape
               nest) { // @param Number: nest count from 1
                       // @return String:
    var ary = [], i, iz, key, closeIndent,
        exec, keys, fnName, pairs,
        lf = option.lf || "",
        space = option.sp || "",
        depth = option.depth || 5,
        sp1 = space ? " "  : "", // a space
        tab = space ? repeat(space, nest) : "";

    if (nest > depth) {
        return "...";
    }
    if (mix === null) {
        return "null";
    }
    if (mix === void 0) { // undefined
        return "undefined";
    }
    if (mix.toJSON) { // Date
        return mix.toJSON();
    }
    if (typeof mix === "number") { // NumberLiteral, NumberObject
        return mix.toString();
    }
    if (typeof mix === "string") { // StringLiteral, StringObject
        function _escapeJSON(m) {
            return _escapeJSONChars[m];
        }
        if (option.escape) {
            var org = mix;

            mix = customEscape(mix);

            if (org !== mix) {
                console.log('unescape("' + mix + '");');
            }
        }
        return '"' + mix.replace(_ngword, _escapeJSON) + '"';
    }
    if (typeof mix === "boolean") { // BooleanLiteral, BooleanObject
        return mix.toString();
    }

    if (Array.isArray(mix)) {

        if (!mix.length) {
            return "[]";
        }
        for (i = 0, iz = mix.length; i < iz; ++i) {
            ary.push(tab + _dump(mix[i], option, nest + 1));
        }
        closeIndent = space ? repeat(space, nest - 1) : "";
        return "[" + lf + ary.join("," + lf) +
                     lf + closeIndent +
               "]";

    } else {

        // instance.CLASS_NAME -> Class, Class.lite, Class.singleton
        exec = typeof mix === "function";
        fnName = "function ()";
        if (exec) {
            if (mix.name) {
                fnName = "function " + mix.name + "()";
            }
        }
        keys = Object.keys(mix).sort();

        for (i = 0, iz = keys.length; i < iz; ++i) {
            key = keys[i];
            // [IE6][IE7][IE8] host object has not hasOwnProperty
            if (!mix.hasOwnProperty ||
                 mix.hasOwnProperty(key)) {
                ary.push(tab + '"' + key + '":' + sp1 +
                         _dump(mix[key], option, nest + 1));
            }
        }
        if (!ary.length) {
            return exec ? ("{" + fnName + "}") : "{}";
        }
        closeIndent = space ? repeat(space, nest - 1) : "";
        return (exec ? fnName + " {" : "{") + lf + ary.join("," + lf) +
                                              lf + closeIndent +
               (exec ? "}" : "}");
    }
    return "";
}

exports.Dump = {
    dump:   dump,
    d:      function(source, option) {
                var i;
                var margedOption = { lf: "\n", sp: "    ", depth: 5, escape: true };

                option = option || {};

                for (i in option) {
                    margedOption[i] = option[i];
                }
                NgLogD(dump(source, margedOption));
            },
    s:      function(source, option) {
                var i;
                var margedOption = { lf: "", sp: "", depth: 5, escape: true };

                option = option || {};

                for (i in option) {
                    margedOption[i] = option[i];
                }
                NgLogD(dump(source, margedOption));
            }

};

