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

    init: function(opcode, data) {
        this.opcode = opcode;
        this.data = data;
    },

    serialize: function() {
        return [Packets.Movement, [this.opcode, this.data]];
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

Messages.Despawn = Message.extend({

    init: function(id) {
        this.id = id;
    },

    serialize: function() {
        return [Packets.Despawn, this.id];
    }

});

Messages.Animation = Message.extend({

    init: function(id, data) {
        this.id = id;
        this.data = data;
    },

    serialize: function() {
        return [Packets.Animation, this.id, this.data];
    }

});

Messages.Combat = Message.extend({

    init: function(opcode, attackerId, targetId, hitData) {
        this.opcode = opcode;
        this.attackerId = attackerId;
        this.targetId = targetId;
        this.hitData = hitData;
    },

    serialize: function() {
        return [Packets.Combat, [this.opcode, this.attackerId, this.targetId, this.hitData]];
    }

});

Messages.Projectile = Message.extend({

    init: function(opcode, data) {
        this.opcode = opcode;
        this.data = data;
    },

    serialize: function() {
        return [Packets.Projectile, this.opcode, this.data];
    }

});

Messages.Population = Message.extend({

    init: function(playerCount) {
        this.playerCount = playerCount
    },

    serialize: function() {
        return [Packets.Population, this.playerCount];
    }

});

Messages.Points = Message.extend({

    init: function(id, hitPoints, mana) {
        this.id = id;
        this.hitPoints = hitPoints;
        this.mana = mana;
    },

    serialize: function() {
        return [Packets.Points, [this.id, this.hitPoints, this.mana]];
    }

});

Messages.Network = Message.extend({

    init: function(opcode) {
        this.opcode = opcode;
    },

    serialize: function() {
        return [Packets.Network, this.opcode];
    }
});

Messages.Chat = Message.extend({

    init: function(id, text, duration) {
        this.id = id;
        this.text = text;
        this.duration = duration;
    },

    serialize: function() {
        return [Packets.Chat, [this.id, this.text, this.duration]];
    }

});

/**
 * Should we just have a packet that represents containers
 * as a whole or just send it separately for each?
 */

Messages.Inventory = Message.extend({

    init: function(opcode, data) {
        this.opcode = opcode;
        this.data = data;
    },

    serialize: function() {
        return [Packets.Inventory, this.opcode, this.data];
    }

});

Messages.Bank = Message.extend({

    init: function(opcode, data) {
        this.opcode = opcode;
        this.data = data;
    },

    serialize: function() {
        return [Packets.Bank, this.opcode, this.data];
    }

});

Messages.Ability = Message.extend({

    init: function(opcode, data) {
        this.opcode = opcode;
        this.data = data;
    },

    serialize: function() {
        return [Packets.Ability, this.opcode, this.data];
    }

});

Messages.Quest = Message.extend({

    init: function(opcode, data) {
        this.opcode = opcode;
        this.data = data;
    },

    serialize: function() {
        return [Packets.Quest, this.opcode, this.data];
    }

});

Messages.Notification = Message.extend({

    init: function(opcode, message) {
        this.opcode = opcode;
        this.message = message;
    },

    serialize: function() {
        return [Packets.Notification, this.opcode, this.message];
    }

});