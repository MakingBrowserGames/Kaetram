define(['jquery'], function($) {

    return Class.extend({

        /**
         * Extracted from the TTA source code and has
         * been refactored for the second time.
         */

        init: function(game, id) {
            var self = this;

            self.game = game;
            self.body = $(id);

            self.visible = false;
        },

        display: function() {
            var self = this;

            self.visible = true;
            self.body.css('display', 'block');

            if (self.displayCallback)
                self.displayCallback(self);
        },

        hide: function() {
            var self = this;

            self.visible = false;
            self.body.css('display', 'none');

            if (self.hideCallback)
                self.hideCallback(self);
        },

        onDisplay: function(callback) {
            this.displayCallback = callback;
        },

        onHide: function(callback) {
            this.hideCallback = callback;
        }

    });

});