/* global log, Detect */

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

            self.info = $('#info');

            self.soundCheck = $('#soundCheck');
            self.cameraCheck = $('#cameraCheck');
            self.debugCheck = $('#debugCheck');

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

            self.soundCheck.click(function() {
                var active = self.soundCheck.hasClass('active');

                if (active) {
                    self.audio.enabled = true;

                    self.audio.reset(self.audio.song);
                    self.audio.song = null;
                } else
                    self.audio.update();

                self.soundCheck.toggleClass('active');

                self.setSound(active);
            });

            self.cameraCheck.click(function() {
                var active = self.cameraCheck.hasClass('active');

                self.game.renderer.camera.centered = active;

                self.cameraCheck.toggleClass('active');

                self.setCamera(active);
            });

            self.debugCheck.click(function() {
                var active = self.debugCheck.hasClass('active');

                self.debugCheck.toggleClass('active');

                self.game.renderer.debugging = active;

                self.setDebug(active);
            });

            if (self.audio.isEnabled())
                self.soundCheck.addClass('active');

            if (self.game.renderer.camera.centered)
                self.cameraCheck.addClass('active');

            if (self.game.renderer.debugging)
                self.debugCheck.addClass('active');

            if (!self.game.renderer.mobile)
                return;

            if (Detect.isAppleDevice())
                self.info.text('iOS Version: ' + parseFloat(Detect.iOSVersion()));
            else if (Detect.isAndroid())
                self.info.text('Android Version: ' + parseFloat(Detect.androidVersion()));
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

        setSound: function(state) {
            var self = this;

            self.storage.data.settings.soundEnabled = state;
            self.storage.save();
        },

        setCamera: function(state) {
            var self = this;

            self.storage.data.settings.centerCamera = state;
            self.storage.save();
        },

        setDebug: function(state) {
            var self = this;

            self.storage.data.settings.debug = state;
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