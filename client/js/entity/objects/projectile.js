define(['../entity'], function(Entity) {

    return Entity.extend({

        init: function(id, kind, owner) {
            var self = this;

            self._super(id, kind);

            self.owner = owner;

            self.startX = -1;
            self.startY = -1;

            self.destX = -1;
            self.destY = -1;

            self.static = false;
            self.dynamic = false;
        },

        setSprite: function(sprite) {
            this._super(sprite);
        },

        setAnimation: function(name, speed, count, onEndCount) {
            this._super(name, speed, count, onEndCount);
        },

        setStart: function(x, y) {
            var self = this;

            self.setGridPosition(x, y);

            self.startX = x;
            self.startY = y;
        },

        setDestination: function(x, y) {
            var self = this;

            self.static = true;

            self.destX = x;
            self.destY = y;
        },

        setTarget: function(target) {
            var self = this;

            if (!target)
                return;

            self.dynamic = true;

            self.destX = target.x;
            self.destY = target.y;

            target.onMove(function() {
                self.destX = target.x;
                self.destY = target.y;
            });
        },

        updateTarget: function(x, y) {
            var self = this;

            self.destX = x;
            self.destY = y;
        }


    });

});