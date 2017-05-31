/* global module */

var cls = require('../../lib/class'),
    Messages = require('../../network/messages'),
    Mobs = require('../../util/mobs'),
    NPCs = require('../../util/npcs'),
    Items = require('../../util/items');

module.exports = Entity = cls.Class.extend({

    init: function(id, type, instance, x, y) {
        var self = this;

        self.id = id;
        self.type = type;
        self.instance = instance;

        self.x = x;
        self.y = y;

        self.recentGroups = [];
    },

    drop: function(item) {
        return new Messages.Drop(this, item);
    },

    isPlayer: function() {
        return this.type === 'player';
    },

    isMob: function() {
        return this.type === 'mob';
    },

    isNPC: function() {
        return this.type === 'npc';
    },

    isItem: function() {
        return this.type === 'item';
    },

    setPosition: function(x, y) {
        var self = this;

        self.x = x;
        self.y = y;
    },

    getType: function() {
        return this.type;
    },

    getState: function() {
        var self = this,
            string = self.isMob() ? Mobs.idToString(self.id) : (self.isNPC() ? NPCs.idToString(self.id) : Items.idToString(self.id)),
            name = self.isMob() ? Mobs.idToName(self.id) : (self.isNPC() ? NPCs.idToName(self.id) : Items.idToName(self.id));

        return [
            self.type,
            self.instance,
            string,
            name,
            self.x,
            self.y
        ];
    }

});