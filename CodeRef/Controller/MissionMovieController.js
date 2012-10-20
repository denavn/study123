var MovieController = require("./MovieController").MovieController;
var Layer = require("../Layer").Layer;

exports.MissionMovieController = MovieController.subclass({
    classname: "MissionMovieController",

    _effectValues: null,

    initialize: function($super, option) {
        this._effectValues = option.effects;
        delete option.effects;
        $super(option);
    },

    _onMovieFinish: function($super) {
        var self = this;

        GUIBuilder.loadConfigFromFile(
            "Content/view/MissionEffectView.json",
            self,
            function (e) {
                self.MissionEffectView.setDepth(Layer.Depth.TOP);
                self.EffectContainer.addChild(self.MissionEffectView);
                self._updateEffects();
            }
        );

        $super();
    },

    _updateEffects: function() {
        this.Exp.gluiobj.replace({ value: this._effectValues.exp });
        this.KKD.gluiobj.replace({ value: this._effectValues.kkd });
        this.CombinedPoint.gluiobj.replace({ value: this._effectValues.combinedPoint });
        this.Stamina.gluiobj.replace({ value: this._effectValues.stamina });
    }
});
