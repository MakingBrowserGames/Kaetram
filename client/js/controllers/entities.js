/* global log, _ */

define(['../renderer/grids', '../entity/objects/chest',
        '../entity/character/character', '../entity/character/player/player',
        '../entity/objects/item', './sprites'], function(Grids, Chest, Character, Player, Item, Sprites) {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;
            self.renderer = game.renderer;
            self.camera = self.renderer.camera;

            self.grids = null;
            self.sprites = null;

            self.entities = {};
        },

        load: function() {
            var self = this;

            if (!self.grids)
                self.grids = new Grids(self.game.map);

            if (!self.sprites)
                self.sprites = new Sprites(self.game.renderer);
        },

        update: function() {
            var self = this;

            if (self.sprites)
                self.sprites.updateSprites();
        },

        addEntity: function(entity) {
            var self = this;

            if (self.entities[entity.id])
                return;

            self.entities[entity.id] = entity;
            self.registerPosition(entity);

            if (!(entity instanceof Item && entity.wasDropped) && !self.renderer.isPortableDevice())
                entity.fadeIn(self.game.time);

            /**
             * Original TTA only initialized the callback when the device
             * was a mobile. But here we initialize it regardless, and only
             * pass necessary information if it is not a computer-sized device.
             * This way it fits in perfectly with the resizing functionality.
             */

            entity.onDirty(function(e) {
                if (!self.game.renderer.isPortableDevice())
                    return;

                if (!self.camera.isVisiblePosition(e.gridX, e.gridY)) {
                    e.dirtyRect = self.renderer.getEntityBounds(e);
                    self.renderer.checkDirty(e);
                }
            });

        },

        addItem: function(item, x, y) {
            //TODO - Sprite controller necessary
        },

        removeItem: function(item) {
            var self = this;

            if (!item)
                return;

            self.grids.removeFromItemGrid(item, item.gridX, item.gridY);
            self.grids.removeFromRenderingGrid(item, item.gridX, item.gridY);

            delete self.entities[item.id];
        },

        registerPosition: function(entity) {
            var self = this;

            if (!entity)
                return;

            if (entity instanceof Character || entity instanceof Chest) {
                self.grids.addToEntityGrid(entity, entity.gridX, entity.gridY);

                if (!(entity instanceof Player))
                    self.grids.addToPathingGrid(entity.gridX, entity.gridY);
            }

            if (entity instanceof Item)
                self.grids.addToItemGrid(entity, entity.gridX, entity.gridY);

            self.grids.addToRenderingGrid(entity, entity.gridX, entity.gridY);
        },

        unregisterPosition: function(entity) {
            var self = this;

            if (!entity)
                return;

            self.grids.removeEntity(entity);
        },

        getSprite: function(name) {
            return this.sprites.sprites[name];
        },

        forEachEntity: function(callback) {
            _.each(this.entities, function(entity) { callback(entity) }) ;
        },

        forEachEntityAround: function(x, y, radius, callback) {
            var self = this;

            for (var i = x - radius, max_i = x + radius; i <= max_i; i++) {
                for (var j = y - radius, max_j = y + radius; j <= max_j; j++) {
                    if (self.map.isOutOfBounds(i, j))
                        continue;

                    _.each(self.grids.renderingGrid[j][i], function(entity) {
                        callback(entity);
                    })
                }
            }
        }

    });

});