// Times.js

exports.Times = {
    // 時間を表す文字列 " hh:mm:ss" を返します。1000時間以上は"999:59:59"を返します
    toDigitString: function(time) { // @param Number: sec
                                    // @return String: " hh:mm:ss" or "hhh:mm:ss"
        time = time || 0;
        var hour = (time / 3600) | 0,
            min  = ((time - hour * 3600) / 60) | 0,
            sec  = (time % 60);

        if (hour >= 1000) {
            return "999:59:59";
        }
        hour = hour < 10 ? (" 0" + hour) // " 0h"
             : hour < 100 ? (" " + hour) // " hh"
             : hour;                     // "hhh"

        return hour +
               (min  < 10 ? ":0" + min  : ":" + min) +
               (sec  < 10 ? ":0" + sec  : ":" + sec);
    }
};
