/* global _, log */

define(['jquery'], function($) {

    return Class.extend({

        init: function(intrfce) {
            var self = this;

            self.interface = intrfce;

            self.body = $('#actionContainer');
            self.activeClass = null;

            self.miscButton = null;
        },

        show: function() {
            this.body.fadeIn('fast');
        },

        hide: function() {
            this.body.fadeOut('slow');
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

        getButtons: function() {
            return this.body.find('ul').find('li');
        },

        isVisible: function() {
            return this.body.css('display') === 'block';
        }

    });

});