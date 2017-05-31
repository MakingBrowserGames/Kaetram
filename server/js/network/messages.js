var cls = require('../lib/class'),
    Packets = require('./packets'),
    Messages = {},
    Message = cls.Class.extend({ });

module.exports = Messages;

Messages.Handshake = Message.extend({
    init: function(clientId, devClient) {
        this.clientId = clientId;
        this.devClient = devClient;
    },

    serialize: function() {
        return [Packets.Handshake, [this.clientId, this.devClient]];
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
        return [Packets.Spawn, this.entity.getState()];
    }
});

Messages.List = Message.extend({
    init: function(list) {
        this.list = list;
    },

    serialize: function() {
        return [Packets.List, this.list];
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

Messages.Drop = Message.extend({

});

Messages.Movement = Message.extend({

    init: function(id, opcode, forced, teleport, x, y) {
        this.id = id;
        this.opcode = opcode;
        this.forced = forced;
        this.teleport = teleport;
        this.x = x;
        this.y = y;
    },

    serialize: function() {
        return [Packets.Movement, [this.id, this.opcode, this.forced, this.teleport, this.x, this.y]];
    }

});

Messages.Teleport = Message.extend({

    init: function(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    },

    serialize: function() {
        return [Packets.Teleport, [this.id, this.x, this.y]];
    }

});