define(['jquery', '../page'], function($, Page) {

    return Page.extend({

        init: function(game) {
            var self = this;

            self._super('#statePage');

            self.game = game;
            self.player = game.player;

            self.load();
        },

        load: function() {
            var self = this;


        }

    });

});