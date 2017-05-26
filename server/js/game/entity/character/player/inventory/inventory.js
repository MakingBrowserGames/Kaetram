var cls = require('../../../../../lib/class');

module.exports = Inventory = cls.Class.extend({

    init: function(size) {
        var self = this;

        self.size = size;
    }

});