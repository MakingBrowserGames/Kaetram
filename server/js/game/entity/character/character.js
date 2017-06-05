/* global module */

var Entity = require('../entity'),
    _ = require('underscore'),
    Combat = require('./combat/combat');

module.exports = Character = Entity.extend({

    init: function(id, type, instance, x, y) {
        var self = this;

        self._super(id, type, instance, x, y);

        self.level = -1;

        self.movementSpeed = 150;
        self.attackRange = 1;
        self.attackRate = 1000;

        self.spawnDistance = 7;

        self.previousX = -1;
        self.previousY = -1;

        self.hitPoints = -1;

        self.dead = false;

        self.target = null;
        self.potentialTarget = null;

        self.combat = new Combat(self);
    },

    isDead: function() {
        return this.hitPoints < 1 || this.dead;
    },

    getCombat: function() {
        return this.combat;
    },

    setPosition: function(x, y) {
        var self = this;

        self._super(x, y);

        if (self.movementCallback)
            self.movementCallback(x, y);
    },

    setTarget: function(target) {
        var self = this;

        self.target = target;

        if (self.targetCallback)
            self.targetCallback(target);
    },

    setPotentialTarget: function(potentialTarget) {
        this.potentialTarget = potentialTarget;
    },

    removeTarget: function() {
        var self = this;

        if (self.removeTargetCallback)
            self.removeTargetCallback();

        self.target = null;
    },

    hasTarget: function() {
        return !(this.target === null);
    },

    hasPotentialTarget: function(potentialTarget) {
        return this.potentialTarget === potentialTarget;
    },

    clearTarget: function() {
        this.target = null;
    },

    onTarget: function(callback) {
        this.targetCallback = callback;
    },

    onRemoveTarget: function(callback) {
        this.removeTargetCallback = callback;
    },

    onMovement: function(callback) {
        this.movementCallback = callback;
    }

});