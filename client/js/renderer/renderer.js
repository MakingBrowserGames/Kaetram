/* global _, log */

define(['./camera', './tile', '../entity/character/player/player', '../entity/character/character'], function(Camera, Tile, Player, Character) {

    return Class.extend({

        init: function(background, entities, foreground, textCanvas, cursor, game) {
            var self = this;

            self.background = background;
            self.entities = entities;
            self.foreground = foreground;
            self.textCanvas = textCanvas;
            self.cursor = cursor;

            self.context = entities.getContext('2d');
            self.backContext = background.getContext('2d');
            self.foreContext = foreground.getContext('2d');
            self.textContext = textCanvas.getContext('2d');
            self.cursorContext = cursor.getContext('2d');

            self.contexts = [self.backContext, self.foreContext, self.context];
            self.canvases = [self.background, self.entities, self.foreground, self.textCanvas, self.cursor];

            self.game = game;
            self.camera = null;
            self.entities = null;
            self.input = null;

            self.checkDevice();

            self.scale = 1;
            self.tileSize = 16;
            self.fontSize = 10;

            self.screenWidth = 0;
            self.screenHeight = 0;

            self.time = new Date();

            self.fps = 0;
            self.frameCount = 0;
            self.renderedFrame = [0, 0];

            self.animatedTiles = [];

            self.resizeTimeout = null;

            self.drawTarget = false;
            self.selectedCellVisible = false;

            self.stopRendering  = false;

            self.load()
        },

        load: function() {
            var self = this;

            self.scale = self.getScale();
            self.drawingScale = self.getDrawingScale();

            self.forEachContext(function(context) {
                context.mozImageSmoothingEnabled = false;
            });

            self.loadFont();
        },

        loadSizes: function() {
            var self = this;

            if (!self.camera)
                return;

            self.screenWidth = self.camera.gridWidth * self.tileSize;
            self.screenHeight = self.camera.gridHeight * self.tileSize;

            var width = self.screenWidth * self.drawingScale,
                height = self.screenHeight * self.drawingScale;

            self.forEachCanvas(function(canvas) {
                canvas.width = width;
                canvas.height = height;
            });
        },

        loadFont: function() {
            var self = this;

            if (self.getScale() > 2)
                self.fontSize = 20;

            self.textContext.font = self.fontSize + 'px AdvoCut';
        },

        loadCamera: function() {
            var self = this;

            self.camera = new Camera(this);

            self.loadSizes();

            self.camera.onGridChange(function() {
                self.updateAnimatedTiles();
            });

            self.updateAnimatedTiles();
        },

        resize: function() {
            var self = this;

            self.stopRendering = true;

            self.clearAll();

            self.scale = self.getScale();
            self.drawingScale = self.getDrawingScale();

            self.checkDevice();

            if (self.camera)
                self.camera.update();

            if (self.map)
                self.map.updateTileset();

            self.loadFont();
            self.updateAnimatedTiles();

            if (!self.resizeTimeout)
                self.resizeTimeout = setTimeout(function() {
                    self.loadSizes();

                    if (self.entities)
                        self.entities.update();

                    self.renderedFrame[0] = -1;
                    self.stopRendering = false;
                    self.resizeTimeout = null;

                    self.camera.centreOn(self.game.player);
                }, 500);
        },

        render: function() {
            var self = this;

            self.clearScreen(self.context);

            self.saveAll();

            /**
             * Rendering related draws
             */

            if (!self.stopRendering) {
                self.draw();
                self.drawAnimatedTiles();

                if (!self.mobile && self.input.targetVisible)
                    self.drawTargetCell();

                self.drawEntities(false);
            }

            /**
             * Text related draws
             */
            self.drawFPS();

            self.restoreAll();

            self.drawCursor();
        },

        /**
         * Context Drawing
         */

        draw: function() {
            var self = this;

            if (self.hasRenderedFrame())
                return;

            self.clearDrawing();
            self.updateDrawingView();

            self.forEachVisibleTile(function(id, index) {
                var isHighTile = self.map.isHighTile(id),
                    context = isHighTile ? self.foreContext : self.backContext;

                if (!self.map.isAnimatedTile(id))
                    self.drawTile(context, id, self.tileset, self.tileset.width / self.tileSize, self.map.width, index);

            });

            self.saveFrame();
        },

        drawAnimatedTiles: function() {
            var self = this;

            self.setCameraView(self.context);

            self.forEachAnimatedTile(function(tile) {
                self.drawTile(self.context, tile.id, self.tileset, self.tileset.width / self.tileSize, self.map.width, tile.index);
                tile.loaded = true;
            });
        },

        drawEntities: function(dirty) {
            var self = this;

            self.forEachVisibleEntity(function(entity) {

                if (entity.spriteLoaded) {

                    self.drawEntity(entity);

                    if (dirty && entity.dirty) {
                        entity.dirty = false;
                        entity.oldDirtyRect = entity.dirtyRect;
                        entity.dirtyRect = null;
                    }
                }
            });
        },

        drawEntity: function(entity) {
            var self = this,
                sprite = entity.sprite,
                shadow = self.entities.getSprite('shadow16'),
                animation = entity.currentAnimation;

            if (!animation || !sprite || !entity.isVisible())
                return;

            var frame = animation.currentFrame,
                x = frame.x * self.drawingScale,
                y = frame.y * self.drawingScale,
                width = sprite.width * self.drawingScale,
                height = sprite.height * self.drawingScale,
                ox = sprite.offsetX * self.drawingScale,
                oy = sprite.offsetY * self.drawingScale,
                dx = entity.x * self.drawingScale,
                dy = entity.y * self.drawingScale,
                dw = width,
                dh = height;

            if (entity.fading)
                self.context.globalAlpha = entity.fadingAlpha;

            if (entity.spriteFlipX) {
                self.context.translate(dx + self.tileSize * self.drawingScale, dy);
                self.context.scale(-1, 1);
            } else if (entity.spriteFlipY) {
                self.context.translate(dx, dy + dh);
                self.context.scale(1, -1);
            } else
                self.context.translate(dx, dy);

            if (entity.hasShadow()) {
                if (!shadow.loaded)
                    shadow.load();

                self.context.drawImage(shadow.image, 0, 0, shadow.width * self.drawingScale, shadow.height * self.drawingScale,
                                        0, entity.shadowOffsetY * self.drawingScale, shadow.width * self.drawingScale,
                                        shadow.height * self.drawingScale);
            }

            self.context.drawImage(sprite.image, x, y, width, height, ox, oy, dw, dh);

            if (entity instanceof Character && !entity.dead && entity.hasWeapon()) {
                var weapon = self.entities.getSprite(entity.weapon.getString());

                if (!weapon)
                    return;

                if (!weapon.loaded)
                    weapon.load();

                var weaponAnimationData = weapon.animationData[animation.name],
                    index = frame.index < weaponAnimationData.length ? frame.index : frame.index % weaponAnimationData.length,
                    weaponX = weapon.width * index * self.drawingScale,
                    weaponY = weapon.height * animation.row * self.drawingScale,
                    weaponWidth = weapon.width * self.drawingScale,
                    weaponHeight = weapon.height * self.drawingScale;

                self.context.drawImage(weapon.image, weaponX, weaponY, weaponWidth, weaponHeight,
                                    weapon.offsetX * self.drawingScale, weapon.offsetY * self.drawingScale,
                                    weaponWidth, weaponHeight);
            }
        },

        drawCursor: function() {
            var self = this,
                cursor = self.input.cursor;

            self.clearScreen(self.cursorContext);
            self.cursorContext.save();

            if (cursor && self.scale > 1) {
                if (!cursor.loaded)
                    cursor.load();

                if (cursor.loaded)
                    self.cursorContext.drawImage(cursor.image, 0, 0, 14 * self.drawingScale, 14 * self.drawingScale,
                                            self.input.mouse.x, self.input.mouse.y,
                                            14 * self.drawingScale, 14 * self.drawingScale);
            }

            self.cursorContext.restore();
        },

        drawFPS: function() {
            var self = this,
                currentTime = new Date(),
                timeDiff = currentTime - self.time;

            if (timeDiff >= 1000) {
                self.realFPS = self.frameCount;
                self.frameCount = 0;
                self.time = currentTime;
                self.fps = self.realFPS;
            }

            self.frameCount++;

            self.drawText('FPS: ' + self.realFPS, 10, 11, false, 'white');
        },

        /**
         * Primitive drawing functions
         */

        drawTile: function(context, tileId, tileset, setWidth, gridWidth, cellId) {
            var self = this;

            if (tileId === -1)
                return;

            self.drawScaledImage(context, tileset,
                self.getX(tileId + 1, (setWidth / self.drawingScale)) * self.tileSize,
                Math.floor(tileId / (setWidth / self.drawingScale)) * self.tileSize,
                self.tileSize, self.tileSize,
                self.getX(cellId + 1, gridWidth) * self.tileSize,
                Math.floor(cellId / gridWidth) * self.tileSize);
        },

        clearTile: function(context, gridWidth, cellId) {
            var self = this,
                x = self.getX(cellId + 1, gridWidth) * self.tileSize * self.drawingScale,
                y = Math.floor(cellId / gridWidth) * self.tileSize * self.drawingScale,
                w = self.tileSize * self.scale;

            context.clearRect(x, y, w, w);
        },

        drawText: function(text, x, y, centered, colour, strokeColour) {
            var self = this,
                strokeSize = 1,
                context = self.textContext;

            self.clearText();

            if (self.scale > 2)
                strokeSize = 3;

            if (text && x && y) {
                if (centered)
                    context.textAlign = 'center';

                context.strokeStyle = strokeColour || '#373737';
                context.lineWidth = strokeSize;
                context.fontSize = 10 + (3 * self.scale);
                context.strokeText(text, x * self.scale, y * self.scale);
                context.fillStyle = colour || 'white';
                context.fillText(text, x * self.scale, y * self.scale);
            }
        },

        drawScaledImage: function(context, image, x, y, width, height, dx, dy) {
            var self = this;

            if (!context)
                return;

            context.drawImage(image,
                x * self.drawingScale,
                y * self.drawingScale,
                width * self.drawingScale,
                height * self.drawingScale,
                dx * self.drawingScale,
                dy * self.drawingScale,
                width * self.drawingScale,
                height * self.drawingScale);
        },

        updateAnimatedTiles: function() {
            var self = this,
                newTiles = [];

            self.forEachVisibleTile(function(id, index) {
                /**
                 * We don't want to reinitialize animated tiles that already exist
                 * and are within the visible camera proportions. This way we can parse
                 * it every time the tile moves slightly.
                 */

                if (!self.map.isAnimatedTile(id))
                    return;

                /**
                 * Push the pre-existing tiles.
                 */

                var tileIndex = self.animatedTiles.indexOf(id);

                if (tileIndex > -1) {
                    newTiles.push(self.animatedTiles[tileIndex]);
                    return;
                }

                var tile = new Tile(id, index, self.map.getTileAnimationLength(id), self.map.getTileAnimationDelay(id)),
                    position = self.map.indexToGridPosition(tile.index);

                tile.setPosition(position);

                newTiles.push(tile);
            });

            self.animatedTiles = newTiles;
        },

        checkDirty: function(rectOne, source, x, y) {
            var self = this;

            self.entities.forEachEntityAround(x, y, 2, function(entityTwo) {
                if (source && source.id && entityTwo.id === source.id)
                    return;

                if (!entityTwo.isDirty)
                    if (self.isIntersecting(rectOne, self.getEntityBounds(entityTwo)))
                        entityTwo.loadDirty();
            });

            if (source && !(source.hasOwnProperty('index')))
                self.forEachAnimatedTile(function(tile) {
                    if (!tile.isDirty)
                        if (self.isIntersecting(rectOne, self.getTileBounds(tile)))
                            tile.dirty = true;
                });


            if (!self.drawTarget && self.input.selectedCellVisible) {
                var targetRect = self.getTargetBounds();

                if (self.isIntersecting(rectOne, targetRect)) {
                    self.drawTarget = true;
                    self.targetRect = targetRect;
                }
            }
        },

        drawCellRect: function(x, y, colour) {
            var self = this,
                multiplier = self.tileSize * self.drawingScale;

            self.context.save();

            self.context.lineWidth = 2 * self.drawingScale;

            self.context.translate(x + 2, y + 2);

            if (self.mobile)
                self.context.clearRect(-8, -8, multiplier + 16, multiplier + 16);

            self.context.strokeStyle = colour;
            self.context.strokeRect(0, 0, multiplier - 4, multiplier - 4);

            self.context.restore();
        },

        drawCellHighlight: function(x, y, colour) {
            var self = this;

            self.drawCellRect(x * self.drawingScale * self.tileSize, y * self.drawingScale * self.tileSize, colour);
        },

        drawTargetCell: function() {
            var self = this,
                location = self.input.getCoords();

            if (self.input.targetVisible && location.x !== self.input.selectedX && location.y !== self.input.selectedY)
                self.drawCellHighlight(location.x, location.y, self.input.targetColour);
        },

        /**
         * Primordial Rendering functions
         */

        forEachVisibleIndex: function(callback) {
            var self = this;

            self.camera.forEachVisiblePosition(function(x, y) {
                if (!self.map.isOutOfBounds(x, y))
                    callback(self.map.gridPositionToIndex(x, y) - 1);
            });
        },

        forEachVisibleTile: function(callback) {
            var self = this;

            if (!self.map || !self.map.mapLoaded)
                return;

            self.forEachVisibleIndex(function(index) {
                if (_.isArray(self.map.data[index]))
                    _.each(self.map.data[index], function(id) { callback(id - 1, index); });
                else if (!(isNaN(self.map.data[index] - 1)))
                    callback(self.map.data[index] - 1, index);
            });
        },

        forEachAnimatedTile: function(callback) {
            _.each(this.animatedTiles, function(tile) {
                callback(tile);
            });
        },

        forEachVisibleEntity: function(callback) {
            var self = this,
                grids = self.entities.grids;

            self.camera.forEachVisiblePosition(function(x, y) {
                if (!self.map.isOutOfBounds(x, y) && grids.renderingGrid[y][x])
                    _.each(grids.renderingGrid[y][x], function(entity) { callback(entity); });
            });
        },

        isVisiblePosition: function(x, y) {
            return y >= this.camera.gridY && y < this.camera.gridY + this.camera.gridHeight &&
                    x >= this.camera.gridX && x < this.camera.gridX + this.camera.gridWidth
        },

        getScale: function() {
            return this.game.getScaleFactor();
        },

        getDrawingScale: function() {
            var self = this,
                scale = self.getScale();

            if (self.mobile)
                scale = 2;

            return scale;
        },

        clearContext: function() {
            this.context.clearRect(0, 0, this.screenWidth * this.scale, this.screenHeight * this.scale);
        },
        
        clearText: function() {
            this.textContext.clearRect(0, 0, this.screenWidth * this.scale, this.screenHeight * this.scale);
        },

        restore: function() {
            this.forEachContext(function(context) {
                context.restore();
            });
        },

        clearAll: function() {
            var self = this;

            self.forEachContext(function(context) {
                context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            });
        },

        clearDrawing: function() {
            var self = this;

            self.forEachDrawingContext(function(context) {
                context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            });
        },

        saveAll: function() {
            var self = this;

            self.forEachContext(function(context) {
                context.save();
            });
        },

        saveDrawing: function() {
            var self = this;

            self.forEachDrawingContext(function(context) {
                context.save();
            });
        },

        restoreAll: function() {
            var self = this;

            self.forEachContext(function(context) {
                context.restore();
            });
        },

        isIntersecting: function(rectOne, rectTwo) {
            return (rectTwo.left > rectOne.right || rectTwo.right < rectOne.left || rectTwo.top > rectOne.bottom || rectTwo.bottom < rectOne.top);
        },

        /**
         * Rendering Functions
         */

        updateView: function() {
            var self = this;

            self.forEachContext(function(context) {
                self.setCameraView(context);
            });
        },

        updateDrawingView: function() {
            var self = this;

            self.forEachDrawingContext(function(context) {
                self.setCameraView(context);
            });
        },

        setCameraView: function(context) {
            context.translate(-this.camera.x * this.drawingScale, -this.camera.y * this.drawingScale);
        },

        clearScreen: function(context) {
            context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        },

        hasRenderedFrame: function() {
            return this.renderedFrame[0] === this.camera.x && this.renderedFrame[1] === this.camera.y;
        },

        saveFrame: function() {
            var self = this;

            if (!self.hasRenderedFrame()) {
                self.renderedFrame[0] = self.camera.x;
                self.renderedFrame[1] = self.camera.y;
            }
        },

        /**
         * Miscellaneous functions
         */

        forEachContext: function(callback) {
            _.each(this.contexts, function(context) {
                callback(context);
            });
        },

        forEachDrawingContext: function(callback) {
            _.each(this.contexts, function(context) {
                if (context.canvas.id !== 'entities')
                    callback(context);
            });
        },

        forEachCanvas: function(callback) {
            _.each(this.canvases, function(canvas) {
                callback(canvas);
            });
        },

        getX: function(index, width) {
            if (index === 0)
                return 0;

            return (index % width === 0) ? width - 1 : (index % width) - 1;
        },

        checkDevice: function() {
            var self = this;

            self.mobile = self.game.app.isMobile();
            self.tablet = self.game.app.isTablet();
        },

        isPortableDevice: function() {
            return this.mobile || this.tablet;
        },

        /**
         * Setters
         */

        setTileset: function(tileset) {
            this.tileset = tileset;
        },

        setMap: function(map) {
            this.map = map;
        },

        setEntities: function(entities) {
            this.entities = entities;
        },

        setInput: function(input) {
            this.input = input;
        },

        /**
         * Getters
         */

        getTileBounds: function(tile) {
            var self = this,
                bounds = {},
                cellId = tile.index;

            bounds.x = (self.getX(cellId + 1, self.map.width) * self.tileSize - self.camera.x) * self.drawingScale;
            bounds.y = ((Math.floor(cellId / self.map.width) * self.tileSize) - self.camera.y) * self.drawingScale;
            bounds.width = self.tileSize * self.drawingScale;
            bounds.height = self.tileSize * self.drawingScale;
            bounds.left = bounds.x;
            bounds.right = bounds.x + bounds.width;
            bounds.top = bounds.y;
            bounds.bottom = bounds.y + bounds.height;

            return bounds;
        },

        getEntityBounds: function(entity) {
            var self = this,
                bounds = {},
                sprite = entity.sprite;

            //TODO - Ensure that the sprite over there has the correct bounds

            if (!sprite)
                log.error('Sprite malformation for: ' + entity.name);
            else {
                bounds.x = (entity.x + sprite.offsetX - self.camera.x) * self.drawingScale;
                bounds.y = (entity.y + sprite.offsetY - self.camera.y) * self.drawingScale;
                bounds.width = sprite.width * self.drawingScale;
                bounds.height = sprite.height * self.drawingScale;
                bounds.left = bounds.x;
                bounds.right = bounds.x + bounds.width;
                bounds.top = bounds.y;
                bounds.bottom = bounds.y + bounds.height;
            }

            return bounds;
        },

        getTargetBounds: function(x, y) {
            var self = this,
                bounds = {},
                tx = x || self.input.selectedX,
                ty = y || self.input.selectedY;

            bounds.x = ((tx * self.tileSize) - self.camera.x) * self.drawingScale;
            bounds.y = ((ty * self.tileSize) - self.camera.y) * self.drawingScale;
            bounds.width = self.tileSize * self.drawingScale;
            bounds.height = self.tileSize * self.drawingScale;
            bounds.left = bounds.x;
            bounds.right = bounds.x + bounds.width;
            bounds.top = bounds.y;
            bounds.bottom = bounds.y + bounds.height;

            return bounds;
        },

        getTileset: function() {
            return this.tileset;
        }

    });

});