define(['./equipment'], function(Equipment) {

    return Equipment.extend({

        init: function(name, string, count, skill, skillLevel) {
            var self = this;

            self._super(name, string, count, skill, skillLevel);
        },

        update: function(name, string, count, skill, skillLevel) {
            this._super(name, string, count, skill, skillLevel);
        }

    });

});