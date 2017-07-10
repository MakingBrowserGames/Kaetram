/* global log */

var cls = require('../../../../../lib/class'),
    _ = require('underscore'),
    Slot = require('./slot'),
    Items = require('../../../../../util/items');

module.exports = Container = cls.Class.extend({

    /**
     * Why split bank and inventory into two
     * classes with a similar functionality
     * when we have our lord and saviour - OOP Programming.
     */

    init: function(type, owner, size) {
        var self = this;

        self.type = type;
        self.owner = owner;
        self.size = size;

        self.slots = [];

        for (var i = 0; i < self.size; i++)
            self.slots.push(new Slot(i));
    },

    load: function(ids, counts, abilities, abilityLevels) {
        var self = this;

        /**
         * Fill each slot with data from the database
         */

        if (ids.length !== self.slots.length)
            log.error('[' + self.type + '] Mismatch in container size.');

        for (var i = 0; i < self.slots.length; i++)
            self.slots[i].load(ids[i], counts[i], abilities[i], abilityLevels[i]);

    },

    add: function(id, count, ability, abilityLevel) {
        var self = this;

        if (!id || count < 0)
            return;

        if (self.contains(id) && Items.isStackable(id)) {
            var sSlot = self.getSlot(id);

            sSlot.increment(count);

            return sSlot;
        } else {

            /**
             * Double checking. This should never be called without
             * checking the external (subclass) class for empty space.
             */

            if (!self.hasSpace())
                return;

            var slot = self.slots[self.getEmptySlot()];

            slot.load(id, count, ability, abilityLevel);

            return slot;
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

            for (var i = 0; i < count; i++)
                slots[i].empty();
        }
    },

    getSlot: function(id) {
        var self = this;

        for (var i = 0; i < self.slots.length; i++)
            if (self.slots[i].id === id)
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