/* global log */

define(function() {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;

        },

        handle: function(event) {
            var self = this;

            log.info(event);
        }

    });

});