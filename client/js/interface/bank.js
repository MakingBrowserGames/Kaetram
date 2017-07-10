define(['jquery', './container/container'], function($, Container) {

    return Class.extend({

        init: function(game, size) {
            var self = this;

            self.game = game;
            self.body = $('#bank');

            self.container = new Container(size);
        }

    });

});