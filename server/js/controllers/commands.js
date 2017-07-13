/* global log */

var cls = require('../lib/class'),
    Messages = require('../network/messages'),
    Packets = require('../network/packets');

module.exports = Commands = cls.Class.extend({

    init: function(player) {
        var self = this;

        self.player = player;
    },

    parse: function(rawText) {
        var self = this,
            blocks = rawText.substring(1).split(' ');

        if (blocks.length < 1)
            return;

        self.handlePlayerCommands(blocks);

        if (self.player.rights > 0)
            self.handleModeratorCommands(blocks);

        if (self.player.rights > 1)
            self.handleAdminCommands(blocks);
    },

    handlePlayerCommands: function(blocks) {
        var self = this;

        switch(blocks.shift()) {
            case 'notify':

                var type = parseInt(blocks.shift());

                self.player.send(new Messages.Notification(2, 'Testing Text'));

                break;
        }
    },

    handleModeratorCommands: function(blocks) {

        switch (blocks.shift()) {

        }

    },

    handleAdminCommands: function(blocks) {

        switch (blocks.shift()) {

        }

    }

});