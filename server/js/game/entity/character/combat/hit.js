var cls = require('../../../../lib/class');

module.exports = Hit = cls.Class.extend({

    init: function(type, damage) {
        var self = this;

        self.type = type;
        self.damage = damage;
    },

    getDamage: function() {
        return this.damage;
    },

    getType: function() {
        return this.type;
    },

    getData: function() {
        return [this.damage, this.type];
    }

});