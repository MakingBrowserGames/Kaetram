define(function() {

    return Class.extend({

        init: function(index) {
            var self = this;

            self.index = index;

            self.string = null;
            self.count = -1;
            self.ability = -1;
            self.abilityLevel = -1;
        },

        load: function(string, count, ability, abilityLevel) {
            var self = this;

            self.string = string;
            self.count = count;
            self.ability = ability;
            self.abilityLevel = abilityLevel;
        },

        empty: function() {
            var self = this;

            self.string = null;
            self.count = -1;
            self.ability = -1;
            self.abilityLevel = -1;
        },

        isEmpty: function() {
            return this.string === null || this.count === -1;
        },

        setCount: function(count) {
            this.count = count;
        }

    });

});