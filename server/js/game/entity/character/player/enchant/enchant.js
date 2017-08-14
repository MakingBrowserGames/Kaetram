var cls = require('../../../../../lib/class'),
    Items = require('../../../../../util/items'),
    Messages = require('../../../../../network/messages'),
    Packets = require('../../../../../network/packets');

module.exports = Enchant = cls.Class.extend({

    /**
     * Tier 1 - Damage boost (1-5%)
     * Tier 2 - Damage boost (1-10% & 10% for special ability or special ability level up)
     * Tier 3 - Damage boost (1-15% & 15% for special ability or special ability level up)
     * Tier 4 - Damage boost (1-25% & 20% for special ability or special ability level up)
     * Tier 5 - Damage boost (1-40% & 25% for special ability or special ability level up)
     */


    init: function(player) {
        var self = this;

        self.player = player;

        self.selectedItem = null;
        self.selectedShards = null;
    },

    convert: function(shard) {
        var self = this;

        if (!Items.isShard(shard.id) || !self.player.inventory.hasSpace())
            return;

        var tier = Items.getShardTier(shard.id);

        if (shard.count < 11 && tier > 5)
            return;

        for (var i = 0; i < shard.count; i += 10) {
            self.player.inventory.remove(shard.id, 10, shard.index);

            self.player.inventory.add({
                id: shard.id + 1,
                count: 1,
                ability: -1,
                abilityLevel: -1
            });
        }

    },

    enchant: function() {
        var self = this;

        if (!self.selectedItem || !self.selectedShards || !self.verify())
            return;

        /**
         * Implement probabilities here based on the number of shards
         * and reason them out.
         */

        log.info(self.selectedItem);
        log.info(self.selectedShards);
    },
    
    verify: function() {
        return Items.isEnchantable(this.selectedItem.id) && Items.isShard(this.selectedShards.id);  
    },

    add: function(type, item) {
        var self = this,
            isItem = item === 'item';

        if (isItem && !Items.isEnchantable(item.id))
            return;

        if (type === 'item')
            self.selectedItem = item;
        else if (type === 'shards')
            self.selectedShards = item;

        self.player.send(new Messages.Enchant(Packets.EnchantOpcode.Select, {
            type: type,
            index: item.index
        }));
    },

    remove: function(type) {
        var self = this,
            index;

        if (type === 'item' && self.selectedItem)
            index = self.selectedItem.index;
        else if (type === 'shards' && self.selectedShards)
            index = self.selectedShards.index;

        self.player.send(new Messages.Enchant(Packets.EnchantOpcode.Remove, {
            type: type,
            index: index
        }));

        if (type === 'item')
            self.selectedItem = null;
        else if (type === 'shards')
            self.selectedShards = null;
    }

});