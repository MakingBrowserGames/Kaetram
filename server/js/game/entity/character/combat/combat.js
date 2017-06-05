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

        self.first = false;

        self.start();
    },

    start: function() {
        var self = this;

        self.attackTimeout = setInterval(function() { self.parseAttack(); }, self.character.attackRate);

        self.followTimeout = setInterval(function() { self.parseFollow(); }, 400);
    },

    stop: function() {
        var self = this;

        clearTimeout(self.attackTimeout);
        clearTimeout(self.followTimeout);

        self.attackTimeout = null;
        self.followTimeout = null;
    },

    parseAttack: function() {
        var self = this;

        if (!self.world || !self.queue)
            return;

        if (self.character.hasTarget() && self.inProximity()) {
            if (self.queue.hasQueue())
                self.world.pushBroadcast(new Messages.Combat(Packets.CombatOpcode.Hit, self.character.instance, self.character.target.instance, self.queue.getHit()));

            if (!self.character.target.isDead())
                self.attack(self.character.target);
        } else
            self.queue.clear();
    },

    parseFollow: function() {
        var self = this;

        if (self.onSameTile()) {
            var position = self.getNewPosition();

            self.world.pushBroadcast(new Messages.Movement(self.character.instance, Packets.MovementOpcode.Move, false, false, position.x, position.y))
        }

        if (self.character.hasTarget() && !self.inProximity() && (self.character.type === 'mob' || self.isRetaliating())) {
            var attacker = self.getClosestAttacker();

            if (attacker)
                self.world.pushBroadcast(new Messages.Movement(self.character.instance, Packets.MovementOpcode.Follow, false, false, null, null, attacker.instance));
        }
    },

    attack: function(target) {
        var self = this,
            hit = new Hit(Modules.Hits.Damage, Formulas.getDamage(self.character, target));

        self.queue.add(hit);
    },

    attackCount: function(count, target) {
        var self = this;

        for (var i = 0; i < count; i++)
            self.attack(new Hit(Modules.Hits.Damage, Formulas.getDamage(self.character, target)));
    },

    forceAttack: function() {
        var self = this;

        if (!self.character.target || !self.inProximity())
            return;

        self.stop();
        self.start();

        self.attackCount(2, self.character.target);
        self.world.pushBroadcast(new Messages.Combat(Packets.CombatOpcode.Hit, self.character.instance, self.character.target.instance, self.queue.getHit()));
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

    onSameTile: function() {
        var self = this;

        if (!self.character.target)
            return;

        return self.character.x === self.character.target.x && self.character.y === self.character.target.y;
    },

    isAttacked: function() {
        return Object.keys(this.attackers).length > 0;
    },

    getNewPosition: function() {
        var self = this,
            position = {
                x: self.character.x,
                y: self.character.y
            };

        var random = Utils.randomInt(0, 3);

        if (random === 0)
            position.x++;
        else if (random === 1)
            position.y--;
        else if (random === 2)
            position.x--;
        else if (random === 3)
            position.y++;

        return position;
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