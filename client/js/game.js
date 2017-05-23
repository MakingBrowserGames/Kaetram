/* global Class, log, Packets, Modules, _ */

define(['./renderer/renderer', './utils/storage',
        './map/map', './network/socket', './entity/character/player/player',
        './renderer/updater', './controllers/entities', './controllers/input',
        './entity/character/player/playerhandler',
        './utils/pathfinder', './utils/modules', './network/packets'],
        function(Renderer, LocalStorage, Map, Socket, Player, Updater, Entities, Input, PlayerHandler, Pathfinder) {

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

            self.player = null;

            self.stopped = false;
            self.started = false;
            self.ready = false;

            self.time = new Date();

            self.loadRenderer();
            self.loadControllers();
            self.loadMisc();
        },

        start: function() {
            var self = this;

            self.started = true;

            self.app.fadeMenu();
            self.getCamera().setPlayer(self.player);
            self.tick();

            self.renderer.renderedFrame[0] = -1;
            self.input.newCursor = self.getSprite('hand');
            self.input.newTargetColour = 'rgba(255, 255, 255, 0.5)';
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

        loadRenderer: function() {
            var self = this,
                background = document.getElementById('background'),
                foreground = document.getElementById('foreground'),
                textCanvas = document.getElementById('textCanvas'),
                entities = document.getElementById('entities'),
                chatInput = document.getElementById('chatInput'),
                cursor = document.getElementById('cursor');

            self.setRenderer(new Renderer(background, entities, foreground, textCanvas, cursor, self));
        },

        loadControllers: function() {
            var self = this;

            self.setStorage(new LocalStorage());
            self.setSocket(new Socket(self));
            self.setMessages(self.socket.messages);
            self.setEntityController(new Entities(self));
            self.setInput(new Input(self));
        },

        loadMisc: function() {
            var self = this;

            if (self.app.hasWorker())
                self.loadMap();
        },

        loadMap: function() {
            var self = this;

            self.map = new Map(self);

            self.map.onReady(function() {
                log.info('The map has been loaded!');

                self.setPathfinder(new Pathfinder(self.map.width, self.map.height));

                self.renderer.setMap(self.map);
                self.renderer.loadCamera();

                self.setUpdater(new Updater(self));

                self.entities.load();
                self.renderer.setEntities(self.entities);
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
                        email = registerInfo[2].val();

                    self.socket.send(Packets.Intro, [Packets.IntroOpcode.Register, username, password, email]);
                } else {
                    var loginInfo = self.app.loginFields,
                        name = loginInfo[0].val(),
                        pass = loginInfo[1].val();

                    self.socket.send(Packets.Intro, [Packets.IntroOpcode.Login, name, pass]);
                }
            });

            self.messages.onWelcome(function(data) {

                self.player.id = data.shift();
                self.player.username = data.shift();

                var x = data.shift(),
                    y = data.shift();

                self.player.setGridPosition(x, y);

                self.player.kind = data.shift();
                self.player.rights = data.shift();

                var hitPointsData = data.shift(),
                    manaData = data.shift();

                self.player.hitPoints = hitPointsData.shift();
                self.player.maxHitPoints = hitPointsData.shift();

                self.player.mana = manaData.shift();
                self.player.maxMana = manaData.shift();

                self.player.experience = data.shift();
                self.player.level = data.shift();

                self.player.lastLogin = data.shift();
                self.player.pvpKills = data.shift();
                self.player.pvpDeaths = data.shift();

                self.start();

                self.entities.addEntity(self.player);

                var defaultSprite = self.player.getSpriteName();

                self.player.setSprite(self.getSprite(defaultSprite));
                self.player.performAction(Modules.Orientation.Down, Modules.Actions.Idle);

                self.socket.send(Packets.Ready, [true]);

                self.playerHandler = new PlayerHandler(self, self.player);
            });

            self.messages.onEquipment(function(equipType, info) {

                switch (equipType) {
                    case Packets.EquipmentOpcode.Batch:

                        for (var i = 0; i < info.length; i++)
                            self.player.setEquipment(i, info);

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

            self.app.toggleLogin(false);
            self.app.sendError(null, 'You have been disconnected from the server...');
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
        }

    });

});