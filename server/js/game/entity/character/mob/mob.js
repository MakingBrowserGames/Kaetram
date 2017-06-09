var Character = require('../character'),
    Mobs = require('../../../../util/mobs');

module.exports = Mob = Character.extend({

    init: function(id, instance, x, y) {
        var self = this;

        self._super(id, 'mob', instance, x, y);

        self.data = Mobs.Ids[self.id];
        self.hitPoints = self.data.hitPoints;
        self.maxHitPoints = self.data.hitPoints;

        self.spawnLocation = [x, y];

        self.dead = false;
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

    distanceToSpawn: function() {
        return this.getCoordDistance(this.spawnLocation[0], this.spawnLocation[1]);
    },

    isAtSpawn: function() {
        return this.x === this.spawnLocation[0] && this.y === this.spawnLocation[1];
    },

    respawn: function() {

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