var Label = require("../../NGGo/GLUI/Label").Label;

exports.ReplaceLabel = Label.subclass({
    classname: "ReplaceLabel",

    _original: "",

    initialize: function(properties) {
        if (properties) {
            this.setAttributes(properties);
        }

        this._original = this.getText();
    },

    /**
     * ラベルに設定されているテキストを置換する
     * 置換対象ををキーとし、置換後を値としたオブジェクトを渡す
     * テキスト中キーワードは %keyword% の形式
     * オブジェクトのキーに"%"を付ける必要はない
     * @params {Object} patterns
     * @example
     * label.replace({
     *     point: 100,
     *     exp: 300
     * });
     * // ポイント%point%と経験値%exp%を獲得した
     * //   ↓
     * // ポイント100と経験値300を獲得した
     */
    replace: function(patterns) {
        var key, text = this._original;

        for (key in patterns) {
            text = text.replace("%" + key + "%", patterns[key]);
        }

        this.setText(text);
    }
});
