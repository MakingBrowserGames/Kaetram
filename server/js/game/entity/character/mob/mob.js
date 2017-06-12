var Character = require('../character'),
    Mobs = require('../../../../util/mobs');

module.exports = Mob = Character.extend({

    init: function(id, instance, x, y) {
        var self = this;

        self._super(id, 'mob', instance, x, y);

        self.data = Mobs.Ids[self.id];
        self.hitPoints = self.data.hitPoints;
        self.maxHitPoints = self.data.hitPoints;

        self.respawnDelay = self.data.spawnDelay;

        self.armourLevel = self.data.armour;
        self.weaponLevel = self.data.weapon;
        self.attackRange = self.data.attackRange;

        self.spawnLocation = [x, y];

        self.dead = false;
        self.boss = false;
        self.static = false;
    },

    destroy: function() {
        var self = this;

        self.dead = true;
        self.clearTarget();
        self.resetPosition();
        self.respawn();
    },

    return: function() {
        var self = this;

        self.clearTarget();
        self.resetPosition();
        self.move(self.x, self.y);
    },

    isRanged: function() {
        return this.attackRange > 1;
    },

    distanceToSpawn: function() {
        return this.getCoordDistance(this.spawnLocation[0], this.spawnLocation[1]);
    },

    isAtSpawn: function() {
        return this.x === this.spawnLocation[0] && this.y === this.spawnLocation[1];
    },

    respawn: function() {
        var self = this;

        if (!self.static)
            return;

        setTimeout(function() {
            if (self.respawnCallback)
                self.respawnCallback();

        }, self.respawnDelay);
    },

    getState: function() {
        var self = this,
            base = self._super();

        base.push(self.hitPoints, self.maxHitPoints);

        return base;
    },

    resetPosition: function() {
        var self = this;

        self.setPosition(self.spawnLocation[0], self.spawnLocation[1]);
    },

    onRespawn: function(callback) {
        this.respawnCallback = callback;
    },

    onMove: function(callback) {
        this.moveCallback = callback;
    },

    move: function(x, y) {
        var self = this;

        self.setPosition(x, y);

        if (self.moveCallback)
            self.moveCallback(self);
    }

});