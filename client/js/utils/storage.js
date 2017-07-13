define(function() {
    var storage = window.localStorage,
        name = 'data';

    return Class.extend({

        init: function() {
            var self = this;

            self.data = null;

            self.load();
        },

        load: function() {
            this.data = storage.data ? this.create() : JSON.parse(storage.getItem(name));
        },

        create: function() {
            return {
                new: true,

                player: {
                    username: '',
                    password: '',
                    autoLogin: true
                },

                settings: {
                    music: 100,
                    sfx: 100,
                    animateTiles: true,
                    centerCamera: true,
                    showNames: true,
                    showLevels: true,
                    brightness: 100
                }
            }
        },

        save: function() {
            if (this.data)
                storage.setItem(name, JSON.stringify(this.data));
        },

        clear: function() {
            storage.removeItem(name);
            this.data = this.create();
        },

        setPlayer: function(option, value) {
            var self = this,
                pData = self.getPlayer();

            if (pData.hasOwnProperty(option))
                pData[option] = value;

            self.save();
        },

        setSettings: function(option, value) {
            var self = this,
                sData = self.getSettings();

            if (sData.hasOwnProperty(option))
                sData[option] = value;

            self.save();
        },

        getPlayer: function() {
            return this.data.player;
        },

        getSettings: function() {
            return this.data.settings;
        }

    });
});