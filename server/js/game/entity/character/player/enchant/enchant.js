var cls = require('../../../../../lib/class');
module.exports = Enchant = cls.Class.extend({

    /**
     * Enchantment will base itself on tiers of shards.
     * 10 of each shards will move the shard to the next level,
     * but the probability of gaining a higher ability is harder.
     *
     * When the player has 10 or more shards, they can be taken to an enchantment table
     * to convert them into higher tier shards.
     *

     */


    init: function(player, shards) {
        var self = this;

        self.player = player;
    },

    enchant: function(item) {
        var self = this;


    }

});