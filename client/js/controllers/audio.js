/* global log, _, Modules */

define(function() {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;

            self.audibles = {};

            self.song = null;

            self.load();
        },

        load: function() {
            var self = this;

            self.music = {
                "ancientcavern": false,
                "beach": false,
                "darkestregion": false,
                "exploration": false,
                "farawaycity": false,
                "gameover": false,
                "icebeach": false,
                "royalcity": false,
                "icetown": false,
                "peacefultown": false,
                "thebattle": false,
                "theconclusion": false,
                "unknowing": false,
                "mysterio": false,
                "royalpalace": false,
                "darkcavern": false,
                "dungeon": false,
                "underthesea": false,
                "deepunderthesea": false,
                "campusmap": false,
                "cornfields": false,
                "desert": false,
                "lostland": false,
                "sketchyland": false,
                "volcano": false,
                "meadowofthepast": false,
                "sililoquy": false,
                "veloma": false,
                "boss": false,
                "cave": false,
                "dangerouscave": false
            };

            self.sounds = {
                "loot": false,
                "hit1": false,
                "hit2": false,
                "hurt": false,
                "heal": false,
                "chat": false,
                "revive": false,
                "death": false,
                "firefox": false,
                "achievement": false,
                "kill1": false,
                "kill2": false,
                "noloot": false,
                "teleport": false,
                "chest": false,
                "npc": false,
                "npc-end": false
            };

        },

        parse: function(path, name, channels, callback) {
            var self = this,
                fullPath = path + name + '.' + self.format,
                sound = document.createElement('audio');

            sound.addEventListener('canplaythrough', function(e) {
                this.removeEventListener('canplaythrough', arguments.callee, false);

                if (callback)
                    callback();

            }, false);

            sound.addEventListener('error', function(e) {
                log.error('The audible: ' + name + ' could not be loaded.');
                self.audibles[name] = null;
            }, false);

            sound.preload = 'auto';
            sound.autobuffer = true;
            sound.src = fullPath;
            sound.load();

            self.audibles[name] = [sound];

            _.times(channels - 1, function() {
                self.audibles[name].push(sound.cloneNode(true));
            });

            if (name in self.music)
                self.music[name] = true;
            else if (name in self.sounds)
                self.sounds[name] = true;
        },

        play: function(type, name) {
            var self = this;

            if (!self.isEnabled() || !type || !name || !self.fileExists(name))
                return;


            switch(type) {
                case Modules.AudioTypes.Music:

                    self.fadeOut();

                    if (!self.music[name]) {
                        self.parse('audio/music', name, 2);

                        log.info(self.audibles[name]);

                        var music = self.audibles[name][0];

                        music.loop = true;

                        music.addEventListener('ended', function() {
                            music.play();
                        }, false);
                    }

                    var song = self.get(name);

                    song.sound.volume = 1;

                    song.sound.play();

                    break;

                case Modules.AudioTypes.SFX:

                    if (!self.sounds[name])
                        self.parse('audio/sounds/', name, 4);

                    var sound = self.get(name);

                    if (!sound)
                        return;


                    break;
            }
        },

        fadeIn: function(song) {
            var self = this;

            if (!song || song.sound.fadingIn)
                return;

            self.clearFadeOut(song);

            song.sound.fadingIn = setInterval(function() {
                song.sound.volume += 0.02;

                if (song.sound.volume >= 0.98) {
                    song.sound.volume = 1;
                    self.clearFadeIn(song);
                }

            }, 100);
        },

        fadeOut: function(song, callback) {
            var self = this;

            if (!song || song.sound.fadingOut)
                return;

            self.clearFadeIn(song);

            song.sound.fadingOut = setInterval(function() {
                song.sound.volume -= 0.02;

                if (song.sound.volume <= 0.02) {
                    song.sound.volume = 0;

                    self.clearFadeOut(song);

                    callback(song);
                }

            }, 100);
        },

        clearFadeIn: function(song) {
            if (song.sound.fadingIn) {
                clearInterval(song.sound.fadingIn);
                song.sound.fadingIn = null;
            }
        },

        clearFadeOut: function(song) {
            if (song.sound.fadingOut) {
                clearInterval(song.sound.fadingOut);
                song.sound.fadingOut = null;
            }
        },

        fileExists: function(name) {
            return (name in this.music) || (name in this.sounds);
        },

        get: function(name) {
            var self = this;

            if (!self.audibles[name])
                return;

            var audible = _.detect(self.audibles[name], function(audible) {
                return audible.ended || audible.paused;
            });

            if (audible && audible.ended)
                audible.currentTime = 0;
            else
                audible = self.audibles[name][0];

            return audible;
        },

        getSFXVolume: function() {
            return this.game.storage.data.settings.sfx;
        },

        getMusicVolume: function() {
            return this.game.storage.data.settings.music;
        },

        isEnabled: function() {
            var self = this;

            if (!self.game.storage || !self.game.storage.data || !self.game.storage.data.settings)
                return false;

            return this.game.storage.data.settings.soundEnabled;
        }

    });

});