var Core = require('../../../NGCore/Client/Core').Core;

exports.ModelBase = Core.Class.subclass({
    classname: 'ModelBase',

    initialize: function (d) {
        this._listeners = [];
        this._setParams(d || {});
    },

    addListener: function (id, func) {
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i]["id"] === id) {
                return;
            }
        }
        this._listeners.push({"id": id, "func": func});
    },

    removeLister: function (id) {
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i]["id"] === id) {
                this._listeners.splice(i, 1);
                return;
            }
        }
    },

    removeAllListers: function() {
        this._listeners = [];
    },

    destroy: function() {
        removeAllListers();
    },

    dispath: function() {
        for (var i = 0; i < this._listeners.length; i++) {
            this._listeners[i]["func"](this);
        }
    },

    update: function(d) {
        this._setParams(d);
        this.dispath();
    },

    _setParams: function(d) {}
});
