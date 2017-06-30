define(function() {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;
            self.player = game.player;

            self.inventory = $('#inventory');
        },

        show: function() {
            this.inventory.fadeIn('fast');
        },

        hide: function() {
            this.inventory.fadeOut('slow');
        },

        isVisible: function() {
            return this.inventory.is(':visible');
        }

    });

});