define(function() {

    /**
     * The children of these classes are responsible for
     * clear and concise ways of organizing stats of weapons
     * in the client side. This does not dictate the damage,
     * defense or bonus stats, it's just for looks.
     */

    return Class.extend({

        init: function(name, string, count, skill, skillLevel) {
            var self = this;

            self.name = name;
            self.string = string;
            self.count = count;
            self.skill = skill;
            self.skillLevel = skillLevel;
        },

        getName: function() {
            return this.name;
        },

        getString: function() {
            return this.string;
        },

        getCount: function() {
            return this.count;
        },

        getSkill: function() {
            return this.skill;
        },

        getSkillLevel: function() {
            return this.skillLevel;
        },

        update: function(name, string, count, skill, skillLevel) {
            var self = this;

            self.name = name;
            self.string = string;
            self.count = count;
            self.skill = skill;
            self.skillLevel = skillLevel;
        }

    });

});