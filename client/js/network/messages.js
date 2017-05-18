/* global log, _, Packets */

define(function() {


    return Class.extend({

        /**
         * Do not clutter up the Socket class with callbacks,
         * have this class here until a better method arises in my head.
         *
         * This class should not have any complex functionality, its main
         * role is to provide organization for packets and increase readability
         */

        init: function(app) {
            var self = this;

            self.app = app;

            self.messages = [];

            self.messages[Packets.Handshake] = self.receiveHandshake;
            self.messages[Packets.Welcome] = self.receiveWelcome;
            self.messages[Packets.Spawn] = self.receiveSpawn;
            self.messages[Packets.Equipment] = self.receiveEquipment;
        },

        handleData: function(data) {
            var self = this,
                packet = data.shift();

            if (self.messages[packet] && _.isFunction(self.messages[packet]))
                self.messages[packet].call(self, data);
        },

        handleUTF8: function(message) {
            var self = this;

            self.app.toggleLogin(false);

            switch (message) {
                case 'updated':
                    self.app.sendError(null, 'The client has been updated, please refresh using CTRL!');
                    break;

                case 'full':
                    self.app.sendError(null, 'The servers are currently full!');
                    break;

                case 'error':
                    self.app.sendError(null, 'The server has responded with an error!');
                    break;

                case 'disallowed':
                    self.app.sendError(null, 'The server is currently not accepting connections!');
                    break;

                case 'userexists':
                    self.app.sendError(null, 'The username you have chosen already exists.');
                    break;

                case 'loggedin':
                    self.app.sendError(null, 'The player is already logged in!');
                    break;

                case 'invalidlogin':
                    self.app.sendError(null, 'You have entered the wrong username or password.');
                    break;

                default:
                    self.app.sendError(null, 'An unknown error has occurred, please refer to the forums.');
                    break;
            }
        },

        /**
         * Data Receivers
         */

        receiveHandshake: function(data) {
            var self = this;

            if (self.handshakeCallback)
                self.handshakeCallback(data.shift());
        },

        receiveWelcome: function(data) {
            var self = this,
                playerData = data.shift();

            if (self.welcomeCallback)
                self.welcomeCallback(playerData);
        },

        receiveSpawn: function(data) {
            var self = this,
                id = data.shift(),
                kind = data.shift(),
                x = data.shift(),
                y = data.shift(),
                count = data.shift(); //For items

            if (self.spawnCallback)
                self.spawnCallback(id, kind, x, y, count);
        },

        receiveEquipment: function(data) {
            var self = this,
                equipType = data.shift(),
                equipInfo = data.shift();

            if (self.equipmentCallback)
                self.equipmentCallback(equipType, equipInfo);
        },

        /**
         * Universal Callbacks
         */

        onHandshake: function(callback) {
            this.handshakeCallback = callback;
        },

        onWelcome: function(callback) {
            this.welcomeCallback = callback;
        },

        onSpawn: function(callback) {
            this.spawnCallback = callback;
        },

        onEquipment: function(callback) {
            this.equipmentCallback = callback;
        }

    });

});