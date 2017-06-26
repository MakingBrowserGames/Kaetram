/* global Modules, log, _, Packets */

define(['jquery', '../entity/animation', './chat'], function($, Animation, Chat) {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;
            self.app = game.app;
            self.renderer = game.renderer;

            self.selectedCellVisible = false;
            self.previousClick = {};
            self.cursorVisible = true;
            self.targetVisible = true;
            self.selectedX = -1;
            self.selectedY = -1;

            self.cursor = null;
            self.newCursor = null;

            self.targetColour = null;
            self.newTargetColour = null;

            self.targetData = null;

            self.cursors = {};

            self.hovering = null;

            self.mouse = {
                x: 0,
                y: 0
            };

            self.load();
        },

        load: function() {
            var self = this;

            /**
             * This is the animation for the target
             * cell spinner sprite (only on desktop)
             */

            self.targetAnimation = new Animation('idle_down', 4, 0, 16, 16);
            self.targetAnimation.setSpeed(50);

            self.chatHandler = new Chat(self.game);
        },

        loadCursors: function() {
            var self = this;

            self.cursors['hand'] = self.game.getSprite('hand');
            self.cursors['sword'] = self.game.getSprite('sword');
            self.cursors['loot'] = self.game.getSprite('loot');
            self.cursors['target'] = self.game.getSprite('target');
            self.cursors['arrow'] = self.game.getSprite('arrow');
            self.cursors['talk'] = self.game.getSprite('talk');
            self.cursors['spell'] = self.game.getSprite('spell');
            self.cursors['bow'] = self.game.getSprite('bow');

            self.newCursor = self.cursors['hand'];
            self.newTargetColour = 'rgba(255, 255, 255, 0.5)';

            log.info('Loaded Cursors!');
        },

        handle: function(inputType, data) {
            var self = this;

            switch(inputType) {
                case Modules.InputType.Key:

                    if (self.chatHandler.isActive()) {
                        self.chatHandler.key(data);
                        return;
                    }

                    switch(data) {
                        case Modules.Keys.Up:
                        case Modules.Keys.W:

                            self.game.setPlayerMovement('up');

                            break;

                        case Modules.Keys.A:
                        case Modules.Keys.Left:

                            self.game.setPlayerMovement('left');

                            break;

                        case Modules.Keys.S:
                        case Modules.Keys.Down:

                            self.game.setPlayerMovement('down');

                            break;

                        case Modules.Keys.D:
                        case Modules.Keys.Right:

                            self.game.setPlayerMovement('right');

                            break;

                        case Modules.Keys.Three:

                            self.renderer.camera.center();

                            break;

                        case Modules.Keys.Four:

                            self.renderer.camera.decenter();

                            break;

                        case Modules.Keys.Five:

                            /**
                             * Testing to see how the current info system holds up.
                             */

                            self.game.renderer.forEachVisibleEntity(function(entity) {
                                self.game.bubble.create(entity.id, 'Hello humans.', self.game.time, 5000);
                                self.game.bubble.setTo(entity);
                            });

                            break;

                        case Modules.Keys.Enter:

                            self.chatHandler.toggle();

                            break;
                    }

                    break;

                    case Modules.InputType.LeftClick:

                        self.setCoords(data);
                        self.click(self.getCoords());

                        break;
            }
        },

        keyUp: function(key) {
            var self = this;

            switch(key) {
                case Modules.Keys.W:
                case Modules.Keys.A:
                case Modules.Keys.S:
                case Modules.Keys.D:
                    self.getPlayer().direction = null;
                    break;
            }
        },

        keyMove: function(position) {
            var self = this;

            if (!self.getPlayer().hasPath())
                self.click(position);
        },

        click: function(position) {
            var self = this,
                player = self.getPlayer();

            if (self.chatHandler.input.is(':visible') && self.chatHandler.input.val() !== '')
                self.chatHandler.hideInput();

            if ((self.game.zoning && self.game.zoning.direction) || (position.x === player.gridX && position.y === player.gridY))
                return;

            var entity = self.game.getEntityAt(position.x, position.y);

            if (entity) {
                if (entity.type !== 'item')
                    player.setTarget(entity);

                if (player.getDistance(entity) < 7 && player.isRanged() && self.isCharacter(entity)) {
                    self.game.socket.send(Packets.Target, [Packets.TargetOpcode.Attack, entity.id]);
                    player.lookAt(entity);
                    return;
                }

                if (entity.type !== 'item') {
                    player.follow(entity);
                    return;
                }
            } else
                player.removeTarget();

            player.go(position.x, position.y);
        },

        updateCursor: function() {
            var self = this;

            if (!self.cursorVisible)
                return;

            if (self.newCursor !== self.cursor)
                self.cursor = self.newCursor;

            if (self.newTargetColour !== self.targetColour)
                self.targetColour = self.newTargetColour;
        },

        moveCursor: function() {
            var self = this;

            if (self.renderer.mobile)
                return;

            var position = self.getCoords(),
                entity = self.game.getEntityAt(position.x, position.y);

            if (!entity || (entity.id === self.getPlayer().id)) {
                self.setCursor(self.cursors['hand']);
                self.hovering = null;
            } else {
                switch (entity.type) {
                    case 'item':
                        self.setCursor(self.cursors['loot']);
                        self.hovering = Modules.Hovering.Item;
                        break;

                    case 'mob':
                        self.setCursor(self.cursors[self.getPlayer().isRanged() ? 'bow' : 'sword']);
                        self.hovering = Modules.Hovering.Mob;
                        break;

                    case 'player':
                        self.setCursor(self.cursors['talk']);
                        self.hovering = Modules.Hovering.Player;
                        break;

                    case 'npc':
                        self.setCursor(self.cursors['talk']);
                        self.hovering = Modules.Hovering.NPC;
                        break;
                }
            }
        },

        setPosition: function(x, y) {
            var self = this;

            self.selectedX = x;
            self.selectedY = y;
        },

        setCoords: function(event) {
            var self = this,
                offset = self.app.canvas.offset(),
                width = self.renderer.background.width,
                height = self.renderer.background.height;

            self.mouse.x = Math.round((event.pageX - offset.left) / self.app.getZoom());
            self.mouse.y = Math.round((event.pageY - offset.top) / self.app.getZoom());

            if (self.mouse.x >= width)
                self.mouse.x = width - 1;
            else if (self.mouse.x <= 0)
                self.mouse.x = 0;

            if (self.mouse.y >= height)
                self.mouse.y = height - 1;
            else if (self.mouse.y <= 0)
                self.mouse.y = 0;
        },

        setCursor: function(cursor) {
            var self = this;

            if (cursor)
                self.newCursor = cursor;
            else
                log.error('Cursor: ' + cursor + ' could not be found.');
        },

        getCoords: function() {
            var self = this,
                tileScale = self.renderer.tileSize * self.renderer.getDrawingScale(),
                offsetX = self.mouse.x % tileScale,
                offsetY = self.mouse.y % tileScale,
                x = ((self.mouse.x - offsetX) / tileScale) + self.game.getCamera().gridX,
                y = ((self.mouse.y - offsetY) / tileScale) + self.game.getCamera().gridY;

            return {
                x: x,
                y: y
            }
        },

        getTargetData: function() {
            var self = this,
                frame = self.targetAnimation.currentFrame,
                scale = self.renderer.getDrawingScale(),
                sprite = self.game.getSprite('target');

            if (!sprite.loaded)
                sprite.load();

            return self.targetData = {
                sprite: sprite,
                x: frame.x * scale,
                y: frame.y * scale,
                width: sprite.width * scale,
                height: sprite.height * scale,
                dx: self.selectedX * 16 * scale,
                dy: self.selectedY * 16 * scale,
                dw: sprite.width * scale,
                dh: sprite.height * scale
            }
        },

        isCharacter: function(entity) {
            return entity.type === 'mob' || entity.type === 'player';
        },

        getPlayer: function() {
            return this.game.player;
        },

        onKey: function(callback) {
            this.keyCallback = callback;
        },

        onRightClick: function(callback) {
            this.rightClickCallback = callback;
        },

        onLeftClick: function(callback) {
            this.leftClickCallback = callback;
        }

    });

});