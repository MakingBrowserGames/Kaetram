/* global module */

var Entity = require('../entity');

module.exports = Character = Entity.extend({

    init: function(name) {
        var self = this;

        self.name = name;
        self.level = -1;

        self.movementSpeed = 150;
        self.attackRange = 1;
        self.attackRate = 1000;

        self.previousX = -1;
        self.previousY = -1;
    }

});