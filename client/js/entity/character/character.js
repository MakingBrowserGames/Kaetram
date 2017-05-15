/* global _ */

define(['../entity'], function(Entity) {

    return Entity.extend({

        init: function(id, kind) {
            var self = this;

            self._super(id, kind);

            self.nextGridX = -1;
            self.nextGridY = -1;
            self.prevGridX = -1;
            self.prevGridY = -1;

            self.orientation = Modules.Orientation.Down;

            self.hitPoints = -1;
            self.maxHitPoints = -1;
            self.mana = -1;
            self.maxMana = -1;

            self.moving = false;
        },

        animate: function(animation, speed, count, onEndCount) {
            var self = this,
                o = ['atk', 'walk', 'idle'],
                orientation = self.orientation;

            if (self.currentAnimation && self.currentAnimation.name === 'death')
                return;

            self.spriteFlipX = false;
            self.spriteFlipY = false;

            if (_.indexOf(o, animation) >= 0) {
                animation += '_' + (orientation === Modules.Orientation.Left ? 'right' : self.orientationToString(orientation));
                self.spriteFlipX = self.orientation === Modules.Orientation.Left;
            }

            self.setAnimation(animation, speed, count, onEndCount);
        },

        orientationToString: function(o) {
            var oM = Modules.Orientation;

            switch(o) {
                case oM.Left:
                    return 'left';

                case oM.Right:
                    return 'right';

                case oM.Up:
                    return 'up';

                case oM.Down:
                    return 'down';
            }
        },

        hasShadow: function() {
            return true;
        },

        setGridPosition: function(x, y) {
            this._super(x, y);
        },

        onMove: function(callback) {
            this.moveCallback = callback;
        }
    });

});