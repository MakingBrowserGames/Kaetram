var Container = require('../container');

module.exports = Slot = Container.extend({

    init: function(owner, size) {
        var self = this;

        self._super('Bank', owner, size);
    }

});