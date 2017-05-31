define(['../entity'], function(Entity) {

    return Entity.extend({

        init: function(id, kind, count, skill, skillLevel) {
            var self = this;

            self._super(id, kind);

            self.count = count;
            self.skill = skill;
            self.skillLevel = skillLevel;

            self.dropped = false;
        },

        idle: function() {
            this.setAnimation('idle', 150);
        },

        setName: function(name) {
            this._super(name);
        },

        setAnimation: function(name, speed, count) {
            this._super(name, speed, count);
        },

        setGridPosition: function(x, y) {
            this._super(x, y);
        },

        setSprite: function(sprite) {
            this._super(sprite);
        },

        hasShadow: function() {
            return true;
        }

    });

});