define(['jquery'], function($) {

    return Class.extend({

        init: function(game, intrface) {
            var self = this;

            self.game = game;
            self.interface = intrface;

            self.body = $('#enchant');
            self.container = $('#enchantContainer');
            self.enchantSlots = $('#enchantInventorySlots');

            self.selectedItem = $('#enchantSelectedItem');
            self.selectedShards = $('#enchantShards');

            $('#closeEnchant').click(function() {
                self.hide();
            })
        },

        add: function(type, index) {
            var self = this,
                image = self.getSlot(index).find('#inventoryImage' + index);

            switch (type) {
                case 'item':

                    self.selectedItem.css('background-image', image.css('background-image'));

                    break;

                case 'shards':

                    self.selectedShards.css('background-image', image.css('background-image'));


                    break;
            }

            image.css('background-image', '');
        },

        moveBack: function(type, index) {
            var self = this,
                image = self.getSlot(index).find('#inventoryImage'+ index);

            switch (type) {
                case 'item':

                    image.css('background-image', self.selectedItem.css('background-image'));

                    self.selectedItem.css('background-image', '');

                    break;

                case 'shards':

                    image.css('background-image', self.selectedShards.css('background-image'));

                    self.selectedShards.css('background-image', '');

                    break;
            }
        },

        load: function() {
            var self = this,
                list = self.getSlots(),
                inventoryList = self.interface.bank.getInventoryList();

            list.empty();

            for (var i = 0; i < self.getInventorySize(); i++) {
                var item = $(inventoryList[i]).clone(),
                    slot = item.find('#bankInventorySlot' + i);

                slot.click(function(event) {
                    self.select(event);
                });

                list.append(item);
            }

            self.selectedItem.click(function() {
                self.remove('item');
            });

            self.selectedShards.click(function() {
                self.remove('shards');
            });

        },

        select: function(event) {
            this.game.socket.send(Packets.Enchant, [Packets.EnchantOpcode.Select, event.currentTarget.id.substring(17)]);
        },

        remove: function(type) {
            this.game.socket.send(Packets.Enchant, [Packets.EnchantOpcode.Remove, type]);
        },

        getInventorySize: function() {
            return this.interface.inventory.getSize();
        },

        display: function() {
            var self = this;

            self.body.fadeIn('fast');
            self.load();
        },

        hide: function() {
            var self = this;

            self.selectedItem.css('background-image', '');
            self.selectedShards.css('background-image', '');

            self.body.fadeOut('fast');
        },

        getSlot: function(index) {
            return $(this.getSlots().find('li')[index]);
        },

        getSlots: function() {
            return this.enchantSlots.find('ul');
        }

    });

});