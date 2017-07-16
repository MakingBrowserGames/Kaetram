/* global log */

var Container = require('../container'),
    Messages = require('../../../../../../network/messages'),
    Packets = require('../../../../../../network/packets'),
    Constants = require('./constants'),
    _ = require('underscore'),
    Items = require('../../../../../../util/items');

module.exports = Inventory = Container.extend({

    /**
     * Not particularly sure whether or not this class will
     * require an update function to push any updates
     * of the inventory to the client. This is just a baseline
     * setup for the inventory until the interface is done.
     */

    init: function(owner, size) {
        var self = this;

        self._super('Inventory', owner, size);
    },

    load: function(ids, counts, abilities, abilityLevels) {
        var self = this;

        self._super(ids, counts, abilities, abilityLevels);

        self.owner.send(new Messages.Inventory(Packets.InventoryOpcode.Batch, [self.size, self.slots]))
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
            self.owner.send(new Messages.Notification(Packets.NotificationOpcode.Text, Constants.InventoryFull));
            return;
        }

        var slot = self._super(item.id, parseInt(item.count), item.ability, item.abilityLevel);

        self.owner.send(new Messages.Inventory(Packets.InventoryOpcode.Add, slot));

        self.owner.save();

        self.owner.world.removeItem(item);
    },

    remove: function(id, count, index) {
        var self = this;

        if (!self._super(index, id, count))
            return;

        self.owner.send(new Messages.Inventory(Packets.InventoryOpcode.Remove, {
            index: index,
            count: count
        }));

        self.owner.save();

        self.owner.world.dropItem(id, count, self.owner.x, self.owner.y);
    },

    check: function() {
        var self = this;

        _.each(self.slots, function(slot) {
            if (isNaN(slot.id))
                slot.empty();
        })
    }

});