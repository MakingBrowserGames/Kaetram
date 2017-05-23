define(['../character'], function(Character) {

    return Character.extend({

        init: function(id, kind) {
            var self = this;

            self._super(id, kind);

            self.name = name;
        },

        performAction: function(orientation, action) {
            this._super(orientation, action);
        },

        setSprite: function(sprite) {
            this._super(sprite);
        },

        setName: function(name) {
            this.name = name;
        },

        setGridPosition: function(x, y) {
            this._super(x, y);
        }

    });

});