/* global log */

var cls = require('../../../../lib/class'),
    _ = require('underscore');

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

            var group = self.world.groups[self.player.group];

            if (!group)
                return;

            _.each(group.entities, function(entity) {
                if (entity && entity.type === 'mob') {
                    var aggro = entity.canAggro(self.player);

                    if (aggro)
                        entity.combat.begin(self.player);
                }
            });
        });

        self.player.onGroup(function() {
            self.world.handleEntityGroup(self.player);
            self.world.pushEntities(self.player);
        });

        self.player.connection.onClose(function() {
            self.world.removePlayer(self.player);
        });
    }

});