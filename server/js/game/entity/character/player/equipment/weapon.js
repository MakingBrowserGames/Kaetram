var Equipment = require('./equipment'),
    Items = require('../../../../../util/items');

module.exports = Weapon = Equipment.extend({

    init: function(name, id, count, skill, skillLevel) {
        var self = this;

        self._super(name, id, count, skill, skillLevel);

        self.level = Items.getWeaponLevel(name);
        self.ranged = Items.isArcherWeapon(name);
    },

    isRanged: function() {
        return this.ranged;
    },

    setLevel: function(level) {
        this.level = level;
    },

    getLevel: function() {
        return this.level;
    }

});