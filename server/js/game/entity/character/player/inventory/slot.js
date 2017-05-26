var cls = require('../../../../../lib/class');

module.exports = Slot = cls.Class.extend({

    init: function(index, id, count, skill, skillLevel) {
        var self = this;

        self.index = index;
        self.id = id;
        self.count = count;
        self.skill = skill;
        self.skillLevel = skillLevel;
    }

});