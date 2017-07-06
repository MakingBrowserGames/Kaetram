define(['./container'], function(Container) {

    return Class.extend({

        init: function(dialog) {
            var self = this;

            self.dialog = dialog;
            self.game = self.dialog.game;
            self.renderer = self.game.renderer;

            self.container = new Container(self.game, 20);

            self.selectedItem = null;
        },

        load: function() {

        }

    });

});