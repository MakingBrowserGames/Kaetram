/* global log */

define(['./character/character'], function(Character) {

    return Class.extend({

        init: function(entity) {
            var self = this;

            self.entity = entity;
            self.game = null;
        },

        load: function() {
            var self = this;

            if (!self.entity || !self.game)
                return;

            if (typeof self.entity === Character) {
                self.entity.onRequestPath(function(callback) {


                });

                self.entity.onMove(function(callback) {

                });
            }
        },

        setGame: function(game) {
            if (!this.game)
                this.game = game;
        }

    });

});