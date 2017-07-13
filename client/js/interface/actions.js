/* global _, log */

define(['jquery'], function($) {

    return Class.extend({

        init: function(intrfce) {
            var self = this;

            self.interface = intrfce;

            self.body = $('#actionContainer');
            self.drop = $('#dropDialog');
            self.dropInput = $('#dropCount');
            self.activeClass = null;

            self.miscButton = null;

            self.load();
        },

        load: function() {
            var self = this,
                dropAccept = $('#dropAccept'),
                dropCancel = $('#dropcancel');

            dropAccept.click(function(event) {
                log.info(event);
                log.info(self.activeClass);

                if (self.activeClass === 'inventory')
                    self.interface.inventory.clickAction(event);
            });

            dropCancel.click(function(event) {
                if (self.activeClass === 'inventory')
                    self.interface.inventory.clickAction(event);
            });
        },

        loadDefaults: function(activeClass) {
            var self = this;

            self.activeClass = activeClass;

            switch (self.activeClass) {
                case 'inventory':
                    var dropButton = $('<div id="drop" class="actionButton">Drop</div>');

                    self.add(dropButton);

                    break;

                case 'profile':

                    break;
            }
        },

        add: function(button, misc) {
            var self = this;

            self.body.find('ul').prepend($('<li></li>').append(button));

            button.click(function(event) {
                if (self.activeClass === 'inventory')
                    self.interface.inventory.clickAction(event);

            });

            if (misc)
                self.miscButton = button;
        },

        removeMisc: function() {
            var self = this;

            self.miscButton.remove();
            self.miscButton = null;
        },

        reset: function() {
            var self = this,
                buttons = self.getButtons();

            for (var i = 0; i < buttons.length; i++)
                $(buttons[i]).remove();
        },

        show: function() {
            this.body.fadeIn('fast');
        },

        hide: function() {
            this.body.fadeOut('slow');
        },

        displayDrop: function(activeClass) {
            var self = this;

            self.activeClass = activeClass;

            self.drop.fadeIn('fast');

            self.dropInput.focus();
            self.dropInput.select();
        },

        hideDrop: function() {
            var self = this;

            self.drop.fadeOut('slow');

            self.dropInput.blur();
            self.dropInput.val('');
        },

        getButtons: function() {
            return this.body.find('ul').find('li');
        },

        isVisible: function() {
            return this.body.css('display') === 'block';
        }

    });

});