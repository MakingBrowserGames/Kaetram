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
            self.quests[quest.name] = new Introduction(quest, self.player);
        });
    },

    getQuest: function(name) {
        var self = this;

        if (name in self.quests)
            return self.quests[name];

        return null;
    }

});