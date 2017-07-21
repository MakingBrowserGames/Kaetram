define(['jquery', '../page'], function($, Page) {

    return Page.extend({

        init: function(game) {
            var self = this;

            self._super('#settingsPage');

            self.game = game;
            self.audio = game.audio;
            self.storage = game.storage;

            self.volume = $('#volume');
            self.sfx = $('#sfx');

            self.load();
        },

        load: function() {
            var self = this;

            self.volume.value = self.storage.data.settings.music;
            self.sfx.value = self.storage.data.settings.sfx;

            self.volume.on('input', function() {
                self.audio.song.volume = this.value / 100;
            });

            self.volume.change(function() {
                self.storage.data.settings.music = this.value;
                self.storage.save();
            });

            self.sfx.change(function() {
                self.storage.data.settings.sfx = this.value;
                self.storage.save();
            });

        }

    });

});