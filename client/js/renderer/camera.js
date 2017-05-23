/* global Modules, log */

define(function() {

    return Class.extend({

        init: function(renderer) {
            var self = this;

            self.renderer = renderer;

            self.offset = 0.5;
            self.x = 0;
            self.y = 0;
            self.gridX = 0;
            self.gridY = 0;

            self.prevGridX = 0;
            self.prevGridY = 0;

            self.speed = 1;
            self.panning = false;

            self.focusMode = false;
            self.centered = true;

            self.player = null;

            self.update();
        },

        update: function() {
            var self = this,
                factor = self.renderer.getScale();

            self.gridWidth = 15 * factor;
            self.gridHeight = 8 * factor;
        },

        setPosition: function(x, y) {
            var self = this;

            self.x = x;
            self.y = y;

            self.prevGridX = self.gridX;
            self.prevGridY = self.gridY;

            self.gridX = Math.floor(x / 16);
            self.gridY = Math.floor(y / 16);

            if (self.gridCallback && (self.prevGridX !== self.gridX || self.prevGridY !== self.gridY))
                self.gridCallback();
        },

        clip: function() {
            this.setGridPosition(Math.round(this.x / 16), Math.round(this.y / 16));
        },

        setGridPosition: function(x, y) {
            var self = this;

            self.prevGridX = self.gridX;
            self.prevGridY = self.gridY;

            self.gridX = x;
            self.gridY = y;

            self.x = self.gridX * 16;
            self.y = self.gridY * 16;

            if (self.gridCallback && (self.prevGridX !== self.gridX || self.prevGridY !== self.gridY))
                self.gridCallback();
        },

        setPlayer: function(player) {
            var self = this;

            self.player = player;

            self.centreOn(self.player);
        },

        handlePanning: function(direction) {
            var self = this;

            if (!self.panning)
                return;

            switch (direction) {
                case Modules.Keys.Up:
                    self.setPosition(self.x, self.y - 1);
                    break;

                case Modules.Keys.Down:
                    self.setPosition(self.x, self.y + 1);
                    break;

                case Modules.Keys.Left:
                    self.setPosition(self.x - 1, self.y);
                    break;

                case Modules.Keys.Right:
                    self.setPosition(self.x + 1, self.y);
                    break;
            }
        },

        centreOn: function(entity) {
            var self = this;

            if (!entity)
                return;

            var width = Math.floor(self.gridWidth / 2),
                height = Math.floor(self.gridHeight / 2);

            self.x = entity.x - (width * self.renderer.tileSize);
            self.y = entity.y - (height * self.renderer.tileSize);

            self.gridX = Math.round(entity.x / 16) - width;
            self.gridY = Math.round(entity.y / 16) - height;
        },

        forEachVisiblePosition: function(callback) {
            var self = this;

            for(var y = self.gridY - 1, maxY = y + self.gridHeight + 2; y < maxY; y++) {
                for(var x = self.gridX - 1, maxX = x + self.gridWidth + 2; x < maxX; x++)
                    callback(x, y);
            }
        },

        onGridChange: function(callback) {
            this.gridCallback = callback;
        }

    });

});