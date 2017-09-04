var Quest = require('../quest'),
    Messages = require('../../../../../../network/messages'),
    Packets = require('../../../../../../network/packets');

module.exports = Introduction = Quest.extend({

    init: function(player, data) {
        var self = this;

        self.player = player;
        self.data = data;

        self._super(data.id, data.name, data.description);

        self.loadCallbacks();
    },

    load: function(stage) {
        var self = this;

        if (!stage)
            self.update();
        else
            self.stage = stage;

        if (self.finishedCallback)
            self.finishedCallback();
    },

    loadCallbacks: function() {
        var self = this;

        self.onFinishedLoading(function() {
            if (self.stage > 9999)
                return;

            if (self.stage < 10)
                self.toggleChat();
        });

        self.onNPCTalk(function(npc) {

            var conversation = self.getConversation(npc.id);

            if (!conversation)
                return;

            npc.talk(conversation);

            self.player.send(new Messages.NPC(Packets.NPCOpcode.Talk, {
                id: npc.instance,
                text: conversation
            }));

            if (npc.talkIndex > conversation.length)
                self.progress('talk');
        });
    },

    update: function() {
        this.player.save();
    },

    progress: function(type) {
        var self = this;

        switch (type) {
            case 'talk':

                break;
        }
    },

    updatePointers: function() {
        var self = this,
            pointer = self.data.pointers[self.stage];

        if (!pointer)
            return;

        self.player.send(new Messages.Pointer(pointer[0], {
            id: Utils.generateRandomId()
        }));
    },

    toggleChat: function() {

    },

    getConversation: function(id) {
        var self = this,
            conversation = self.data.conversations[id];

        if (!conversation || !conversation[self.stage])
            return [''];

        return conversation[self.stage];
    },

    nextStage: function() {
        var self = this;

        self.stage++;
        self.update();
    },

    setStage: function(stage) {
        var self = this;

        self._super(stage);

        self.update();

        log.info('Set stage...');
    },

    finish: function() {
        var self = this;


        self.setStage(9999);
    },

    hasNPC: function(id) {
        var self = this;

        for (var i = 0; i < self.data.npcs.length; i++)
            if (self.data.npcs[i] === id)
                return true;

        return false;
    },

    onFinishedLoading: function(callback) {
        this.finishedCallback = callback;
    }

});