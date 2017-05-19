/* global module */

var cls = require('../lib/class'),
    config = require('../../config.json'),
    Player = require('./entity/character/player/player'),
    Map = require('../map/map'),
    _ = require('underscore'),
    Messages = require('../network/messages'),
    Utils = require('../util/utils');

module.exports = World = cls.Class.extend({

    init: function(id, socket, database) {
        var self = this;

        self.id = id;
        self.socket = socket;
        self.database = database;

        self.playerCount = 0;
        self.maxPlayers = config.maxPlayers;
        self.updateTime = config.updateTime;

        self.players = {};
        self.entities = {};
        self.mobs = {};
        self.npcs = {};

        self.packets = {};
        self.groups = {};

        self.loadedGroups = false;

        self.ready = false;

        self.onPlayerConnection(function(connection) {
            var clientId = Utils.generateClientId(),
                player = new Player(self, self.database, connection, clientId);

            self.addPlayer(player);

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

            spawns = self.getSpawns(groupId);

            self.groups[groupId].incoming = [];
        });
    },

    getSpawns: function(groupId) {
        var self = this;

        if (!groupId)
            return;

        return _.each(self.groups[groupId].incoming, function(entity) {
            if (entity.kind === null)
                return;

            self.pushToGroup(groupId, new Messages.Spawn(entity), entity instanceof Player ? entity.id : null);
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
        if (player && player.id in this.packets)
            this.packets[player.id].push(message.serialize());
    },

    pushToGroup: function(id, message, ignore) {
        var self = this,
            group = self.groups[id];

        if (!group)
            return;

        _.each(group.players, function(playerId) {
            if (playerId !== ignore)
                self.pushToPlayer(self.getEntityById(playerId), message);
        });
    },

    pushToAdjacentGroups: function(groupId, message) {
        var self = this;

        self.map.groups.forEachAdjacentGroup(groupId, function(id) {
            self.pushToGroup(id, message);
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
                    group.entities[entity.id] = entity;
                    newGroups.push(id);
                }
            });

            entity.group = groupId;

            if (entity instanceof Player)
                self.groups[groupId].players.push(entity.id);
        }

        return newGroups;
    },

    removeFromGroups: function(entity) {
        var self = this,
            oldGroups = [];

        if (entity && entity.group) {
            var group = self.groups[entity.group];

            if (entity instanceof Player)
                group.players = _.reject(group.players, function(id) { return id === entity.id; });

            self.map.groups.forEachAdjacentGroup(entity.group, function(id) {
                if (self.groups[id] && entity.id in self.groups[id].entities) {
                    delete self.groups[id].entities[entity.id];
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

            if (group && !_.include(group.entities, entity.id))
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
    },

    addEntity: function(entity) {
        var self = this;

        self.entities[entity.id] = entity;
        self.handleEntityGroup(entity);
    },

    addPlayer: function(player) {
        var self = this;

        self.addEntity(player);
        self.players[player.id] = player;
        self.packets[player.id] = [];
    },

    playerInWorld: function(username) {
        _.each(this.players, function(player) {
            if (player.username === username)
                return true;
        });

        return false;
    },

    onPopulationUpdate: function(callback) {
        this.populationCallback = callback;
    },

    onPlayerConnection: function(callback) {
        this.playerConnectCallback = callback;
    }

});