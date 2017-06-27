var cls = require('../../../../../lib/class');

module.exports = Slot = cls.Class.extend({

    init: function(index) {
        var self = this;

        self.index = index;
        self.id = -1;
        self.count = -1;
        self.ability = -1;
        self.abilityLevel = -1;
    },

    load: function(id, count, ability, abilityLevel) {
        var self = this;

        self.id = id;
        self.count = count;
        self.ability = ability;
        self.abilityLevel = abilityLevel;
    },

    empty: function() {
        var self = this;

        self.id = -1;
        self.count = -1;
        self.ability = -1;
        self.abilityLevel = -1;
    },

    increment: function(amount) {
        this.count += amount;
    },

    decrement: function(amount) {
        this.count -= amount;
    }

});