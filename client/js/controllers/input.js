/* global Modules, log */

define(function() {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;
            self.app = game.app;
            self.renderer = game.renderer;

            self.selectedCellVisible = false;
            self.previousClick = {};
            self.cursorVisible = true;
            self.targetVisible = true;
            self.selectedX = -1;
            self.selectedY = -1;

            self.cursor = null;
            self.newCursor = null;

            self.targetColour = null;
            self.newTargetColour = null;

            self.mouse = {
                x: 0,
                y: 0
            }
        },

        handle: function(inputType, data) {
            var self = this;

            switch(inputType) {
                case Modules.InputType.Key:

                    switch(data) {
                        case Modules.Keys.Right:
                        case Modules.Keys.Left:
                        case Modules.Keys.Up:
                        case Modules.Keys.Down:
                            self.game.getCamera().handlePanning(data);
                            break;
                    }

                    break;

                case Modules.InputType.LeftClick:

                    self.setCoords(data);

                    break;
            }
        },

        setCoords: function(event) {
            var self = this,
                offset = self.app.canvas.offset(),
                width = self.renderer.background.width,
                height = self.renderer.background.height;

            self.mouse.x = Math.round((event.pageX - offset.left) / self.app.getZoom());
            self.mouse.y = Math.round((event.pageY - offset.top) / self.app.getZoom());

            if (self.mouse.x >= width)
                self.mouse.x = width - 5;
            else if (self.mouse.x <= 0)
                self.mouse.x = 0;

            if (self.mouse.y >= height)
                self.mouse.y = height - 5;
            else if (self.mouse.y <= 0)
                self.mouse.y = 0;
        },

        getCoords: function() {
            var self = this,
                tileScale = self.renderer.tileSize * self.renderer.getDrawingScale(),
                offsetX = self.mouse.x % tileScale,
                offsetY = self.mouse.y % tileScale,
                x = ((self.mouse.x - offsetX) / tileScale) + self.game.getCamera().gridX,
                y = ((self.mouse.y - offsetY) / tileScale) + self.game.getCamera().gridY;

            return {
                x: x,
                y: y
            }
        },

        updateCursor: function() {
            var self = this;

            if (!self.cursorVisible)
                return;

            if (self.newCursor !== self.cursor)
                self.cursor = self.newCursor;

            if (self.newTargetColour !== self.targetColour)
                self.targetColour = self.newTargetColour;
        },

        moveCursor: function() {

        },

        setCursor: function(cursor) {
            var self = this,
                newCursor = self.game.getSprite(cursor);

            if (newCursor)
                self.cursor = newCursor;
            else
                log.error('Cursor: ' + cursor + ' could not be found.');
        },

        onKey: function(callback) {
            this.keyCallback = callback;
        },

        onRightClick: function(callback) {
            this.rightClickCallback = callback;
        },

        onLeftClick: function(callback) {
            this.leftClickCallback = callback;
        }

    });

});