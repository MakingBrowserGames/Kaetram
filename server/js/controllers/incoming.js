/* global log */

var cls = require('../lib/class'),
    Packets = require('../network/packets'),
    Request = require('request'),
    config = require('../../config.json'),
    Creator = require('../database/creator'),
    _ = require('underscore'),
    Messages = require('../network/messages'),
    sanitizer = require('sanitizer'),
    Commands = require('./commands'),
    Items = require('../util/items');

module.exports = Incoming = cls.Class.extend({

    init: function(player) {
        var self = this;

        self.player = player;
        self.connection = self.player.connection;
        self.world = self.player.world;
        self.mysql = self.player.mysql;
        self.commands = new Commands(self.player);

        self.connection.listen(function(data) {

            var packet = data.shift(),
                message = data[0];

            switch(packet) {

                case Packets.Intro:
                    self.handleIntro(message);
                    break;

                case Packets.Ready:
                    self.handleReady(message);
                    break;

                case Packets.Who:
                    self.handleWho(message);
                    break;

                case Packets.Movement:
                    self.handleMovement(message);
                    break;

                case Packets.Request:
                    self.handleRequest(message);
                    break;

                case Packets.Target:
                    self.handleTarget(message);
                    break;

                case Packets.Combat:
                    self.handleCombat(message);
                    break;

                case Packets.Projectile:
                    self.handleProjectile(message);
                    break;

                case Packets.Network:
                    self.handleNetwork(message);
                    break;

                case Packets.Chat:
                    self.handleChat(message);
                    break;

                case Packets.Inventory:
                    self.handleInventory(message);
                    break;

            }

        });
    },

    handleIntro: function(message) {
        var self = this,
            loginType = message.shift(),
            username = message.shift().toLowerCase(),
            password = message.shift(),
            isRegistering = loginType === Packets.IntroOpcode.Register,
            email = isRegistering ? message.shift() : '',
            formattedUsername = username.charAt(0).toUpperCase() + username.slice(1);

        self.player.username = formattedUsername.substr(0, 32).trim();
        self.player.password = password.substr(0, 32);
        self.player.email = email.substr(0, 128);

        if (self.world.playerInWorld(self.player.username)) {
            self.connection.sendUTF8('loggedin');
            self.connection.close('Player already logged in..');
            return;
        }

        if (config.offlineMode) {
            var creator = new Creator(null);

            self.player.isNew = true;
            self.player.load(creator.getPlayerData(self.player));
            self.player.isNew = false;
            self.player.intro();

            return;
        }

        if (isRegistering) {
            var registerOptions = {
                method: 'GET',
                uri: 'https://taptapadventure.com/api/register.php?a=' + '9a4c5ddb-5ce6-4a01-a14f-3ae49d8c6507' + '&u=' + self.player.username + '&p=' + self.player.password + '&e=' + self.player.email
            };

            Request(registerOptions, function(error, reponse, body) {
                try {
                    var data = JSON.parse(JSON.parse(body).data);

                    switch (data.code) {
                        case 'ok':
                            self.mysql.register(self.player);
                            break;

                        case 'internal-server-error': //email

                            self.connection.sendUTF8('emailexists');
                            self.connection.close('Email not available.');
                            break;

                        case 'not-authorised': //username
                            self.connection.sendUTF8('userexists');
                            self.connection.close('Username not available.');
                            break;

                        default:

                            self.connection.sendUTF8('error');
                            self.connection.close('Unknown API Response: ' + error);
                            break;
                    }

                } catch (e) {
                    log.info('Could not decipher API message');
                    self.connection.sendUTF8('disallowed');
                    self.connection.close('API response is malformed!')
                }
            });

        } else {
            var loginOptions = {
                method: 'POST',
                uri: 'https://forum.taptapadventure.com/api/ns/login',
                form: {
                    'username': self.player.username.toLowerCase(),
                    'password': self.player.password
                }
            };

            Request(loginOptions, function(error, response, body) {
                var data;

                /**
                 * The website may respond with HTML message if
                 * the forums are down. In this case we catch any
                 * exception and ensure it does not proceed any
                 * further. We tell players that the server doesn't
                 * allow connections.
                 */

                try {
                    data = JSON.parse(body);
                } catch (e) {
                    log.info('Could not decipher API message');
                    self.connection.sendUTF8('disallowed');
                    self.connection.close('API response is malformed!');
                }

                if (data && data.message) {
                    self.connection.sendUTF8('invalidlogin');
                    self.connection.close('Wrong password entered for: ' + self.player.username);
                } else
                    self.mysql.login(self.player);

            });
        }
    },

    handleReady: function(message) {
        var self = this,
            isReady = message.shift();

        if (!isReady)
            return;

        self.player.ready = true;

        self.world.handleEntityGroup(self.player);
        self.world.pushEntities(self.player);

        self.player.sendEquipment();
        self.player.loadInventory();
    },

    handleWho: function(message) {
        var self = this;

        _.each(message.shift(), function(id) {
            var entity = self.world.getEntityByInstance(id);

            if (entity && entity.id)
                self.player.send(new Messages.Spawn(entity));

        });
    },

    handleMovement: function(message) {
        var self = this,
            opcode = message.shift();

        switch (opcode) {
            case Packets.MovementOpcode.Request:
                var requestX = message.shift(),
                    requestY = message.shift(),
                    playerX = message.shift(),
                    playerY = message.shift();

                if (playerX !== self.player.x || playerY !== self.player.y) {
                    log.info('[Request] Player not in sync..');
                    return;
                }

                self.player.guessPosition(requestX, requestY);

                break;

            case Packets.Movement.Started:
                var selectedX = message.shift(),
                    selectedY = message.shift(),
                    pX = message.shift(),
                    pY = message.shift();

                if (pX !== self.player.x || pY !== self.player.y)
                    return;

                self.player.moving = true;

                break;

            case Packets.MovementOpcode.Step:
                var x = message.shift(),
                    y = message.shift();

                self.player.setPosition(x, y);

                break;

            case Packets.MovementOpcode.Stop:
                var posX = message.shift(),
                    posY = message.shift(),
                    id = message.shift(),
                    entity = self.world.getEntityByInstance(id);

                if (entity && entity.type === 'item')
                    self.player.inventory.add(entity);

                if (self.world.map.isDoor(posX, posY)) {
                    var destination = self.world.map.getDoorDestination(posX, posY);

                    self.world.pushToAdjacentGroups(self.player.group, new Messages.Teleport(self.player.instance, destination.x, destination.y));

                    self.player.setPosition(destination.x, destination.y);
                    self.player.checkGroups();

                    self.world.cleanCombat(self.player);

                } else
                    self.player.setPosition(posX, posY);

                self.player.moving = false;

                break;

            case Packets.MovementOpcode.Entity:

                var instance = message.shift(),
                    entityX = message.shift(),
                    entityY = message.shift(),
                    oEntity = self.world.getEntityByInstance(instance);

                if (!oEntity || (oEntity.x === entityX && oEntity.y === entityY))
                    return;

                oEntity.setPosition(entityX, entityY);

                if (oEntity.type === 'mob' && oEntity.distanceToSpawn() > oEntity.spawnDistance) {
                    oEntity.removeTarget();
                    oEntity.combat.forget();
                    oEntity.return();

                    self.world.pushBroadcast(new Messages.Movement(Packets.MovementOpcode.Move, [instance, oEntity.spawnLocation[0], oEntity.spawnLocation[1], false, false]));
                    self.world.pushBroadcast(new Messages.Combat(Packets.CombatOpcode.Finish, null, oEntity.instance));
                }

                if (oEntity.hasTarget())
                    oEntity.combat.forceAttack();

                break;
        }
    },

    handleRequest: function(message) {
        var self = this,
            id = message.shift();

        if (id !== self.player.instance)
            return;

        self.world.pushEntities(self.player);
    },

    handleTarget: function(message) {
        var self = this,
            opcode = message.shift(),
            instance = message.shift();

        switch (opcode) {

            case Packets.TargetOpcode.Talk:



                break;

            case Packets.TargetOpcode.Attack:

                var target = self.world.getEntityByInstance(instance);

                if (!target)
                    return;

                self.world.pushToAdjacentGroups(target.group, new Messages.Combat(Packets.CombatOpcode.Initiate, self.player.instance, target.instance));

                break;

            case Packets.TargetOpcode.None:

                if (self.player.hasTarget())
                    self.player.removeTarget();

                break;
        }
    },

    handleCombat: function(message) {
        var self = this,
            opcode = message.shift();

        switch (opcode) {
            case Packets.CombatOpcode.Initiate:
                var attacker = self.world.getEntityByInstance(message.shift()),
                    target = self.world.getEntityByInstance(message.shift());

                attacker.setTarget(target);

                attacker.combat.start();
                attacker.setTarget(target);

                attacker.combat.attack(target);

                if (target.combat.isAttacked())
                    target.combat.addAttacker(attacker);

                break;
        }
    },

    handleProjectile: function(message) {
        var self = this,
            type = message.shift();

        switch (type) {
            case Packets.ProjectileOpcode.Impact:
                var projectile = self.world.getEntityByInstance(message.shift()),
                    target = self.world.getEntityByInstance(message.shift());

                if (!target || !projectile)
                    return;

                self.world.handleDamage(projectile.owner, target, projectile.damage);

                if (target.combat.started || target.isDead() || target.type !== 'mob')
                    return;

                target.combat.start();
                target.setTarget(projectile.owner);
                target.combat.addAttacker(projectile.owner);
                target.combat.attack(projectile.owner);

                break;
        }
    },

    handleNetwork: function(message) {
        var self = this,
            opcode = message.shift();

        switch (opcode) {
            case Packets.NetworkOpcode.Pong:
                log.info('Pingy pongy pung pong.');
                break;
        }
    },

    handleChat: function(message) {
        var self = this,
            text = sanitizer.escape(sanitizer.sanitize(message.shift()));

        if (!text || text.length < 1 || !(/\S/.test(text)))
            return;

        if (text.charAt(0) === '/' || text.charAt(0) === ';')
            self.commands.parse(text);
        else {
            if (self.player.isMuted()) {
                //send notification
                return;
            }

            self.world.pushToGroup(self.player.group, new Messages.Chat(self.player.instance, text, 7000));
        }

    },

    handleInventory: function(message) {
        var self = this,
            opcode = message.shift();

        switch (opcode) {
            case Packets.InventoryOpcode.Remove:
                var item = message.shift(),
                    count;

                if (!item)
                    return;

                if (item.count > 1)
                    count = message.shift();

                var id = Items.stringToId(item.string);

                self.player.inventory.remove(id, count ? count : item.count, item.index);

                self.world.dropItem(id, count, self.player.x, self.player.y);

                break;

            case Packets.InventoryOpcode.Select:
                var index = message.shift(),
                    slot = self.player.inventory.slots[index],
                    string = slot.string,
                    sCount = slot.count,
                    ability = slot.ability,
                    abilityLevel = slot.abilityLevel;

                if (!slot)
                    return;

                id = Items.stringToId(slot.string);

                if (slot.equippable) {

                    self.player.inventory.remove(id, slot.count, slot.index);

                    self.player.equip(string, sCount, ability, abilityLevel);

                } else if (slot.edible) {

                    self.player.inventory.remove(id, 1, slot.index);

                    self.player.eat(id);

                }

                break;
        }
    }

});