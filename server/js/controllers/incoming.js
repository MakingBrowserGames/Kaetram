var cls = require('../lib/class'),
    Packets = require('../network/packets'),
    Request = require('request'),
    config = require('../../config.json'),
    Creator = require('../database/creator');

module.exports = Incoming = cls.Class.extend({

    init: function(player) {
        var self = this;

        self.player = player;
        self.connection = self.player.connection;
        self.world = self.player.world;
        self.mysql = self.player.mysql;

        self.connection.listen(function(data) {

            var packet = data.shift(),
                message = data[0];

            switch(packet) {

                case Packets.Intro:
                    self.handleIntro(message);
                    break;

                case Packets.Ready:
                    self.handleReady(message);
                    break;

            }

        });
    },

    handleIntro: function(message) {
        var self = this,
            loginType = message.shift(),
            username = message.shift().toLowerCase(),
            password = message.shift(),
            isRegistering = loginType === Packets.IntroOpcode.Register,
            email = isRegistering ? message.shift() : '',
            formattedUsername = username.charAt(0).toUpperCase() + username.slice(1);

        self.player.username = formattedUsername.substr(0, 32).trim();
        self.player.password = password.substr(0, 32);
        self.player.email = email.substr(0, 128);

        if (config.offlineMode) {
            var creator = new Creator(null);

            self.player.isNew = true;
            self.player.load(creator.getPlayerData(self.player));
            self.player.isNew = false;
            self.player.intro();

            return;
        }

        if (isRegistering) {
            var registerOptions = {
                method: 'GET',
                uri: 'https://taptapadventure.com/api/register/index.php?a=9a4c5ddb-5ce6-4a01-a14f-3ae49d8c6507&u=' + self.player.username.toLowerCase() + '&p=' + self.player.password + '&e=' + self.player.email
            };

            Request(registerOptions, function(error, response, body) {
                switch(JSON.parse(JSON.parse(body).data).code) {
                    case 'ok':
                        self.mysql.register(self.player);
                        break;

                    default:
                        self.connection.sendUTF8('userexists');
                        self.connection.close('Username: ' + username + ' not available.');
                        break;
                }
            });
        } else {
            var loginOptions = {
                method: 'POST',
                uri: 'https://forum.taptapadventure.com/api/ns/login',
                form: {
                    'username': self.player.username.toLowerCase(),
                    'password': self.player.password
                }
            };

            Request(loginOptions, function(error, response, body) {
                var data = JSON.parse(body);

                if (data.message) {
                    self.connection.sendUTF8('invalidlogin');
                    self.connection.close('Wrong password entered for: ' + self.player.username);
                } else {
                    if (self.world.playerInWorld(self.player.username)) {
                        self.connection.sendUTF8('loggedin');
                        self.connection.close('Player already logged in..');
                        return;
                    }

                    self.mysql.login(self.player);
                }
            });
        }
    },

    handleReady: function(message) {
        var self = this,
            isReady = message.shift();

        if (isReady) {
            self.player.ready = true;
            self.player.sendEquipment();
        }
    }


});