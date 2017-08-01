var Container = require('../container'),
    Messages = require('../../../../../../network/messages'),
    Packets = require('../../../../../../network/packets'),
    _ = require('underscore'),
    Items = require('../../../../../../util/items');

module.exports = Slot = Container.extend({

    init: function(owner, size) {
        var self = this;

        self._super('Bank', owner, size);
    },

    load: function(ids, counts, abilities, abilityLevels) {
        var self = this;

        self._super(ids, counts, abilities, abilityLevels);

        self.owner.send(new Messages.Bank(Packets.BankOpcode.Batch, [self.size, self.slots]));
    },

    loadEmpty: function() {
        var self = this,
            ids = [],
            counts = [],
            abilities = [],
            abilityLevels = [];

        for (var i = 0; i < self.size; i++) {
            ids.push(-1);
            counts.push(-1);
            abilities.push(-1);
            abilityLevels.push(-1);
        }

        self.load(ids, counts, abilities, abilityLevels);
    },

    add: function(item) {
        var self = this;

        if (!self.hasSpace() && !(self.contains(item.id) && Items.isStackable(item.id))) {
            self.owner.send(new Messages.Notification(Packets.NotificationOpcode.Text, 'You do not have enough space in your bank.'))
            return;
        }

        var slot = self._super(item.id, parseInt(item.count), item.ability, item.abilityLevel);

        self.owner.send(new Messages.Bank(Packets.BankOpcode.Add, slot));

        self.owner.save();
        self.owner.world.removeItem(item);
    },

    remove: function(id, count, index) {
        var self = this;

        if (!self._super(index, id, count))
            return;

        self.owner.send(new Messages.Bank(Packets.BankOpcode.Remove, {
            index: index,
            count: count
        }));

        self.owner.save();
    }

});