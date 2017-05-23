/* global module */

var Entity = require('../entity');

module.exports = Character = Entity.extend({

    init: function(id, type, instance, x, y) {
        var self = this;

        self._super(id, type, instance, x, y);

        self.level = -1;

        self.movementSpeed = 150;
        self.attackRange = 1;
        self.attackRate = 1000;

        self.previousX = -1;
        self.previousY = -1;

        self.target = null;
    },

    clearTarget: function() {
        this.target = null;
    }

});