/* global log, Detect */

define(['jquery', './container/container'], function($, Container) {

    return Class.extend({

        init: function(game, size) {
            var self = this;

            self.game = game;
            self.actions = game.interface.actions;
            self.body = $('#inventory');
            self.button = $('#inventoryButton');
            self.action = $('#actionContainer');

            self.container = new Container(size);

            self.activeClass = 'inventory';
            self.selectedSlot = null;
        },

        load: function(data) {
            var self = this,
                list = $('#inventory').find('ul');

            for (var i = 0; i < data.length; i++) {
                var item = data[i];

                self.container.setSlot(i, item);

                var itemSlot = $('<div id="slot' + i + '" class="itemSlot"></div>');

                if (item.string !== 'null')
                    itemSlot.css('background-image', self.container.getImageFormat(self.getScale(), item.string));

                if (self.game.app.isMobile())
                    itemSlot.css('background-size', '600%');

                itemSlot.click(function(event) {
                    self.click(event);
                });

                var itemSlotList = $('<li></li>');

                itemSlotList.append(itemSlot);
                itemSlotList.append('<div id="itemCount">' + (item.count > 1 ? item.count : '') + '</div>');

                list.append(itemSlotList);
            }

            self.button.click(function(event) {
                self.button.toggleClass('active');

                if (self.isVisible())
                    self.hide();
                else
                    self.display();
            });
        },

        click: function(event) {
            var self = this,
                index = event.currentTarget.id.substring(4),
                slot = self.container.slots[index],
                item = $(self.getList()[index]);

            self.clearSelection();

            if (slot.string === null || slot.count === -1)
                return;

            self.actions.reset();
            self.actions.loadDefaults('inventory');

            if (slot.edible)
                self.actions.add($('<div id="eat" class="actionButton">Eat</div>'));
            else if (slot.equippable)
                self.actions.add($('<div id="wield" class="actionButton">Wield</div>'));

            if (!self.actions.isVisible())
                self.actions.show();

            var sSlot = item.find('#slot' + index);

            sSlot.addClass('select');

            self.selectedSlot = sSlot;
        },

        clickAction: function(event) {
            var self = this;

            log.info(event);

            self.actions.removeMisc();
        },

        add: function(info) {
            var self = this,
                item = $(self.getList()[info.index]),
                slot = self.container.slots[info.index];

            if (!item || !slot)
                return;

            if (slot.isEmpty())
                slot.load(info.string, info.count, info.ability, info.abilityLevel);

            slot.setCount(info.count);

            var cssSlot = item.find('#slot' + info.index);

            cssSlot.css('background-image', self.container.getImageFormat(self.getScale(), slot.string));

            if (self.game.app.isMobile())
                cssSlot.css('background-size', '600%');

            item.find('#itemCount').text(slot.count > 1 ? slot.count : '');
        },

        remove: function(info) {
            var self = this,
                item = $(self.getList()[info.index]),
                slot = self.container.slots[info.index];

            if (!item || !slot)
                return;

            item.find('#slot' + info.index).css('background-image', '');
            item.find('#itemCount').text('');

            slot.empty();
        },

        resize: function() {
            var self = this,
                list = self.getList();

            for (var i = 0; i < list.length; i++) {
                var item = $(list[i]).find('#slot' + i);

                if (self.game.app.isMobile())
                    item.css('background-size', '600%');
            }

        },

        clearSelection: function() {
            var self = this;

            if (!self.selectedSlot)
                return;

            self.selectedSlot.removeClass('select');
            self.selectedSlot = null;
        },

        display: function() {
            this.body.fadeIn('fast');
        },

        hide: function() {
            var self = this;

            self.body.fadeOut('slow');
            self.button.removeClass('active');
        },

        getScale: function() {
            return this.game.renderer.getDrawingScale();
        },

        getList: function() {
            return $('#inventory').find('ul').find('li');
        },

        isVisible: function() {
            return this.body.css('display') === 'block';
        }

    });

});