define(['jquery'], function($) {

    return Class.extend({

        init: function(game, intrface) {
            var self = this;

            self.game = game;
            self.interface = intrface;

            self.body = $('#enchant');
            self.container = $('#enchantContainer');
            self.inventorySlots = $('#bankInventorySlots')
        },

        load: function() {
            var self = this,
                list = self.container.find('ul'),
                inventoryList = self.interface.bank.getInventoryList();

            for (var i = 0; i < self.getInventorySize(); i++) {
                var item = $(inventoryList[i]).clone();

                item.click(function(event) {
                    self.select(event);
                });

                list.append(item);
            }
        },

        select: function(event) {
            var self = this;

            log.info(event);
        },

        getInventorySize: function() {
            return this.interface.inventory.getSize();
        },

        display: function() {
            var self = this;

            self.body.fadeIn('fast');
            self.load();
        }

    });

});