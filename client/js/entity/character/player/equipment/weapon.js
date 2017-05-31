define(['./equipment'], function(Equipment) {

    return Equipment.extend({

        init: function(name, string, count, skill, skillLevel) {
            var self = this;

            self._super(name, string, count, skill, skillLevel);

            self.level = -1;
            self.damage = -1;
        },

        exists: function() {
            return this._super();
        },

        setDamage: function(damage) {
            this.damage = damage;
        },

        setLevel: function(level) {
            this.level = level;
        },

        getDamage: function() {
            return this.damage;
        },

        getLevel: function() {
            return this.level;
        },

        update: function(name, string, count, skill, skillLevel) {
            this._super(name, string, count, skill, skillLevel);
        }

    });

});