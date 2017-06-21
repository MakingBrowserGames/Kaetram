var cls = require('../../../../../lib/class');

module.exports = Abilities = cls.Class.extend({

    init: function() {
        var self = this;

        self.abilities = {};
        self.shortcuts = {};
    }

});