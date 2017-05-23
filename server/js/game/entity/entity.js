/* global module */

var cls = require('../../lib/class'),
    Messages = require('../../network/messages'),
    Mobs = require('../../util/mobs');

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
        var self = this;

        return [
            self.type,
            self.instance,
            Mobs.getNameFromId(self.id),
            Mobs.getMobNameFromId(self.id),
            self.x,
            self.y
        ];
    }

});