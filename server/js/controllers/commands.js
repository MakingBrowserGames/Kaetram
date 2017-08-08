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

                break;
        }
    },

    handleModeratorCommands: function(command, blocks) {
        var self = this;

        switch (command) {

        }

    },

    handleAdminCommands: function(command, blocks) {
        var self = this;

        switch (command) {
            case 'spawn':



                break;

            case 'drop':

                var id = blocks.shift();

                if (!id)
                    return;

                self.world.dropItem(id, 1, self.player.x, self.player.y);

                break;

            case 'ghost':

                self.player.equip('ghost', 1, -1, -1);

                break;
        }

    }

});