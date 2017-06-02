/* global module */

var cls = require('../lib/class'),
    config = require('../../config.json'),
    Player = require('./entity/character/player/player'),
    Map = require('../map/map'),
    _ = require('underscore'),
    Messages = require('../network/messages'),
    Utils = require('../util/utils'),
    Mobs = require('../util/mobs'),
    Mob = require('./entity/character/mob/mob'),
    NPCs = require('../util/npcs'),
    NPC = require('./entity/npc/npc'),
    Items = require('../util/items'),
    Item = require('./entity/objects/item');

module.exports = World = cls.Class.extend({

    init: function(id, socket, database) {
        var self = this;

        self.id = id;
        self.socket = socket;
        self.database = database;

        self.playerCount = 0;
        self.maxPlayers = config.maxPlayers;
        self.updateTime = config.updateTime;
        self.debug = false;

        self.players = {};
        self.entities = {};
        self.items = {};
        self.mobs = {};
        self.npcs = {};

        self.packets = {};
        self.groups = {};

        self.loadedGroups = false;

        self.ready = false;

        self.onPlayerConnection(function(connection) {
            var clientId = Utils.generateClientId(),
                player = new Player(self, self.database, connection, clientId);

            self.addToPackets(player);

            self.pushToPlayer(player, new Messages.Handshake(clientId, config.devClient));
        });
    },

    load: function() {
        var self = this;

        log.info('************ World ' + self.id + ' ***********');

        /**
         * The reason maps are loaded per each world is because
         * we can have slight modifications for each world if we want in the
         * future. Using region loading, we can just send the client
         * whatever new map we have created server sided. Cleaner and nicer.
         */

        self.map = new Map(self);
        self.map.isReady(function() {
            self.loadGroups();
            self.spawnEntities();
        });
        /**
         * Similar to TTA engine here, but it's loaded upon initialization
         * rather than being called from elsewhere.
         */

        self.tick();

        self.ready = true;

        log.info('********************************');
    },

    tick: function() {
        var self = this;

        setInterval(function() {

            self.parsePackets();
            self.parseGroups();

        }, 1000 / self.updateTime);
    },

    parsePackets: function() {
        var self = this, connection;

        /**
         * This parses through all the packet pool and sends them
         * whenever the server has time
         */


        for (var id in self.packets) {
            if (self.packets.hasOwnProperty(id) && self.packets[id].length > 0) {
                var conn = self.socket.getConnection(id);

                if (conn) {
                    connection = conn;
                    connection.send(self.packets[id]);
                    self.packets[id] = [];
                } else
                    delete self.socket.getConnection(id);
            }
        }

    },

    parseGroups: function() {
        var self = this;

        if (!self.loadedGroups)
            return;

        self.map.groups.forEachGroup(function(groupId) {
            var spawns = [];

            if (self.groups[groupId].incoming.length < 1)
                return;

            self.sendSpawns(groupId);

            self.groups[groupId].incoming = [];
        });
    },

    sendSpawns: function(groupId) {
        var self = this;

        if (!groupId)
            return;

        return _.each(self.groups[groupId].incoming, function(entity) {
            if (entity.instance === null)
                return;

            self.pushToGroup(groupId, new Messages.Spawn(entity), entity instanceof Player ? entity.instance : null);
        });
    },

    loadGroups: function() {
        var self = this;

        self.map.groups.forEachGroup(function(groupId) {
            self.groups[groupId] = {
                entities: {},
                players: [],
                incoming: []
            };

        });

        self.loadedGroups = true;
    },

    getEntityById: function(id) {
        if (id in this.entities)
            return this.entities[id];
    },

    /**
     * Important functions for sending
     * messages to the player(s)
     */

    pushBroadcast: function(message) {
        var self = this;

        _.each(self.packets, function(packet) {
            packet.push(message.serialize());
        });
    },

    pushToPlayer: function(player, message) {
        if (player && player.instance in this.packets)
            this.packets[player.instance].push(message.serialize());
    },

    pushToGroup: function(id, message, ignoreId) {
        var self = this,
            group = self.groups[id];

        if (!group)
            return;

        _.each(group.players, function(playerId) {
            if (playerId !== ignoreId)
                self.pushToPlayer(self.getEntityById(playerId), message);
        });
    },

    pushToAdjacentGroups: function(groupId, message, ignoreId) {
        var self = this;

        self.map.groups.forEachAdjacentGroup(groupId, function(id) {
            self.pushToGroup(id, message, ignoreId);
        });
    },

    pushToOldGroups: function(player, message) {
        var self = this;

        _.each(player.recentGroups, function(id) {
            self.pushToGroup(id, message);
        });

        player.recentGroups = [];
    },

    addToGroup: function(entity, groupId) {
        var self = this,
            newGroups = [];

        if (entity && groupId && (groupId in self.groups)) {
            self.map.groups.forEachAdjacentGroup(groupId, function(id) {
                var group = self.groups[id];

                if (group && group.entities) {
                    group.entities[entity.instance] = entity;
                    newGroups.push(id);
                }
            });

            entity.group = groupId;

            if (entity instanceof Player)
                self.groups[groupId].players.push(entity.instance);
        }

        return newGroups;
    },

    removeFromGroups: function(entity) {
        var self = this,
            oldGroups = [];

        if (entity && entity.group) {
            var group = self.groups[entity.group];

            if (entity instanceof Player)
                group.players = _.reject(group.players, function(id) { return id === entity.instance; });

            self.map.groups.forEachAdjacentGroup(entity.group, function(id) {
                if (self.groups[id] && entity.instance in self.groups[id].entities) {
                    delete self.groups[id].entities[entity.instance];
                    oldGroups.push(id);
                }
            });

            entity.group = null;
        }

        return oldGroups;
    },

    incomingToGroup: function(entity, groupId) {
        var self = this;

        if (!entity || !groupId)
            return;

        self.map.groups.forEachAdjacentGroup(groupId, function(id) {
            var group = self.groups[id];

            if (group && !_.include(group.entities, entity.instance))
                group.incoming.push(entity);
        });
    },

    handleEntityGroup: function(entity) {
        var self = this,
            groupsChanged = false;

        if (!entity)
            return groupsChanged;

        var groupId = self.map.groups.groupIdFromPosition(entity.x, entity.y);

        if (!entity.group || (entity.group && entity.group !== groupId)) {
            groupsChanged = true;

            self.incomingToGroup(entity, groupId);

            var oldGroups = self.removeFromGroups(entity),
                newGroups = self.addToGroup(entity, groupId);

            if (_.size(oldGroups) > 0)
                entity.recentGroups = _.difference(oldGroups, newGroups);
        }

        return groupsChanged;
    },

    spawnEntities: function() {
        var self = this,
            entities = 0;

        _.each(self.map.staticEntities, function(key, tileIndex) {
            var isMob = !!Mobs.Properties[key],
                isNpc = !!NPCs.Properties[key],
                isItem = !!Items.Data[key],
                info = isMob ? Mobs.Properties[key] : (isNpc ? NPCs.Properties[key] : isItem ? Items.getData(key) : null),
                position = self.map.indexToGridPosition(tileIndex);

            position.x++;

            if (!info || info === 'null') {
                if (self.debug)
                    log.info('Unknown object spawned at: ' + position.x + ' ' + position.y);

                return;
            }

            var instance = Utils.generateInstance(isMob ? 2 : (isNpc ? 3 : 4), info.id, position.x);

            if (isMob)
                self.addMob(new Mob(info.id, instance, position.x, position.y));

            if (isNpc)
                self.addNPC(new NPC(info.id, instance, position.x, position.y));

            if (isItem) {
                var item = new Item(info.id, instance, position.x, position.y);

                item.static = true;

                self.addItem(item);
            }


            entities++;
        });

        log.info('Spawned ' + entities + ' entities!');

    },

    pushEntities: function(player) {
        var self = this,
            entities;

        if (!player || !(player.group in self.groups))
            return;

        entities = _.keys(self.groups[player.group].entities);

        entities = _.reject(entities, function(instance) {
            return instance === player.instance;
        });

        entities = _.map(entities, function(instance) {
            return parseInt(instance);
        });

        if (entities)
            player.send(new Messages.List(entities));
    },

    addEntity: function(entity) {
        var self = this;

        self.entities[entity.instance] = entity;

        if (!entity.isPlayer())
            self.handleEntityGroup(entity);
    },

    addPlayer: function(player) {
        var self = this;

        self.addEntity(player);
        self.players[player.instance] = player;
    },

    addToPackets: function(player) {
        var self = this;

        self.packets[player.instance] = [];
    },

    addNPC: function(npc) {
        var self = this;

        self.addEntity(npc);
        self.npcs[npc.instance] = npc;
    },

    addMob: function(mob) {
        var self = this;

        self.addEntity(mob);
        self.mobs[mob.instance] = mob;
    },

    addItem: function(item) {
        var self = this;

        item.onRespawn(self.addItem.bind(self, item));

        self.addEntity(item);
        self.items[item.instance] = item;
    },

    removeEntity: function(entity) {
        var self = this;

        if (entity.instance in self.entities)
            delete self.entities[entity.instance];

        if (entity.instance in self.mobs)
            delete self.mobs[entity.instance];

        if (entity.instance in self.items)
            delete self.items[entity.instance];

        self.removeFromGroups(entity);
    },

    removeItem: function(item) {
        var self = this;

        self.removeEntity(item);
        self.pushBroadcast(new Messages.Despawn(item.instance));

        item.respawn();
    },

    removePlayer: function(player) {
        var self = this;

        self.removeEntity(player);
        self.pushBroadcast(new Messages.Despawn(player.instance));

        delete self.players[player.instance];
        delete self.packets[player.instance];
    },

    playerInWorld: function(username) {
        var self = this;

        for (var id in self.players)
            if (self.players.hasOwnProperty(id))
                if (self.players[id].username === username)
                    return true;

        return false;
    },

    onPopulationUpdate: function(callback) {
        this.populationCallback = callback;
    },

    onPlayerConnection: function(callback) {
        this.playerConnectCallback = callback;
    }

});