define(['jquery'], function($) {

    return Class.extend({

        init: function(player) {
            var self = this;

            self.player = player;

            self.body = $('#charInfo');
            self.button = $('#profileButton');

            self.load();
        },

        load: function() {

        }

    });

});