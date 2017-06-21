/* global Packets, Modules, log */

define(['jquery'], function($) {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;

            self.chat = $('#chat');
            self.input = $('#chatInput');

            self.visible = false;

            self.fadingDuration = 5000;
            self.fadingTimeout = null;
        },

        key: function(data) {
            var self = this;

            switch(data) {
                case Modules.Keys.Enter:

                    if (self.input.val() === '')
                        self.toggle();
                    else
                        self.send();

                    break;
            }
        },

        send: function() {
            var self = this;

            self.game.socket.send(Packets.Chat, [self.input.val()]);
            self.toggle();
        },

        toggle: function() {
            var self = this;

            self.clean();

            if (self.visible && !self.isActive())
                self.showInput();
            else if (self.visible) {
                self.hideInput();
                self.hideChat();
            } else {
                self.showChat();
                self.showInput();
            }
        },

        showChat: function() {
            var self = this;

            self.chat.css('display', 'block');

            self.visible = true;
        },

        showInput: function() {
            var self = this;

            self.input.css('display', 'block');
            self.input.val('');
            self.input.focus();
        },

        hideChat: function() {
            var self = this;

            self.fadingTimeout = setTimeout(function() {

                self.chat.css('display', 'none');

                self.visible = false;

            }, self.fadingDuration);
        },

        hideInput: function() {
            this.input.css('display', 'none');
        },

        clean: function() {
            var self = this;

            if (self.fadingTimeout) {
                clearTimeout(self.fadingTimeout);
                self.fadingTimeout = null;
            }
        },

        isActive: function() {
            return this.input.is(':focus');
        }

    });

});