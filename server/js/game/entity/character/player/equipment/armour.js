var Equipment = require('./equipment'),
    Items = require('../../../../../util/items');

module.exports = Armour = Equipment.extend({

    init: function(name, id, count, skill, skillLevel) {
        var self = this;

        self._super(name, id, count, skill, skillLevel);

        self.defense = Items.getArmourLevel(name);
    },

    setDefense: function(defense) {
        this.defense = defense;
    },

    getDefense: function() {
        return this.defense;
    }

});