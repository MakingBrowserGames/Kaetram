var cls = require('../../../../lib/class');

module.exports = Handler = cls.Class.extend({

    init: function(player) {
        var self = this;

        self.player = player;
        self.world = player.world;

        self.load();
    },

    load: function() {
        var self = this;

        self.player.onMovement(function(x, y) {
            self.player.checkGroups();
        });

        self.player.onGroup(function() {

            log.info('Updating groups!');
            self.world.handleEntityGroup(self.player);
            self.world.pushEntities(self.player);
        });

        self.player.connection.onClose(function() {
            self.world.removePlayer(self.player);
        });
    }

});