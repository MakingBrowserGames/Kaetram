define(['jquery', './container/container'], function($, Container) {

    return Class.extend({

        init: function(game, inventoryContainer, size) {
            var self = this;

            self.game = game;
            self.inventoryContainer = inventoryContainer;

            self.player = game.player;

            self.body = $('#bank');
            self.bankSlots = $('#bankSlots');
            self.bankInventorySlots = $('#bankInventorySlots');

            self.container = new Container(size);
        },

        load: function(data) {
            var self = this,
                bankList = self.bankSlots.find('ul'),
                inventoryList = self.bankInventorySlots.find('ul');

            for (var i = 0; i < data.length; i++) {
                var item = data[i],
                    slot = $('<div id="bankSlot' + i + '" class="bankSlot"></div>');

                self.container.setSlot(i, item);

                var image = $('<div></div>');

                if (item.string)
                    image.css('background-image', self.container.getImageFormat(self.getDrawingScale(), item.string));

                slot.click(function(event) {
                    self.click('bank', event);
                });

                slot.append(image);

                var bankListItem = $('<li></li>');

                bankListItem.append(slot);

                bankList.append(bankListItem);
            }

            for (var j = 0; j < self.inventoryContainer.size; j++) {
                var iItem = self.inventoryContainer.slots[j],
                    iSlot = $('<div id="bankInventorySlot' + j + '" class="bankSlot"></div>');

                iSlot.css({
                    'margin-right': (3 * self.getScale()) + 'px',
                    'margin-top': (6 * self.getScale()) + 'px'
                });

                var slotImage = $('<div></div>');

                if (iItem.string)
                    slotImage.css('background-image', self.container.getImageFormat(self.getDrawingScale(), iItem.string));

                iSlot.click(function(event) {
                    self.click('inventory', event);
                });

                iSlot.append(slotImage);

                var inventoryListItem = $('<li></li>');

                inventoryListItem.append(iSlot);

                inventoryList.append(inventoryListItem);
            }
        },

        click: function(type, event) {
            var self = this,
                isBank = type === 'bank',
                index = event.currentTarget.id.substring(isBank ? 8 : 17);

            self.game.socket.send(Packets.Bank, [Packets.BankOpcode.Select, type, index]);
        },

        add: function(info) {
            var self = this,
                item = $(self.getBankList()[info.index]),
                slot = self.container.slots[info.index];
            
            if (!item || !slot)
                return;

            if (slot.isEmpty())
                slot.load(info.string, info.count, info.ability, info.abilityLevel);

            slot.setCount(info.count);

            var cssSlot = item.find('#bankSlot' + info.index).find('div');

            cssSlot.css('background-image', self.container.getImageFormat(self.getDrawingScale(), info.string));

        },

        remove: function(info) {
            var self = this,
                item = $(self.getBankList()[info.index]),
                slot = self.container.slots[info.index];
            
            if (!item || !slot)
                return;
            
            slot.count -= info.count;
            
            if (slot.count < 1) {
                item.find('#bankSlot' + info.index).find('div').css('background-image', '');
                slot.empty();
            }
        },

        addInventory: function(info) {
            var self = this,
                item = $(self.getInventoryList()[info.index]);
            
            if (!item)
                return;
            
            var slot = item.find('#bankInventorySlot' + info.index).find('div');
            
            slot.css('background-image', self.container.getImageFormat(self.getDrawingScale(), info.string));
        },

        removeInventory: function(info) {
            var self = this,
                item = $(self.getInventoryList()[info.index]);

            if (!item)
                return;

            var slot = item.find('#bankInventorySlot' + info.index).find('div');

            slot.css('background-image', '');
        },

        getDrawingScale: function() {
            return this.game.renderer.getDrawingScale();
        },

        getScale: function() {
            return this.game.getScaleFactor();
        },

        getBankList: function() {
            return this.bankSlots.find('ul').find('li');
        },

        getInventoryList: function() {
            return this.bankInventorySlots.find('ul').find('li');
        }

    });

});