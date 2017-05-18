/* global module */

var Character = require('../character'),
    Incoming = require('../../../../controllers/incoming'),
    Armour = require('./equipment/armour'),
    Weapon = require('./equipment/weapon'),
    Pendant = require('./equipment/pendant'),
    Ring = require('./equipment/ring'),
    Boots = require('./equipment/boots'),
    Items = require('../../../../util/items'),
    Messages = require('../../../../network/messages'),
    Formulas = require('../../../formulas'),
    Hitpoints = require('./points/hitpoints'),
    Mana = require('./points/mana'),
    Packets = require('../../../../network/packets');

module.exports = Player = Character.extend({

    init: function(world, database, connection, clientId) {
        var self = this;

        self.world = world;
        self.mysql = database;
        self.connection = connection;

        self.id = self.connection.id;
        self.clientId = clientId;

        self.incoming = new Incoming(self);

        self.isNew = false;
        self.ready = false;
    },

    load: function(data) {
        var self = this;

        self.x = data.x;
        self.y = data.y;
        self.kind = data.kind;
        self.rights = data.rights;
        self.experience = data.experience;
        self.level = Formulas.expToLevel(self.experience);
        self.hitPoints = new Hitpoints(data.hitPoints, Formulas.getMaxHitPoints(self.level));
        self.mana = new Mana(data.mana, Formulas.getMaxMana(self.level));
        self.ban = data.ban;
        self.membership = data.membership;
        self.lastLogin = data.lastLogin;
        self.pvpKills = data.pvpKills;
        self.pvpDeaths = data.pvpDeaths;
        
        var armour = data.armour,
            weapon = data.weapon,
            pendant = data.pendant,
            ring = data.ring,
            boots = data.boots;

        self.setArmour(armour[0], armour[1], armour[2], armour[3]);
        self.setWeapon(weapon[0], weapon[1], weapon[2], weapon[3]);
        self.setPendant(pendant[0], pendant[1], pendant[2], pendant[3]);
        self.setRing(ring[0], ring[1], ring[2], ring[3]);
        self.setBoots(boots[0], boots[1], boots[2], boots[3]);
    },

    intro: function() {
        var self = this;

        if (self.ban > new Date()) {
            self.connection.sendUTF8('ban');
            self.connection.close('Player: ' + self.player.username + ' is banned.');
        }

        if (self.x === 0 || self.y === 0)
            self.sendToSpawn();

        var info = [
                self.id,
                self.username,
                self.x,
                self.y,
                self.kind,
                self.rights,
                self.hitPoints.getData(),
                self.mana.getData(),
                self.experience,
                self.level,
                self.lastLogin,
                self.pvpKills,
                self.pvpDeaths
            ];

        /**
         * Send player data to client here
         */

        self.send(new Messages.Welcome(info));
    },

    /**
     * Setters
     */

    setArmour: function(id, count, skill, skillLevel) {
        var self = this;

        if (!id)
            return;

        self.armour = new Armour(Items.idToString(id), id, count, skill, skillLevel);
    },

    setWeapon: function(id, count, skill, skillLevel) {
        var self = this;

        if (!id)
            return;

        self.weapon = new Weapon(Items.idToString(id), id, count, skill, skillLevel);
    },

    setPendant: function(id, count, skill, skillLevel) {
        var self = this;

        if (!id)
            return;

        self.pendant = new Pendant(Items.idToString(id), id, count, skill, skillLevel);
    },

    setRing: function(id, count, skill, skillLevel) {
        var self = this;

        if (!id)
            return;

        self.ring = new Ring(Items.idToString(id), id, count, skill, skillLevel);
    },

    setBoots: function(id, count, skill, skillLevel) {
        var self = this;

        if (!id)
            return;

        self.boots = new Boots(Items.idToString(id), id, count, skill, skillLevel);
    },

    /**
     * Getters
     */

    getArmour: function() {
        return this.armour;
    },

    getWeapon: function() {
        return this.weapon;
    },

    getPendant: function() {
        return this.pendant;
    },

    getRing: function() {
        return this.ring;
    },

    getBoots: function() {
        return this.boots;
    },

    /**
     * Miscellaneous
     */

    send: function(message) {
        this.world.pushToPlayer(this, message);
    },

    sendEquipment: function() {
        var self = this,
            info = [self.armour.getData(), self.weapon.getData(), self.pendant.getData(),
                self.ring.getData(), self.boots.getData()];

        self.send(new Messages.Equipment(Packets.EquipmentOpcode.Batch, info));
    },

    sendToSpawn: function() {
        var self = this;

        self.x = 20;
        self.y = 18;
    }

});