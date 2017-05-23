var cls = require('../../../../lib/class');

module.exports = MobHandler = cls.Class.extend({

    init: function(world, mob) {
        var self = this;

        self.world = world;
        self.mob = mob;

        self.load();
    },

    load: function() {
        var self = this;

        self.mob.onMove(function() {
            self.mob.dead = false;
            self.world.addMob(self.mob);
        });
    }

});