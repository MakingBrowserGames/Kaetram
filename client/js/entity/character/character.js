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
            self.following = false;
            self.attacking = false;
            self.interrupted = false;

            self.path = null;
            self.target = null;

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

        go: function(x, y) {
            var self = this;

            if (self.following) {
                self.following = false;
                self.target = null;
            }

            self.move(x, y);
        },

        proceed: function(x, y) {
            this.newDestination = {
                x: x,
                y: y
            }
        },

        nextStep: function() {
            var self = this,
                stop = false,
                x, y, path;

            self.prevGridX = self.gridX;
            self.prevGridY = self.gridY;

            if (!self.hasPath())
                return;

            if (self.beforeStepCallback)
                self.beforeStepCallback();

            if (!self.interrupted) {
                if (self.hasNextStep()) {
                    self.nextGridX = self.path[self.step + 1][0];
                    self.nextGridY = self.path[self.step + 1][1];
                }

                if (self.stepCallback)
                    self.stepCallback();

                if (self.changedPath()) {
                    x = self.newDestination.x;
                    y = self.newDestination.y;

                    path = self.requestPathfinding(x, y);

                    self.newDestination = null;

                    if (path.length < 2)
                        stop = true;
                    else
                        self.followPath(path);
                } else if (self.hasNextStep()) {
                    self.step++;
                    self.updateMovement();
                } else
                    stop = true;

            } else {
                stop = true;
                self.interrupted = false;
            }
        },

        updateMovement: function() {
            var self = this,
                step = self.step;

            if (self.path[step][0] < self.path[step - 1][0])
                self.performAction(Modules.Orientation.Left, Modules.Actions.Walk);

            if (self.path[step][0] > self.path[step - 1][0])
                self.performAction(Modules.Orientation.Right, Modules.Actions.Walk);

            if (self.path[step][1] < self.path[step - 1][0])
                self.performAction(Modules.Orientation.Up, Modules.Actions.Walk);

            if (self.path[step][1] > self.path[step - 1][1])
                self.performAction(Modules.Orientation.Down, Modules.Actions.Walk);
        },

        followPath: function(path) {
            var self = this;

            /**
             * Taken from TTA - this is to ensure the player
             * does not click on himself or somehow into another
             * dimension
             */
            if (path.length < 2)
                return;

            self.path = path;
            self.step = 0;

            if (self.following)
                path.pop();

            if (self.startPathingCallback)
                self.startPathingCallback(path);

            self.nextStep();
        },

        move: function(x, y) {
            var self = this;

            self.destination = {
                gridX: x,
                gridY: y
            };

            self.adjacentTiles = {};

            if (self.hasPath())
                self.proceed(x, y);
            else
                self.followPath(self.requestPathfinding(x, y));
        },

        requestPathfinding: function(x, y) {
            var self = this;

            if (self.requestPathCallback)
                return self.requestPathCallback(x, y);
        },

        hasWeapon: function() {
            return false;
        },

        hasShadow: function() {
            return true;
        },

        hasTarget: function() {
            return !!this.target;
        },

        hasPath: function() {
            return this.path !== null;
        },

        hasNextStep: function() {
            return (this.path.length - 1 > this.step);
        },

        changedPath: function() {
            return this.newDestination !== null;
        },

        isAttacking: function() {
            return this.attacking;
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

        onRequestPath: function(callback) {
            this.requestPathCallback = callback;
        },

        onStartPathing: function(callback) {
            this.startPathingCallback = callback;
        },

        onBeforeStep: function(callback) {
            this.beforeStepCallback = callback;
        },

        onStep: function(callback) {
            this.stepCallback = callback;
        },

        onMove: function(callback) {
            this.moveCallback = callback;
        }
    });

});