/* global log */

var cls = require('../../../../../lib/class'),
    Slot = require('./slot'),
    Items = require('../../../../../util/Items'),
    _ = require('underscore');

module.exports = Inventory = cls.Class.extend({

    /**
     * Not particularly sure whether or not this class will
     * require an update function to push any updates
     * of the inventory to the client. This is just a baseline
     * setup for the inventory until the interface is done.
     */

    init: function(owner, size) {
        var self = this;

        self.owner = owner;
        self.size = size;

        self.slots = [];

        /**
         * Initialize the empty containers
         */

        for (var i = 0; i < self.size; i++)
            self.slots.push(new Slot(i));
    },

    load: function(ids, counts, abilities, abilityLevels) {
        var self = this;

        /**
         * Plug data into the containers accordingly.
         */

        if (ids.length !== self.slots.length)
            log.error('Mismatch in inventory size!');

        for (var i = 0; i < self.slots.length; i++)
            self.slots[i].load(ids[i], counts[i], abilities[i], abilityLevels[i]);

    },

    add: function(id, count, ability, abilityLevel) {
        var self = this;

        if (!id || count < 0)
            return;

        if (self.contains(id) && Items.isStackable(id))
            self.getSlot(id).increment(count);
        else {

            /**
             * Double checking. This should never be called without
             * checking outside this class for empty space.
             */

            if (!self.hasSpace())
                return;

            self.slots[self.getEmptySlot()].load(id, count, ability, abilityLevel);
        }
    },

    remove: function(id, count) {
        var self = this;

        if (!id || count < 0 || !self.contains(id))
            return;

        if (Items.isStackable(id)) {
            var slot = self.getSlot(id);

            if (count >= slot.count)
                slot.empty();
            else
                slot.decrement(count);
        } else {
            var slots = self.getSlots(id);

            _.each(slots, function(slot) {
                slot.empty();
            });
        }
    },

    getSlot: function(id) {
        var self = this;

        for (var i = 0; i < self.slots.length; i++)
            if (self.slots[i] === id)
                return self.slots[i];

        return null;
    },

    getSlots: function(id) {
        var self = this,
            slots = [];

        for (var i = 0; i < self.slots.length; i++)
            if (self.slots[i] === id)
                slots.push(self.slots[i]);

        return slots;
    },

    contains: function(id) {
        var self = this;

        for (var i = 0; i < self.slots.length; i++)
            if (self.slots[i].id === id)
                return true;

        return false;
    },

    hasSpace: function() {
        return this.getEmptySlot() > -1;
    },

    getEmptySlot: function() {
        var self = this;

        for (var i = 0; i < self.slots.length; i++)
            if (self.slots[i].id === -1)
                return i;

        return -1;
    },

    getArray: function() {
        var self = this,
            ids = '',
            counts = '',
            abilities = '',
            abilityLevels = '';

        for (var i = 0; i < self.slots.length; i++) {
            var isLast = i === self.slots.length - 1;

            ids += self.slots[i].id + ' ';
            counts += self.slots[i].count + ' ';
            abilities += self.slots[i].ability + ' ';
            abilityLevels += self.slots[i].abilityLevel + ' ';
        }

        return {
            username: self.owner.username,
            ids: ids.slice(0, -1),
            counts: counts.slice(0, -1),
            abilities: abilities.slice(0, -1),
            abilityLevels: abilityLevels.slice(0, -1)
        }

    }

});