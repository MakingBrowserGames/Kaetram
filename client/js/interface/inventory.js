/* global log */

define(['jquery', './container/container'], function($, Container) {

    return Class.extend({

        init: function(game, size) {
            var self = this;

            self.game = game;
            self.body = $('#inventory');
            self.button = $('#inventoryButton');

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

                var itemSlotList = $('<li></li>');

                itemSlotList.append(itemSlot);
                itemSlotList.append('<div id="itemCount">' + (item.count > 1 ? item.count : '') + '</div>');

                list.append(itemSlotList);
            }

            self.button.click(function(event) {
                self.button.toggleClass('active');

                if (self.isVisible()) {
                    log.info('Hide');
                    self.hide();
                } else
                    self.show();
            });
        },

        add: function(info) {
            var self = this,
                item = $($('#inventory ul li')[info.index]),
                slot = self.container.slots[info.index];

            if (!item || !slot)
                return;

            if (slot.isEmpty())
                slot.load(info.string, info.count, info.ability, info.abilityLevel);

            slot.setCount(info.count);

            item.find('#slot' + info.index).css('background-image', self.container.getImageFormat(self.getScale(), slot.string));
            item.find('#itemCount').text(slot.count);
        },

        remove: function(info) {
            var self = this;

        },

        show: function() {
            this.body.css('display', 'block');
        },

        hide: function() {
            var self = this;

            self.body.css('display', 'none');
            self.button.removeClass('active');
        },

        getScale: function() {
            return this.game.getScaleFactor();
        },

        isVisible: function() {
            return this.body.css('display') === 'block';
        }

    });

});