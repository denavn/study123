var ModelBase = require('./ModelBase').ModelBase;

exports.Navi = ModelBase.subclass({
    classname: "Navi",

    _setParams: function (d) {
        d = d || {};

        this.id   = ~~d.id   || this.id   || 0;
        this.name = d.name   || this.name || "";
        this.icon = d.icon   || this.icon || "";
        this.words = {
        };
    }
});
