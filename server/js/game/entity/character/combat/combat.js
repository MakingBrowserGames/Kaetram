var cls = require('../../../../lib/class'),
    CombatQueue = require('./combatqueue'),
    Player = require('../player/player'),
    Utils = require('../../../../util/utils'),
    Formulas = require('../../../formulas'),
    _ = require('underscore'),
    Hit = require('./hit'),
    Modules = require('../../../../util/modules'),
    Messages = require('../../../../network/messages'),
    Packets = require('../../../../network/packets');

module.exports = Combat = cls.Class.extend({

    init: function(character) {
        var self = this;

        self.character = character;
        self.world = null;

        self.attackers = {};

        self.cooldown = false;

        self.queue = new CombatQueue();

        self.attacking = false;

        self.tick();
    },

    tick: function() {
        var self = this;

        setInterval(function() {
            if (!self.queue.hasQueue() || !self.world)
                return;

            if (self.character.hasTarget()) {
                self.world.pushBroadcast(new Messages.Combat(Packets.CombatOpcode.Hit, self.character.instance, self.character.target.instance, self.queue.getHit()));

                if (!self.character.target.isDead())
                    self.attack(self.character.target);

            } else
                self.queue.clear();

        }, 1000);
    },

    attack: function(target) {
        var self = this,
            hit = new Hit(Modules.Hits.Damage, Formulas.getDamage(self.character, target));

        self.queue.add(hit);
    },

    addAttacker: function(character) {
        var self = this;

        if (self.hasAttacker(character))
            return;

        self.attackers[character.instance] = character;
    },

    removeAttacker: function(character) {
        var self = this;

        if (self.hasAttacker(character))
            delete self.attackers[character.instance];
    },

    hasAttacker: function(character) {
        var self = this;

        if (self.attackers.size ===  0)
            return;

        return character.instance in self.attackers;
    },

    setWorld: function(world) {
        var self = this;

        if (!self.world)
            self.world = world;
    },

    forEachAttacker: function(callback) {
        _.each(this.attackers, function(attacker) {
            callback(attacker);
        });
    }

});