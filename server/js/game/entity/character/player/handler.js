var cls = require('../../../../lib/class');

module.exports = Handler = cls.Class.extend({

    init: function(character) {
        var self = this;

        self.character = character;

        self.movementInterval = null;

        self.updateMovement();
    },

    updateMovement: function() {
        var self = this;


    }

});