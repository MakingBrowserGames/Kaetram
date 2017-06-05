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

        self.retaliate = false;

        self.queue = new CombatQueue();

        self.attacking = false;

        self.attackTimeout = null;
        self.followTimeout = null;

        self.tick();
    },

    tick: function() {
        var self = this;

        self.attackTimeout = setInterval(function() {
            if (!self.world || !self.queue)
                return;

            if (self.character.hasTarget() && self.inProximity()) {
                if (self.queue.hasQueue())
                    self.world.pushBroadcast(new Messages.Combat(Packets.CombatOpcode.Hit, self.character.instance, self.character.target.instance, self.queue.getHit()));

                if (!self.character.target.isDead())
                    self.attack(self.character.target);
            } else
                self.queue.clear();

        }, self.character.attackRate);

        self.followTimeout = setInterval(function() {
            if (self.character.hasTarget() && !self.inProximity()) {
                var attacker = self.getClosestAttacker();

                if (attacker)
                    self.world.pushBroadcast(new Messages.Movement(self.character.instance, Packets.MovementOpcode.Follow, false, false, null, null, attacker.instance));
            }

        }, 400);
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

        if (!self.isAttacked())
            return;

        return character.instance in self.attackers;
    },

    isAttacked: function() {
        return Object.keys(this.attackers).length > 0;
    },

    isRetaliating: function() {
        return Object.keys(this.attackers).length === 0 && this.retaliate;
    },

    inProximity: function() {
        var self = this,
            targetDistance = self.character.getDistance(self.character.target),
            attackRange = self.character.attackRange,
            isRanged = targetDistance > 1;

        if (self.character.attackRange > 1)
            return self.character.getDistance(self.character.target) <= self.character.attackRange;

        return isRanged ? targetDistance <= attackRange : self.character.isNonDiagonal(self.character.target);
    },

    canFollow: function(character) {
        var self = this;

        if (self.character.type !== 'mob')
            return true;

        return self.character.spawnDistance > self.character.getDistance(character);
    },

    getClosestAttacker: function() {
        var self = this,
            closest = null,
            lowestDistance = 100;

        self.forEachAttacker(function(attacker) {
            var distance = self.character.getDistance(attacker);

            if (distance < lowestDistance)
                closest = attacker;
        });

        return closest;
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