var ModelBase = require('./ModelBase').ModelBase;
var Mission   = require('./Mission').Mission;
var Boss      = require('./Boss').Boss;

exports.Episode = ModelBase.subclass({
    classname: "Episode",

    _setParams: function (d) {
        d = d || {};
        var episode     = d.episode      || d,
            user_status = d.user_episode || null,
            info        = d.info         || {};

        this.id          = ~~episode.id          || this.id          || 0;
        this.name        = episode.name          || this.name        || "";
        this.description = episode.description   || this.description || "";

        this.status = this.status || {};
        if (user_status) {
            this.status.count      = ~~user_status.count || 1;
            this.status.is_new     = user_status.status == 0;
            this.status.is_process = user_status.status == 1;
            this.status.is_cleared = user_status.status == 2;
            this.status.lock       = false;
        } else {
            this.status.lock       = true;
        }

        this.missions = this.missions || [];
        if (info.mission_list) {
            this.missions = info.mission_list.reverse().map(function(v){
                return new Mission(v);
            });
        }
        if (info.boss && info.boss != {}) {
            this.boss = new Boss(info.boss);
        }
    }
});
