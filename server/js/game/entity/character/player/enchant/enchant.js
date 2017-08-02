var cls = require('../../../../../lib/class'),
    Shard = require('./shard');

module.exports = Enchant = cls.Class.extend({

    /**
     * Enchantment will base itself on tiers of shards.
     * 10 of each shards will move the shard to the next level,
     * but the probability of gaining a higher ability is harder.
     *
     * When the player has 10 or more shards, they can be taken to an enchantment table
     * to convert them into higher tier shards.
     *
     * Tier 1 - Damage boost (1-5)
     * Tier 2 - Damage boost (1-10 & 10% for special ability or special ability level up)
     * Tier 3 - Damage boost (1-15% & 15% for special ability or special ability level up)
     * Tier 4 - Damage boost (1-25% & 20% for special ability or special ability level up)
     * Tier 5 - Damage boost (1-40% & 25% for special ability or special ability level up)
     */


    init: function(player, shards) {
        var self = this;

        self.player = player;
        self.shards = new Shard(shards);
    },

    enchant: function(id) {
        var self = this;

        
    }

});