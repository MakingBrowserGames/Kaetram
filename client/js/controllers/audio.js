define(function() {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;
            self.enabled = self.game.getStorage().getSettings().music > 0;
            self.format = (self.game.renderer.mobile || self.game.renderer.tablet) ? 'ogg' : 'mp3';

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
                self.sounds[name] = null;
            }, false);

            sound.preload = 'auto';
            sound.autobuffer = true;
            sound.src = fullPath;
            sound.load();

            self.sounds[name] = [sound];

            _.times(channels - 1, function() {
                self.sounds[name].push(sound.cloneNode(true));
            });
        }

    });

});