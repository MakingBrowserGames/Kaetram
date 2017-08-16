/* global log */

var cls = require('../lib/class'),
    Messages = require('../network/messages'),
    Packets = require('../network/packets');

module.exports = Commands = cls.Class.extend({

    init: function(player) {
        var self = this;

        self.world = player.world;
        self.player = player;
    },

    parse: function(rawText) {
        var self = this,
            blocks = rawText.substring(1).split(' ');

        if (blocks.length < 1)
            return;

        var command = blocks.shift();

        self.handlePlayerCommands(command, blocks);

        if (self.player.rights > 0)
            self.handleModeratorCommands(command, blocks);

        if (self.player.rights > 1)
            self.handleAdminCommands(command, blocks);
    },

    handlePlayerCommands: function(command, blocks) {
        var self = this;

        switch(command) {
            case 'notify':

                var type = parseInt(blocks.shift());

                self.player.send(new Messages.Notification(2, 'Testing Text'));

                return;
        }
    },

    handleModeratorCommands: function(command, blocks) {
        var self = this;

        switch (command) {

            case 'mute':
            case 'ban':

                var duration = blocks.shift(),
                    targetName = blocks.join(' '),
                    user = self.world.getPlayerByName(targetName);

                if (!user)
                    return;

                if (!duration)
                    duration = 24;

                var timeFrame = new Date().getTime() + duration * 60 * 60;

                if (command === 'mute')
                    user.mute = timeFrame;
                else if (command === 'ban') {
                    user.ban = timeFrame;
                    user.save();

                    user.sendUTF8('ban');
                    user.connection.close('banned');
                }

                user.save();

                break;

            case 'unmute':

                var uTargetName = blocks.join(' '),
                    uUser = self.world.getPlayerByName(uTargetName);

                if (!uTargetName)
                    return;

                uUser.mute = new Date().getTime() - 3600;

                uUser.save();

                break;

        }

    },

    handleAdminCommands: function(command, blocks) {
        var self = this;

        switch (command) {
            case 'spawn':

                var spawnId = blocks.shift(),
                    count = blocks.shift(),
                    ability = blocks.shift(),
                    abilityLevel = blocks.shift();

                if (!spawnId || !count)
                    return;

                self.player.inventory.add({
                    id: spawnId,
                    count: count,
                    ability: ability ? ability : -1,
                    abilityLevel: abilityLevel ? abilityLevel : -1
                });

                return;

            case 'ipban':

                return;

            case 'drop':

                var id = blocks.shift();

                if (!id)
                    return;

                self.world.dropItem(id, 1, self.player.x, self.player.y);

                return;

            case 'ghost':

                self.player.equip('ghost', 1, -1, -1);

                return;
        }

    }

});