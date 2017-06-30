/* global log */

var Container = require('../container'),
    Messages = require('../../../../../../network/messages'),
    Packets = require('../../../../../../network/packets');

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

        self.owner.send(new Messages.Inventory(Packets.InventoryOpcode.Batch, self.slots))
    }

});