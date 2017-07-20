define(['jquery', '../page'], function($, Page) {

    return Page.extend({

        init: function(game) {
            var self = this;

            self._super('#settingsPage');

            self.game = game;

            self.volume = $('#volume');
            self.sfx = $('#sfx');

            self.load();
        },

        load: function() {
            var self = this;

            self.volume.on('input', function() {

            });

            self.sfx.on('input', function() {

            });

        }

    });

});