var cls = require('../lib/class'),
    Introduction = require('../game/entity/character/player/quest/misc/introduction'),
    Data = require('../../data/quests.json'),
    _ = require('underscore');

module.exports = Quests = cls.Class.extend({

    init: function(player) {
        var self = this;

        self.player = player;
        self.quests = {};
        self.achievements = {};

        self.load();
    },

    load: function() {
        var self = this;

        _.each(Data, function(quest) {
            self.quests[quest.id] = new Introduction(quest, self.player);
        });
    },

    updateQuests: function(ids, stages) {
        var self = this;

        for (var id = 0; id < ids.length; id++)
            if (!isNaN(parseInt(ids[id])) && self.quests[id])
                self.quests[id].update(stages[id]);
    },

    updateAchievements: function(ids, progress) {
        var self = this;

        for (var id = 0; id < ids.length; id++)
            if (!isNaN(parseInt(ids[id])) && self.quests[id])
                self.achievements[id].setProgress(progress[id]);
    },

    getQuest: function(id) {
        var self = this;

        if (id in self.quests)
            return self.quests[id];

        return null;
    },

    getQuests: function() {
        var self = this,
            ids = '',
            stages = '';

        for (var id = 0; id < self.getQuestSize(); id++) {
            ids += id + ' ';
            stages += self.quests[id].stage + ' ';
        }

        return {
            username: self.player.username,
            ids: ids,
            stages: stages
        }
    },

    getAchievements: function() {
        var self = this,
            ids = '',
            progress = '';

        for (var id = 0; id < self.getAchievementSize(); id++) {
            ids += id + ' ';
            progress += self.achievements[id].progress + ' '
        }

        return {
            username: self.player.username,
            ids: ids,
            progress: progress
        }
    },

    getQuestSize: function() {
        return Object.keys(this.quests).length;
    },

    getAchievementSize: function() {
        return Object.keys(this.achievements).length;
    }

});