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

            self.detectAggro();
            self.detectMusic();
        });

        self.player.onDeath(function() {
            log.info('Whoop de doo I died.')
        });

        self.player.onGroup(function() {
            self.world.handleEntityGroup(self.player);
            self.world.pushEntities(self.player);
        });

        self.player.connection.onClose(function() {
            self.world.removePlayer(self.player);
        });
    },

    detectAggro: function() {
        var self = this,
            group = self.world.groups[self.player.group];

        if (!group)
            return;

        _.each(group.entities, function(entity) {
            if (entity && entity.type === 'mob') {
                var aggro = entity.canAggro(self.player);

                if (aggro)
                    entity.combat.begin(self.player);
            }
        });
    },

    detectMusic: function() {
        var self = this,
            musicArea = _.detect(self.world.getMusicAreas(), function(area) { return area.contains(self.player.x, self.player.y); });

        if (musicArea && self.player.currentSong !== musicArea.id)
            self.player.updateMusic(musicArea.id);
    }

});