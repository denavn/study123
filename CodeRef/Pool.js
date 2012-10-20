var Core = require('../NGCore/Client/Core').Core;
var Model = require('./Model').Model;

exports.Pool = Core.Class.singleton({
    initialize: function () {
        this.Mine = null;
    }
});
