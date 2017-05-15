define(['../entity'], function(Entity) {

    return Entity.extend({

        init: function(id, kind) {
            var self = this;

            self._super(id, kind);

            self.wasDropped = false;
        },

        hasShadow: function() {
            return true;
        }

    });

});