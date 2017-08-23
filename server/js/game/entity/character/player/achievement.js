var cls = require('../../../../lib/class'),
    Data = require('../../../../../data/achievements.json');

module.exports = Achievement = cls.Class.extend({

    init: function(id, player) {
        var self = this;

        self.id = id;
        self.player = player;

        self.progress = -1;

        self.data = Data[self.id];
    },

    setProgress: function() {

    }

});