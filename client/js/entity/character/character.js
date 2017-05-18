/* global _, Modules */

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

            self.dead = false;
            self.moving = false;

            /**
             * Non-game-breaking speeds
             */

            self.idleSpeed = 450;
            self.attackAnimationSpeed = 50;
            self.walkAnimationSpeed = 100;
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

        performAction: function(orientation, action) {
            var self = this;

            self.setOrientation(orientation);

            switch(action) {
                case Modules.Actions.Idle:
                    self.animate('idle', self.idleSpeed);
                    break;

                case Modules.Actions.Attack:
                    self.animate('atk', self.attackAnimationSpeed, 1);
                    break;

                case Modules.Actions.Walk:
                    self.animate('walk', self.walkAnimationSpeed);
                    break;
            }
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

        hasWeapon: function() {
            return false;
        },

        hasShadow: function() {
            return true;
        },

        setSprite: function(sprite) {
            this._super(sprite);
        },

        setOrientation: function(orientation) {
            this.orientation = orientation;
        },

        setGridPosition: function(x, y) {
            this._super(x, y);
        },

        onMove: function(callback) {
            this.moveCallback = callback;
        }
    });

});