/* global log */

define(['jquery', '../interface/inventory',
        '../interface/profile/profile', '../interface/actions', '../interface/bank'], function($, Inventory, Profile, Actions, Bank) {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;

            self.notify = $('#notify');
            self.confirm = $('#confirm');

            self.inventory = null;
            self.profile = null;
            self.actions = null;

            self.loadNotifications();
            self.loadActions();
        },

        resize: function() {
            var self = this;

            if (self.inventory)
                self.inventory.resize();

            if (self.profile)
                self.profile.resize();
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

        loadBank: function(size, data) {
            var self = this;

            /**
             * Similar structure as the inventory, just that it
             * has two containers. The bank and the inventory.
             */

            self.bank = new Bank(self.game, self.inventory.container, size);

            self.bank.load(data);
        },

        loadProfile: function() {
            var self = this;

            if (!self.profile)
                self.profile = new Profile(self.game);
        },

        loadActions: function() {
            var self = this;

            if (!self.actions)
                self.actions = new Actions(self);
        },

        loadNotifications: function() {
            var self = this,
                ok = $('#ok'),
                cancel = $('#cancel'),
                done = $('#done');

            /**
             * Simple warning dialogue
             */

            ok.click(function() {
                log.info(self.notify.className);

                self.hideNotify();
            });

            /**
             * Callbacks responsible for
             * Confirmation dialogues
             */

            cancel.click(function() {
                log.info(self.confirm.className);

                self.hideConfirm();
            });

            done.click(function() {
                log.info(self.confirm.className);

                self.hideConfirm();
            });
        },

        hideAll: function() {
            var self = this;

            if (self.inventory)
                self.inventory.hide();

            if (self.actions)
                self.actions.hide();

            if (self.profile)
                self.profile.hide();

            if (self.game.input && self.game.input.chatHandler && self.game.input.chatHandler.input.is(':visible'))
                self.game.input.chatHandler.hideInput();
        },

        displayNotify: function(message) {
            var self = this;

            if (self.isNotifyVisible())
                return;

            self.notify.css('display', 'block');
            self.notify.text(message);
        },

        displayConfirm: function(message) {
            var self = this;

            if (self.isConfirmVisible())
                return;

            self.confirm.css('display', 'block');
            self.confirm.text(message);
        },

        hideNotify: function() {
            this.notify.css('display', 'none');
        },

        hideConfirm: function() {
            this.confirm.css('display', 'none');
        },

        isNotifyVisible: function() {
            return this.notify.css('display') === 'block';
        },

        isConfirmVisible: function() {
            return this.confirm.css('display') === 'block';
        }

    });

});