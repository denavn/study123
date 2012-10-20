var ModelBase = require('./ModelBase').ModelBase;

exports.Item = ModelBase.subclass({
    classname: "Item",

    _setParams: function (d) {
        d = d || {};
        var user_item = d.user_item || {},
            item      = d.item || {};

        this.id          = ~~item.id        || this.id          || 0;
        this.name        = item.name        || this.name        || "";
        this.price       = ~~item.price     || this.price       || 0;
        this.category    = ~~item.category  || this.category    || 0;
        this.description = item.description || this.description || "";

        this.has_count   = ~~user_item.num  || this.has_count   || 0;
    },

    getImagePath: function() {
        return "./Content/image/item/"+this.id+".png";
    }
});
