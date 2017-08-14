var cls = require('../../../../../lib/class'),
    Items = require('../../../../../util/items');

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

    enchant: function(item, shards) {
        /*var self = this;

        if (!item || !shard)
            return;

        var type = Items.getType(item.id);

        if (type === 'object' || type === 'craft')
            return;

        var ability = Utils.randomInt(0, 100) < 5 * shard.tier;

        item.count = Utils.randomInt(1, shard.tier < 5 ? 5 * shard.tier : 35);

        if (shard.tier !== 1 && ability) {

            if (item.ability && item.abilityLevel < 5) {
                item.abilityLevel++;

                log.info(item);

                return;
            }

            switch (type) {
                case 'weapon':

                    item.ability = Utils.randomInt(0, 1);

                    break;

                case 'weaponarcher':

                    item.ability = Utils.randomInt(3, 4);

                    break;

                case 'armour':
                case 'armorarcher':

                    item.ability = Modules.Enchantment.Splash;

                    break;

            }

        }

        log.info(item);*/
    },

    add: function(type, index) {
        var self = this;

    },

    remove: function(type) {
        var self = this;

        if (type === 'item')
            self.selectedItem = null;
        else if (type === 'shards')
            self.selectedShards = null;
    }

});