var Entity = require('../entity');

module.exports = NPC = Entity.extend({

    init: function(id, instance, x, y) {
        var self = this;

        self._super(id, 'npc', instance, x, y);
    }

});