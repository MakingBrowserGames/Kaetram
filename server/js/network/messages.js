var cls = require('../lib/class'),
    Packets = require('./packets'),
    Messages = {},
    Message = cls.Class.extend({ });

module.exports = Messages;

Messages.Handshake = Message.extend({
    init: function(clientId, proceed) {
        this.clientId = clientId;
    },

    serialize: function() {
        return [Packets.Handshake, this.clientId];
    }
});

Messages.Welcome = Message.extend({
    init: function(data) {
        this.data = data; //array of info
    },

    serialize: function() {
        return [Packets.Welcome, this.data];
    }
});

Messages.Spawn = Message.extend({
    init: function(entity) {
        this.entity = entity;
    },

    serialize: function() {
        return [Packets.Spawns].concat(this.entities.getState());
    }
});

Messages.Equipment = Message.extend({

    init: function(opcode, equipmentData) {
        this.opcode = opcode;
        this.equipmentData = equipmentData;
    },

    serialize: function() {
        return [Packets.Equipment, this.opcode, this.equipmentData];
    }

});