exports.Util = {
    // Timeモジュール
    Times: require('./Util/Times').Times,

    // 関数
    /**
     * 画像サイズにと切り出したいframeからUVを算出する
     * @param {Array} frame [x, y, width, height] 切り出す部分
     * @param {Array} size  [width, height] 元画像のサイズ
     */
    toUVSfromFrame: function(frame, size) {
        var w  = size[0],
            h  = size[1];
        
        

        return [frame[0] / w, 
                frame[1] / h, 
                frame[2] / w, 
                frame[3] / h];
    }
};
