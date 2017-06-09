/* global _, Modules */

define(['../utils/queue', '../renderer/infos/splat'], function(Queue, Splat) {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;

            self.infos = {};
            self.destroyQueue = new Queue();
        },

        create: function(type, data, x, y) {
            var self = this;

            switch (type) {
                case Modules.Hits.Damage:
                    var damage = data.shift(),
                        isTarget = data.shift(),
                        id = self.generateId(self.game.time, damage, x, y),
                        hitSplat = new Splat(id, type, damage, x, y, false),
                        colour = isTarget ? Modules.DamageColours.received : Modules.DamageColours.inflicted;

                    hitSplat.setColours(colour.fill, colour.stroke);

                    self.addInfo(hitSplat);

                    break;
            }
        },

        addInfo: function(info) {
            var self = this;

            self.infos[info.id] = info;

            info.onDestroy(function(id) {
                self.destroyQueue.add(id);
            });
        },

        update: function(time) {
            var self = this;

            self.forEachInfo(function(info) {
                info.update(time);
            });

            self.destroyQueue.forEachQueue(function(id) {
                delete self.infos[id];
            });
        },

        forEachInfo: function(callback) {
            _.each(this.infos, function(info) {
                callback(info);
            });
        },

        generateId: function(time, info, x, y) {
            return time + '' + Math.abs(info) + '' + x + '' + y;
        }

    });

});