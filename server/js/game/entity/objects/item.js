var Entity = require('../entity');

module.exports = Item = Entity.extend({

    init: function(id, instance, x, y) {
        var self = this;

        self._super(id, 'item', instance, x, y);

        self.static = false;
        self.fromChest = false;

        self.count = 1;
        self.skill = 0;
        self.skillLevel = 0;

        self.respawnTime = 30000;
        self.despawnDuration = 4000;
        self.blinkDelay = 20000;
        self.despawnDelay = 1000;

        self.blinkTimeout = null;
        self.despawnTimeout = null;
    },

    destroy: function() {
        var self = this;

        if (self.blinkTimeout)
            clearTimeout(self.blinkTimeout);

        if (self.despawnTimeout)
            clearTimeout(self.despawnTimeout);

        if (self.static)
            self.respawn();
    },

    despawn: function() {
        var self = this;

        self.blinkTimeout = setTimeout(function() {
            if (self.blinkCallback)
                self.blinkCallback();

            self.despawnTimeout = setTimeout(function() {
                if (self.despawnCallback)
                    self.despawnCallback();

            }, self.despawnDuration);

        }, self.blinkDelay);
    },

    respawn: function() {
        var self = this;

        setTimeout(function() {
            if (self.respawnCallback)
                self.respawnCallback();
        }, self.respawnTime);
    },

    getState: function() {
        var self = this,
            state = self._super();

        state.push(self.count, self.skill, self.skillLevel);

        return state;
    },

    setCount: function(count) {
        this.count = count;
    },

    setSkill: function(skill) {
        this.skill = skill;
    },

    setSkillLevel: function(skillLevel) {
        this.skillLevel = skillLevel;
    },

    onRespawn: function(callback) {
        this.respawnCallback = callback;
    },

    onBlink: function(callback) {
        this.blinkCallback = callback;
    },

    onDespawn: function(callback) {
        this.despawnCallback = callback;
    }

});