var Quest = require('../quest');

module.exports = Introduction = Quest.extend({

    init: function(player, data) {
        var self = this;

        self.player = player;
        self.data = data;

        self._super(data.id, data.name, data.description);

        log.info('Initialized introduction quest.');
    }

});