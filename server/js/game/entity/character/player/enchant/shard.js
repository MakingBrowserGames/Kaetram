var cls = require('../../../../../lib/class');

module.exports = Shard = cls.Class.extend({

    init: function(count) {
        var self = this;

        self.count = count;
        self.tier = 1;

        self.convert();
    },

    convert: function() {
        var self = this;

        if (self.count > 10)
            self.tier = 2;

        if (self.count > 100)
            self.tier = 3;

        if (self.count > 1000)
            self.tier = 4;

        if (self.count > 10000)
            self.tier = 5;
    }

});