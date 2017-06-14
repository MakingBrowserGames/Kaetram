/* global module, log */

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
    Packets = require('../../../../network/packets'),
    Modules = require('../../../../util/modules'),
    Handler = require('./handler'),
    Quests = require('./quests');

module.exports = Player = Character.extend({

    init: function(world, database, connection, clientId) {
        var self = this;

        self.world = world;
        self.mysql = database;
        self.connection = connection;

        self.clientId = clientId;

        self.incoming = new Incoming(self);

        self.isNew = false;
        self.ready = false;

        self.inventory = null;

        self.moving = false;
        self.potentialPosition = null;
        self.futurePosition = null;

        self.groupPosition = null;
        self.newGroup = false;

        self._super(-1, 'player', self.connection.id, -1, -1);

        self.handler = new Handler(self);
        self.quests = new Quests(self);
    },

    load: function(data) {
        var self = this;

        self.setPosition(data.x, data.y);

        self.kind = data.kind;
        self.rights = data.rights;
        self.experience = data.experience;
        self.ban = data.ban;
        self.membership = data.membership;
        self.lastLogin = data.lastLogin;
        self.pvpKills = data.pvpKills;
        self.pvpDeaths = data.pvpDeaths;

        self.level = Formulas.expToLevel(self.experience);
        self.hitPoints = new Hitpoints(data.hitPoints, Formulas.getMaxHitPoints(self.level));
        self.mana = new Mana(data.mana, Formulas.getMaxMana(self.level));

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

        if (self.x <= 0 || self.y <= 0)
            self.sendToSpawn();

        if (self.hitPoints.getHitPoints() < 0)
            self.hitPoints.setHitPoints(self.hitPoints.getMaxHitPoints());

        if (self.mana.getMana() < 0)
            self.mana.setMana(self.mana.getMaxMana());

        var info = [
                self.instance,
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

        self.groupPosition = [self.x, self.y];

        /**
         * Send player data to client here
         */

        self.world.addPlayer(self);

        self.send(new Messages.Welcome(info));
    },

    equip: function(type, id, count, skill, skillLevel) {
        var self = this;

        switch(type) {
            case Modules.Equipment.Armour:

                self.setArmour(id, count, skill, skillLevel);
                break;

            case Modules.Equipment.Weapon:


                self.setWeapon(id, count, skill, skillLevel);
                break;

            case Modules.Equipment.Pendant:


                self.setPendant(id, count, skill, skillLevel);
                break;

            case Modules.Equipment.Ring:


                self.setRing(id, count, skill, skillLevel);
                break;

            case Modules.Equipment.Boots:


                self.setBoots(id, count, skill, skillLevel);
                break;
        }
    },

    applyDamage: function(damage) {
        this.hitPoints.decrement(damage);
    },

    getHitPoints: function() {
        return this.hitPoints.getHitPoints();
    },

    /**
     * Setters
     */

    setArmour: function(id, count, skill, skillLevel) {
        var self = this;

        if (!id)
            return;

        if (self.armour)
            self.armour.update();
        else
            self.armour = new Armour(Items.idToString(id), id, count, skill, skillLevel);
    },

    setWeapon: function(id, count, skill, skillLevel) {
        var self = this;

        if (!id)
            return;

        //TODO - Don't forget to change this

        self.weapon = new Weapon(Items.idToString(87), 87, count, skill, skillLevel);

        if (self.weapon.ranged)
            self.attackRange = 7;
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

    guessPosition: function(x, y) {
        this.potentialPosition = {
            x: x,
            y: y
        }
    },

    setPosition: function(x, y) {
        var self = this;

        self._super(x, y);

        self.world.pushToAdjacentGroups(self.group, new Messages.Movement(self.instance, Packets.MovementOpcode.Move, false, false, x, y), self.instance);
    },

    setFuturePosition: function(x, y) {
        /**
         * Most likely will be used for anti-cheating methods
         * of calculating the actual time and duration for the
         * displacement.
         */

        this.futurePosition = {
            x: x,
            y: y
        }
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

    getState: function() {
        var self = this;

        return [
            self.type,
            self.instance,
            self.username,
            self.x,
            self.y,
            self.rights,
            self.level,
            self.hitPoints.getData(),
            self.pvpKills,
            self.pvpDeaths,
            self.armour.getData(),
            self.weapon.getData(),
            self.pendant.getData(),
            self.ring.getData(),
            self.boots.getData()
        ]
    },

    getRemoteAddress: function() {
        return this.connection.socket.conn.remoteAddress;
    },

    isRanged: function() {
        return this.weapon && this.weapon.isRanged();
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

        self.x = 26;
        self.y = 85;
    },

    stopMovement: function(force) {
        /**
         * Forcefully stopping the player will simply hault
         * them in between tiles. Should only be used if they are
         * being transported elsewhere.
         */

        var self = this;

        self.send(new Messages.Movement(Packets.MovementOpcode.Stop, force));
    },

    finishedTutorial: function() {
        var self = this;

        if (!self.quests)
            return false;

        return self.quests.getQuest('Introduction').isFinished();
    },

    checkGroups: function() {
        var self = this;

        if (!self.groupPosition)
            return;

        var diffX = Math.abs(self.groupPosition[0] - self.x),
            diffY = Math.abs(self.groupPosition[1] - self.y);

        if (diffX >= 10 || diffY >= 10) {
            self.groupPosition = [self.x, self.y];

            if (self.groupCallback)
                self.groupCallback();
        }

    },

    movePlayer: function() {
        var self = this;

        /**
         * Server-sided callbacks towards movement should
         * not be able to be overwritten. In the case that
         * this is used (for Quests most likely) the server must
         * check that no hacker removed the constraint in the client-side.
         * If they are not within the bounds, apply the according punishment.
         */

        self.send(new Messages.Movement(Packets.MovementOpcode.Started));

    },

    loadInventory: function() {
        var self = this;

    },

    onGroup: function(callback) {
        this.groupCallback = callback;
    },

    onAttack: function(callback) {
        this.attackCallback = callback;
    },

    onHit: function(callback) {
        this.hitCallback = callback;
    }

});