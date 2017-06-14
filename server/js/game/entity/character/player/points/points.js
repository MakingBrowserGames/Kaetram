var cls = require('../../../../../lib/class');

module.exports = Points = cls.Class.extend({

    init: function(points, maxPoints) {
        var self = this;

        self.points = points;
        self.maxPoints = maxPoints;
    },

    increment: function(amount) {
        this.points += amount;
    },

    decrement: function(amount) {
        this.points -= amount;
    },

    setPoints: function(points) {
        this.points = points;
    },

    setMaxPoints: function(maxPoints) {
        this.maxPoints = maxPoints;
    },

    getData: function() {
        return [this.points, this.maxPoints];
    }

});