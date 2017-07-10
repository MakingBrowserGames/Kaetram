/* global log */

var Container = require('../container'),
    Messages = require('../../../../../../network/messages'),
    Packets = require('../../../../../../network/packets'),
    Constants = require('./constants');

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

        if (!self.hasSpace()) {
            self.owner.send(new Messages.Notification(Packets.NotificationOpcode.Ok, Constants.InventoryFull));
            return;
        }

        self._super(item.id, item.count, item.ability, item.abilityLevel);

        self.owner.send(new Messages.Inventory(Packets.InventoryOpcode.Add, item.getData()));

        self.owner.save();

        self.owner.world.removeItem(item);
    }

});