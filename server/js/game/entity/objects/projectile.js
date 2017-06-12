var Entity = require('../entity');

module.exports = Projectile = Entity.extend({

    init: function(id, instance) {
        var self = this;

        self._super(id, 'projectile', instance);

        self.startX = -1;
        self.startY = -1;
        self.destX = -1;
        self.destY = -1;

        self.target = false;
        self.static = false;
    },

    setStart: function(x, y) {
        var self = this;

        self.x = x;
        self.y = y;
    },

    setTarget: function(target) {
        var self = this;

        self.target = true;

        self.destX = target.x;
        self.destY = target.y;

        target.onMovement(function(x, y) {
            self.destX = x;
            self.destY = y;

            if (self.destinationCallback)
                self.destinationCallback(self.destX, self.destY);
        });
    },

    setStaticTarget: function(x, y) {
        var self = this;

        self.static = true;

        self.destX = x;
        self.destY = y;
    },

    onDestinationUpdate: function(callback) {
        this.destinationCallback = callback;
    }

});