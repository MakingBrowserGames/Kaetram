/* global log */

define(['jquery', './container/container'], function($, Container) {

    return Class.extend({

        init: function(game, size) {
            var self = this;

            self.game = game;
            self.body = $('#inventory');

            self.container = new Container(size);
        },

        load: function(data) {
            var self = this,
                list = $('#inventory ul');

            for (var i = 0; i < data.length; i++) {
                var item = data[i];

                self.container.setSlot(i, item);

                var itemSlot = $('<div id="slot' + i + '" class="itemSlot"></div>');

                if (item.string !== 'null')
                    itemSlot.css('background-image', self.container.getImageFormat(self.getScale(), item.string));

                list.append($('<li></li>').append(itemSlot));
            }
        },

        getScale: function() {
            return this.game.getScaleFactor();
        }

    });

});