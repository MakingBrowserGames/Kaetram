var cls = require('../../../../../lib/class'),
    Items = require('../../../../../util/items');

module.exports = Equipment = cls.Class.extend({

    /**
     * Count represents the enchantment level of
     * the equipment child
     */

    init: function(name, id, count, skill, skillLevel) {
        var self = this;

        self.name = name;
        self.id = id;
        self.count = count ? count : 0;
        self.skill = skill ? skill : 0;
        self.skillLevel = skillLevel ? skillLevel : 0;
    },

    getName: function() {
        return this.name;
    },

    getId: function() {
        return this.id;
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

    getData: function() {
        return [Items.idToString(this.id), Items.idToName(this.id), this.count, this.skill, this.skillLevel];
    }

});