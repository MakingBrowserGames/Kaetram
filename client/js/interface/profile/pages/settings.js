/* global log */

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

            self.volume.val(self.getMusicLevel());
            self.sfx.val(self.getSFXLevel());

            self.game.app.updateRange(self.volume);
            self.game.app.updateRange(self.sfx);

            self.volume.on('input', function() {
                self.audio.song.volume = this.value / 100;
            });

            self.volume.change(function() {
                self.setMusicLevel(this.value);
            });

            self.sfx.change(function() {
                self.setSFXLevel(this.value);
            });
        },

        setMusicLevel: function(musicLevel) {
            var self = this;

            self.storage.data.settings.music = musicLevel;
            self.storage.save();
        },

        setSFXLevel: function(sfxLevel) {
            var self = this;

            self.storage.data.settings.sfx = sfxLevel;
            self.storage.save();
        },

        getMusicLevel: function() {
            return this.storage.data.settings.music;
        },

        getSFXLevel: function() {
            return this.storage.data.settings.sfx;
        }
    });

});