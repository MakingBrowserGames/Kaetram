/* global log, _, Modules */

define(['../renderer/grids', '../entity/objects/chest',
        '../entity/character/character', '../entity/character/player/player',
        '../entity/objects/item', './sprites', '../entity/character/mob/mob',
        '../entity/character/npc/npc'],
    function(Grids, Chest, Character, Player, Item, Sprites, Mob, NPC) {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;
            self.renderer = game.renderer;
            self.camera = self.renderer.camera;

            self.grids = null;
            self.sprites = null;

            self.entities = {};
            self.decrepit = {};
        },

        load: function() {
            var self = this;

            self.game.app.sendStatus('Loading sprites');

            if (!self.sprites) {
                self.sprites = new Sprites(self.game.renderer);

                self.sprites.onLoadedSprites(function() {
                    self.game.input.loadCursors();
                });
            }

            self.game.app.sendStatus('Loading grids');

            if (!self.grids)
                self.grids = new Grids(self.game.map);
        },

        update: function() {
            var self = this;

            if (self.sprites)
                self.sprites.updateSprites();
        },

        clean: function() {
            var self = this;

        },

        create: function(type, info) {
            var self = this,
                id = info.shift(),
                kind, name, x, y, entity;

            if (type !== 'player') {
                kind = info.shift();
                name = info.shift();
                x = info.shift();
                y = info.shift();
            }

            if (id === self.game.player.id)
                return;

            switch (type) {

                case 'npc':

                    var npc = new NPC(id, kind);

                    entity = npc;

                    break;

                case 'item':

                    var count = info.shift(),
                        skill = info.shift(),
                        skillLevel = info.shift();

                    var item = new Item(id, kind, count, skill, skillLevel);

                    entity = item;

                    break;

                case 'mob':

                    var mob = new Mob(id, kind);

                    entity = mob;

                    break;

                case 'player':

                    var player = new Player();

                    name = info.shift();
                    x = info.shift();
                    y = info.shift();

                    var rights = info.shift(),
                        level = info.shift(),
                        hitPointsData = info.shift(),
                        pvpKills = info.shift(),
                        pvpDeaths = info.shift(),
                        armourData = info.shift(),
                        weaponData = info.shift(),
                        pendantData = info.shift(),
                        ringData = info.shift(),
                        bootsData = info.shift();

                    player.setId(id);
                    player.setName(name);

                    player.setGridPosition(x, y);
                    player.rights = rights;
                    player.level = level;

                    player.setHitPoints(hitPointsData);
                    player.pvpKills = pvpKills;
                    player.pvpDeaths = pvpDeaths;

                    player.setSprite(self.getSprite(armourData[0]));
                    player.idle();

                    player.setEquipment(Modules.Equipment.Armour, armourData);
                    player.setEquipment(Modules.Equipment.Weapon, weaponData);
                    player.setEquipment(Modules.Equipment.Pendant, pendantData);
                    player.setEquipment(Modules.Equipment.Ring, ringData);
                    player.setEquipment(Modules.Equipment.Boots, bootsData);

                    player.type = type;

                    self.addEntity(player);

                    player.loadHandler(self.game);

                    break;
            }

            if (!entity)
                return;

            entity.setGridPosition(x, y);
            entity.setName(name);
            entity.setSprite(self.getSprite(type === 'item' ? 'item-' + kind : kind));

            entity.idle();
            entity.type = type;

            self.addEntity(entity);

            /**
             * We should add callbacks for items as well in
             * the future. Just so we have full control over them
             */

            if (type !== 'item' && entity.handler) {
                entity.handler.setGame(self.game);
                entity.handler.load();
            }

        },

        get: function(id) {
            var self = this;

            if (id in self.entities)
                return self.entities[id];

            return null;
        },

        exists: function(id) {
            return id in this.entities;
        },

        clearPlayers: function(exception) {
            var self = this;

            _.each(self.entities, function(entity) {
                if (entity.id !== exception.id && entity.type === 'player') {
                    self.grids.removeFromRenderingGrid(entity, entity.gridX, entity.gridY);
                    self.grids.removeFromPathingGrid(entity.gridX, entity.gridY);

                    delete self.entities[entity.id];
                }
            });

            self.grids.resetPathingGrid();
        },

        addEntity: function(entity) {
            var self = this;

            if (self.entities[entity.id])
                return;

            self.entities[entity.id] = entity;
            self.registerPosition(entity);

            if (!(entity instanceof Item && entity.dropped) && !self.renderer.isPortableDevice())
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

                if (self.camera && !self.camera.isVisiblePosition(e.gridX, e.gridY)) {
                    e.dirtyRect = self.renderer.getEntityBounds(e);
                    self.renderer.checkDirty(e);
                }
            });

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

            if (entity.type === 'player' || entity.type === 'mob' || entity.type === 'npc') {
                self.grids.addToEntityGrid(entity, entity.gridX, entity.gridY);

                if (entity.type !== 'player')
                    self.grids.addToPathingGrid(entity.gridX, entity.gridY);
            }

            if (entity.type === 'item')
                self.grids.addToItemGrid(entity, entity.gridX, entity.gridY);

            self.grids.addToRenderingGrid(entity, entity.gridX, entity.gridY);
        },

        registerDuality: function(entity) {
            var self = this;

            if (!entity)
                return;

            self.grids.entityGrid[entity.gridY][entity.gridX][entity.id] = entity;

            self.grids.addToRenderingGrid(entity, entity.gridX, entity.gridY);

            if (entity.nextGridX >= 0 && entity.nextGridY) {
                self.grids.entityGrid[entity.nextGridY][entity.nextGridX][entity.id] = entity;

                //TODO - Remove this after all pathing is done
                if (!(entity instanceof Player))
                    self.grids.pathingGrid[entity.nextGridY][entity.nextGridX] = 1;
            }
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

        getAll: function() {
            return this.entities;
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