/* global log, Packets */

define(function() {

    /**
     * This is a player handler, responsible for all the callbacks
     * without having to clutter up the entire game file.
     */

    return Class.extend({

        init: function(game, player) {
            var self = this;

            self.game = game;
            self.camera = game.getCamera();
            self.input = game.input;
            self.player = player;
            self.entities = game.entities;
            self.socket = game.socket;

            self.load();
        },

        load: function() {
            var self = this;

            self.player.onRequestPath(function(x, y) {
                self.camera.focusMode = true;

                var ignores = [self.player];

                if (self.player.hasTarget())
                    ignores.push(self.player.target);

                return self.game.findPath(self.player, x, y, ignores);
            });

            self.player.onStartPathing(function(path) {
                var i = path.length - 1;

                self.input.selectedX = path[i][0];
                self.input.selectedY = path[i][1];
                self.input.selectedCellVisible = true;

                //TODO - Fix dirty on mobile for target? May not be necessary if done in the renderer.
            });

            self.player.onStopPathing(function(x, y, forced) {
                self.entities.unregisterPosition(self.player);
                self.entities.registerPosition(self.player);

                self.camera.focusMode = false;
                self.camera.clip();
            });

            self.player.onBeforeStep(function() {
                self.entities.unregisterPosition(self.player);
            });

            self.player.onStep(function() {
                if (self.player.hasNextStep())
                    self.entities.registerDuality(self.player);

                self.socket.send(Packets.Step, [self.player.gridX, self.player.gridY]);
            });

            self.player.onMove(function() {
                log.info('Player moved!');
            });
        }

    });

});