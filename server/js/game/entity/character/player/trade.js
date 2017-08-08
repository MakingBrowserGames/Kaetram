var cls = require('../../../../lib/class');

module.exports = Trade = cls.Class.extend({

    init: function(player, oPlayer) {
        var self = this;

        self.player = player;
        self.oPlayer = oPlayer;

        self.playerItems = [];
        self.oPlayerItems = [];

        self.state = null;
    },

    select: function() {

    },

    accept: function() {

    },

    decline: function() {

    }

});