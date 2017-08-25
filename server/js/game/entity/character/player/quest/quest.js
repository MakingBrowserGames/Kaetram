var cls = require('../../../../../lib/class');

module.exports = Quest = cls.Class.extend({

    init: function(id, name, description) {
        var self = this;

        self.id = id;
        self.name = name;
        self.description = description;

        self.stage = 0;
    },

    getId: function() {
        return this.id;
    },

    getName: function() {
        return this.name;
    },

    getDescription: function() {
        return this.description;
    },

    getStage: function() {
        return this.stage;
    },

    getInfo: function() {
        return {
            id: this.getId(),
            name: this.getName(),
            description: this.getDescription(),
            stage: this.getStage()
        };
    },

    finish: function() {
        this.stage = 9999;
    },

    isFinished: function() {
        return this.stage >= 9999;
    },

    update: function() {
        log.warning('Update function not initialized for: ' + this.name);
    }

});