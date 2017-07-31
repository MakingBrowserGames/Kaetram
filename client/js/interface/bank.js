define(['jquery', './container/container'], function($, Container) {

    return Class.extend({

        init: function(game, inventoryContainer, size) {
            var self = this;

            self.game = game;
            self.inventoryContainer = inventoryContainer;

            self.player = game.player;

            self.body = $('#bank');

            self.container = new Container(size);
        },

        load: function(data) {

        }

    });

});