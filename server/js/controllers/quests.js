var cls = require('../lib/class'),
    Introduction = require('../game/entity/character/player/quest/misc/introduction'),
    Data = require('../../data/quests.json'),
    _ = require('underscore');

module.exports = Quests = cls.Class.extend({

    init: function(player) {
        var self = this;

        self.player = player;
        self.quests = {};

        self.load();
    },

    load: function() {
        var self = this;

        _.each(Data, function(quest) {
            self.quests[quest.id] = new Introduction(quest, self.player);
        });
    },

    update: function(ids, stages) {
        var self = this;

        for (var id = 0; id < ids.length; id++)
            if (!isNaN(parseInt(ids[id])) && self.quests[id])
                self.quests[id].update(stages[id]);
    },

    getArray: function() {
        var self = this,
            ids = '',
            stages = '';

        for (var id = 0; id < self.getSize(); id++) {
            ids += id + ' ';
            stages += self.quests[id].stage + ' ';
        }

        return {
            username: self.player.username,
            ids: ids,
            stages: stages
        }
    },

    getQuest: function(id) {
        var self = this;

        if (id in self.quests)
            return self.quests[id];

        return null;
    },

    getSize: function() {
        return Object.keys(this.quests).length;
    }

});