define(function() {

    /**
     * This is a player handler, responsible for all the callbacks
     * without having to clutter up the entire game file.
     */

    return Class.extend({

        init: function(game, player) {
            var self = this;

            self.game = game;
            self.input = game.input;
            self.player = player;

            self.load();
        },

        load: function() {
            var self = this;

            self.player.onRequestPath(function(x, y) {
                var ignores = [self.player];

                if (self.player.hasTarget())
                    ignores.push(self.player.target);

                log.info('Requested path to: ' + x + ' ' + y);

                return self.game.findPath(self.player, x, y, ignores);
            });

            self.player.onStartPathing(function(path) {
                var i = path.length - 1;

                self.input.selectedX = path[i][0];
                self.input.selectedY = path[i][1];
                self.input.selectedCellVisible = true;

                log.info('Starting pathing to: ' + x + ' ' + y);

                //TODO - Fix dirty on mobile for target? May not be necessary if done in the renderer.
            });
        }

    });

});