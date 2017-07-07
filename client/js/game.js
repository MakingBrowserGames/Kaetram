/* global Class, log, Packets, Modules, _ */

define(['./renderer/renderer', './utils/storage',
        './map/map', './network/socket', './entity/character/player/player',
        './renderer/updater', './controllers/entities', './controllers/input',
        './entity/character/player/playerhandler', './utils/pathfinder',
        './controllers/zoning', './controllers/info', './controllers/bubble',
        './controllers/interface',
        './utils/modules', './network/packets'],
        function(Renderer, LocalStorage, Map, Socket, Player, Updater,
                 Entities, Input, PlayerHandler, Pathfinder, Zoning, Info, Bubble, Interface) {

    return Class.extend({

        init: function(app) {
            var self = this;

            self.app = app;

            self.id = -1;

            self.socket = null;
            self.messages = null;
            self.renderer = null;
            self.updater = null;
            self.storage = null;
            self.entities = null;
            self.input = null;
            self.map = null;
            self.playerHandler = null;
            self.pathfinder = null;
            self.zoning = null;
            self.info = null;
            self.interface = null;

            self.player = null;

            self.stopped = false;
            self.started = false;
            self.ready = false;
            self.loaded = false;

            self.time = new Date();

            self.pvp = false;

            self.loadRenderer();
            self.loadControllers();
        },

        start: function() {
            var self = this;

            if (self.started)
                return;

            self.app.fadeMenu();
            self.tick();

            self.started = true;
        },

        stop: function() {
            var self = this;

            self.stopped = false;
            self.started = false;
            self.ready = false;
        },

        tick: function() {
            var self = this;

            if (self.ready) {

                self.time = new Date().getTime();

                self.renderer.render();
                self.updater.update();

                if (!self.stopped)
                    requestAnimFrame(self.tick.bind(self));
            }
        },

        unload: function() {
            var self = this;

            self.socket = null;
            self.messages = null;
            self.renderer = null;
            self.updater = null;
            self.storage = null;
            self.entities = null;
            self.input = null;
            self.map = null;
            self.playerHandler = null;
            self.pathfinder = null;
            self.zoning = null;
            self.info = null;
            self.interface = null;
        },

        loadRenderer: function() {
            var self = this,
                background = document.getElementById('background'),
                foreground = document.getElementById('foreground'),
                textCanvas = document.getElementById('textCanvas'),
                entities = document.getElementById('entities'),
                chatInput = document.getElementById('chatInput'),
                cursor = document.getElementById('cursor');

            self.app.sendStatus('Loading the renderer');

            self.setRenderer(new Renderer(background, entities, foreground, textCanvas, cursor, self));
        },

        loadControllers: function() {
            var self = this,
                hasWorker = self.app.hasWorker();

            self.app.sendStatus(hasWorker ? 'Loading maps - asynchronous' : null);

            if (hasWorker)
                self.loadMap();

            self.app.sendStatus('Loading local storage');

            self.setStorage(new LocalStorage());

            self.app.sendStatus('Initializing network socket');

            self.setSocket(new Socket(self));
            self.setMessages(self.socket.messages);
            self.setInput(new Input(self));

            self.app.sendStatus('Loading interfaces');

            self.setInterface(new Interface(self));

            self.setEntityController(new Entities(self));

            self.setInfo(new Info(self));

            self.setBubble(new Bubble(self));

            if (!hasWorker)
                self.loaded = true;
        },

        loadMap: function() {
            var self = this;

            self.map = new Map(self);

            self.map.onReady(function() {

                self.app.sendStatus('Loading the pathfinder');

                self.setPathfinder(new Pathfinder(self.map.width, self.map.height));

                self.renderer.setMap(self.map);
                self.renderer.loadCamera();

                self.app.sendStatus('Loading updater');

                self.setUpdater(new Updater(self));

                self.entities.load();
                self.renderer.setEntities(self.entities);

                self.app.sendStatus(null);

                self.loaded = true;
            });
        },

        connect: function() {
            var self = this;

            self.app.cleanErrors();

            setTimeout(function() {
                self.socket.connect();
            }, 1000);

            self.messages.onHandshake(function(data) {

                self.id = data.shift();
                self.development = data.shift();

                self.ready = true;

                if (!self.player)
                    self.createPlayer();

                if (!self.map)
                    self.loadMap();

                self.app.updateLoader('Logging in');

                if (self.app.isRegistering()) {
                    var registerInfo = self.app.registerFields,
                        username = registerInfo[0].val(),
                        password = registerInfo[1].val(),
                        email = registerInfo[3].val();

                    self.socket.send(Packets.Intro, [Packets.IntroOpcode.Register, username, password, email]);
                } else {
                    var loginInfo = self.app.loginFields,
                        name = loginInfo[0].val(),
                        pass = loginInfo[1].val();

                    self.socket.send(Packets.Intro, [Packets.IntroOpcode.Login, name, pass]);
                }
            });

            self.messages.onWelcome(function(data) {

                self.player.load(data);

                self.input.setPosition(self.player.getX(), self.player.getY());

                self.start();
                self.postLoad();
            });

            self.messages.onEquipment(function(equipType, info) {

                switch (equipType) {
                    case Packets.EquipmentOpcode.Batch:

                        for (var i = 0; i < info.length; i++)
                            self.player.setEquipment(i, info[i]);

                        break;

                    case Packets.EquipmentOpcode.Equip:
                        var equipmentType = info.shift(),
                            data = info.shift();

                        self.player.setEquipment(equipmentType, data);
                        break;

                    case Packets.EquipmentOpcode.Unequip:
                        self.player.unequip(info.shift());
                        break;
                }

            });

            self.messages.onSpawn(function(data) {
                var mobData = data.shift(),
                    type = mobData.shift();

                self.entities.create(type, mobData);
            });

            self.messages.onEntityList(function(data) {
                var ids = _.pluck(self.entities.getAll(), 'id'),
                    known = _.intersection(ids, data),
                    newIds = _.difference(data, known);

                self.entities.decrepit = _.reject(self.entities.getAll(), function(entity) {
                    return _.include(known, entity.id) || entity.id === self.player.id;
                });

                self.entities.clean();

                self.socket.send(Packets.Who, newIds);
            });

            self.messages.onMovement(function(data) {
                var opcode = data.shift(),
                    info = data.shift();

                switch(opcode) {
                    case Packets.MovementOpcode.Move:
                        var id = info.shift(),
                            x = info.shift(),
                            y = info.shift(),
                            forced = info.shift(),
                            teleport = info.shift(),
                            entity = self.entities.get(id);

                        if (!entity)
                            return;

                        if (forced)
                            entity.stop(true);

                        log.info(teleport);

                        self.moveCharacter(entity, x, y);

                        break;

                    case Packets.MovementOpcode.Follow:
                        var follower = self.entities.get(info.shift()),
                            followee = self.entities.get(info.shift()),
                            isRanged = info.shift(),
                            attackRange = info.shift();

                        if (!followee || !follower)
                            return;

                        log.info(isRanged + ' ' + attackRange);

                        follower.follow(followee);

                        break;
                }

            });

            self.messages.onTeleport(function(data) {
                var id = data.shift(),
                    x = data.shift(),
                    y = data.shift(),
                    isPlayer = id === self.player.id,
                    entity = self.entities.get(id);

                if (!entity)
                    return;

                entity.stop(true);
                entity.frozen = true;

                self.entities.unregisterPosition(entity);

                entity.setGridPosition(x, y);

                if (isPlayer) {
                    self.entities.clearPlayers(self.player);
                    self.player.clearHealthBar();
                    self.renderer.camera.centreOn(entity);
                    self.renderer.updateAnimatedTiles();
                } else {
                    delete self.entities.entities[entity.id];
                    return;
                }

                self.socket.send(Packets.Request, [self.player.id]);

                self.entities.registerPosition(entity);

                entity.frozen = false;

            });

            self.messages.onDespawn(function(id) {
                var entity = self.entities.get(id);

                if (!entity)
                    return;

                if (entity.type === 'item') {
                    self.entities.unregisterPosition(entity);
                    delete self.entities.entities[entity.id];
                    return;
                }

                entity.hitPoints = 0;

                entity.setSprite(self.getSprite('death'));
                entity.animate('death', 120, 1, function() {
                    self.entities.unregisterPosition(entity);
                    delete self.entities.entities[entity.id];
                });
            });

            self.messages.onCombat(function(data) {
                var opcode = data.shift(),
                    attacker = self.entities.get(data.shift()),
                    target = self.entities.get(data.shift());

                switch (opcode) {
                    case Packets.CombatOpcode.Initiate:
                        attacker.setTarget(target);

                        target.addAttacker(attacker);
                        target.setTarget(attacker);

                        if (target.id === self.player.id || attacker.id === self.player.id)
                            self.socket.send(Packets.Combat, [Packets.CombatOpcode.Initiate, attacker.id, target.id]);

                        break;

                    case Packets.CombatOpcode.Hit:

                        var hitData = data.shift(),
                            damage = hitData.shift(),
                            type = hitData.shift();

                        if (type === Modules.Hits.Damage) {
                            attacker.lookAt(target);
                            attacker.performAction(attacker.orientation, Modules.Actions.Attack);

                            self.info.create(type, [damage, target.id === self.player.id], target.x, target.y);
                        }

                        attacker.triggerHealthBar();
                        target.triggerHealthBar();

                        break;

                    case Packets.CombatOpcode.Finish:

                        log.info('finishing combat..?');

                        if (target) {
                            target.removeTarget();
                            target.forget();
                        }

                        if (attacker)
                            attacker.removeTarget();

                        break;
                }
            });

            self.messages.onAnimation(function(id, info) {
                var entity = self.entities.get(id),
                    animation = info.shift(),
                    speed = info.shift(),
                    count = info.shift();

                if (!entity)
                    return;

                entity.animate(animation, speed, count);
            });

            self.messages.onProjectile(function(type, info) {
                switch (type) {
                    case Packets.ProjectileOpcode.Create:

                        self.entities.create('projectile', info);

                        break;
                }
            });

            self.messages.onPopulation(function(population) {

            });

            self.messages.onPoints(function(data) {
                var id = data.shift(),
                    hitPoints = data.shift(),
                    mana = data.shift(),
                    entity = self.entities.get(id);

                if (!entity)
                    return;

                if (hitPoints)
                    entity.setHitPoints(hitPoints);

                if (mana)
                    entity.setMana(mana);
            });

            self.messages.onNetwork(function() {
                self.socket.send(Packets.Network, [Packets.NetworkOpcode.Pong]);
            });

            self.messages.onChat(function(info) {
                var id = info.shift(),
                    text = info.shift(),
                    duration = info.shift(),
                    entity = self.entities.get(id);

                if (!entity)
                    return;

                if (!duration)
                    duration = 5000;

                self.bubble.create(id, text, self.time, duration);
                self.bubble.setTo(entity);

                self.input.chatHandler.add(entity, text);
            });

            self.messages.onCommand(function(info) {

                /**
                 * This is for random miscellaneous commands that require
                 * a specific action done by the client as opposed to
                 * packet-oriented ones.
                 */
            });

            self.messages.onInventory(function(opcode, info) {

                return;

                switch (opcode) {
                    case Packets.InventoryOpcode.Batch:

                        self.interface.inventory.load(info);

                        break;

                    case Packets.InventoryOpcode.Add:

                        self.interface.inventory.add(info.index, info);

                        break;

                    case Packets.InventoryOpcode.Remove:

                        self.interface.inventory.remove(info.index);

                        break;
                }

            });

            self.messages.onNotification(function(opcode, message) {

                switch (opcode) {
                    case Packets.NotificationOpcode.Ok:

                        self.interface.displayNotify(message);

                        break;

                    case Packets.NotificationOpcode.YesNo:

                        self.interface.displayConfirm(message);

                        break;
                }

            });
        },

        postLoad: function() {
            var self = this;

            /**
             * Call this after the player has been welcomed
             * by the server and the client received the connection.
             */

            self.getCamera().setPlayer(self.player);

            self.renderer.renderedFrame[0] = -1;

            self.entities.addEntity(self.player);

            var defaultSprite = self.player.getSpriteName();

            self.player.setSprite(self.getSprite(defaultSprite));
            self.player.idle();

            self.socket.send(Packets.Ready, [true]);

            self.playerHandler = new PlayerHandler(self, self.player);

            self.renderer.updateAnimatedTiles();

            self.zoning = new Zoning(self);

            self.updater.setSprites(self.entities.sprites);
        },

        setPlayerMovement: function(direction) {
            this.player.direction = direction;
        },

        movePlayer: function(x, y) {
            this.moveCharacter(this.player, x, y);
        },

        moveCharacter: function(character, x, y) {
            if (!character)
                return;

            character.go(x, y);
        },

        findPath: function(character, x, y, ignores) {
            var self = this,
                grid = self.entities.grids.pathingGrid,
                path = [];

            if (self.map.isColliding(x, y) || !self.pathfinder || !character)
                return path;

            if (ignores)
                _.each(ignores, function(entity) { self.pathfinder.ignoreEntity(entity); });

            path = self.pathfinder.find(grid, character, x, y, false);

            if (ignores)
                self.pathfinder.clearIgnores();

            return path;
        },

        onInput: function(inputType, data) {
            this.input.handle(inputType, data);
        },

        handleDisconnection: function() {
            var self = this;

            /**
             * This function is responsible for handling sudden
             * disconnects of a player whilst in the game, not
             * menu-based errors.
             */

            if (!self.started)
                return;

            self.stop();
            self.renderer.stop();

            self.unload();

            self.app.showMenu();
            self.app.toggleLogin(false);
            self.app.updateLoader('');
            self.app.sendError(null, 'You have been disconnected from the server');
            self.app.statusMessage = null;

            self.loadRenderer();
            self.loadControllers();
        },

        resize: function() {
            var self = this;

            self.renderer.resize();
        },

        createPlayer: function() {
            var self = this;

            self.player = new Player();
        },

        getScaleFactor: function() {
            return this.app.getScaleFactor();
        },

        getStorage: function() {
            return this.storage;
        },

        getCamera: function() {
            return this.renderer.camera;
        },

        getSprite: function(spriteName) {
            return this.entities.getSprite(spriteName);
        },

        getEntityAt: function(x, y, ignoreSelf) {
            var self = this,
                entities = self.entities.grids.renderingGrid[y][x];

            if (_.size(entities) > 0)
                return entities[_.keys(entities)[ignoreSelf ? 1 : 0]];

            var items = self.entities.grids.itemGrid[y][x];

            if (_.size(items) > 0) {
                _.each(items, function(item) {
                    if (item.stackable)
                        return item;
                });

                return items[_.keys(items)[0]];
            }
        },

        setRenderer: function(renderer) {
            if (!this.renderer)
                this.renderer = renderer;
        },

        setStorage: function(storage) {
            if (!this.storage)
                this.storage = storage;
        },

        setSocket: function(socket) {
            if (!this.socket)
                this.socket = socket;
        },

        setMessages: function(messages) {
            if (!this.messages)
                this.messages = messages;
        },

        setUpdater: function(updater) {
            if (!this.updater)
                this.updater = updater;
        },

        setEntityController: function(entities) {
            if (!this.entities)
                this.entities = entities;
        },

        setInput: function(input) {
            var self = this;

            if (!self.input) {
                self.input = input;
                self.renderer.setInput(self.input);
            }
        },

        setPathfinder: function(pathfinder) {
            if (!this.pathfinder)
                this.pathfinder = pathfinder;
        },

        setInfo: function(info) {
            if (!this.info)
                this.info = info;
        },

        setBubble: function(bubble) {
            if (!this.bubble)
                this.bubble = bubble;
        },

        setInterface: function(intrface) {
            if (!this.interface)
                this.interface = intrface;
        }

    });

});