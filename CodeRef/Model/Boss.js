var ModelBase = require('./ModelBase').ModelBase;
var Hero = require('./Hero').Hero;

exports.Boss = ModelBase.subclass({
    classname: "Boss",

    _setParams: function (d) {
        d = d || {};

        this.status         = d.user_boss          || {};
        this.hero           = new Hero(d.super_man || {});
        this.threshold_base = ~~d.threshold_base   || this.threshold_base || 0;
        this.threshold      = ~~d.threshold        || this.threshold      || 0;
        this.assumed_level  = ~~d.assumed_level    || this.assumed_level  || 0;
        this.coefficient    = ~~d.coefficient      || this.coefficient    || 0;
    }
});
