define(['jquery'], function($) {

    return Class.extend({

        init: function(element) {
            var self = this;

            self.body = $(element);
        },

        show: function() {
            this.body.fadeIn('fast');
        },

        hide: function() {
            this.body.fadeOut('slow');
        },

        isVisible: function() {
            return this.body.css('display') === 'block';
        }

    });

});