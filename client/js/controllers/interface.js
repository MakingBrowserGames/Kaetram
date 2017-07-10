/* global log */

define(['jquery', '../interface/inventory'], function($, Inventory) {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;

            self.notify = $('#notify');
            self.confirm = $('#confirm');

            self.inventory = null;

            self.loadNotifications();
        },

        loadInventory: function(size, data) {
            var self = this;

            /**
             * This can be called multiple times and can be used
             * to completely refresh the inventory.
             */

            self.inventory = new Inventory(self.game, size);

            self.inventory.load(data);
        },

        loadNotifications: function() {
            var self = this,
                ok = $('#ok'),
                cancel = $('#cancel'),
                done = $('#done');

            /**
             * Simple warning dialogue
             */

            ok.click(function(event) {
                log.info(self.notify.className);

                self.hideNotify();
            });

            /**
             * Callbacks responsible for
             * Confirmation dialogues
             */

            cancel.click(function(event) {
                log.info(self.confirm.className);

                self.hideConfirm();
            });

            done.click(function(event) {
                log.info(self.confirm.className);

                self.hideConfirm();
            });
        },

        displayNotify: function(message) {
            var self = this;

            if (self.isNotifyVisible())
                return;

            self.notify.css('display', 'block');

        },

        displayConfirm: function(message) {
            var self = this;

            if (self.isConfirmVisible())
                return;

            self.confirm.css('display', 'block');
        },

        hideNotify: function() {
            this.notify.css('display', 'none');
        },

        hideConfirm: function() {
            this.confirm.css('display', 'none');
        },

        hideInventory: function() {
            var self = this;

            if (self.inventory && self.inventory.isVisible())
                self.inventory.hide();
        },

        isNotifyVisible: function() {
            return this.notify.css('display') === 'block';
        },

        isConfirmVisible: function() {
            return this.confirm.css('display') === 'block';
        }

    });

});