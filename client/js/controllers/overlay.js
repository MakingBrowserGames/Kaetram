define(['jquery'], function($) {

    return Class.extend({

        init: function(input) {
            var self = this;

            self.input = input;
            self.hovering = null;

            self.attackInfo = $('#attackInfo');

            self.image = self.attackInfo.find('.image');
            self.name = self.attackInfo.find('.name');
            self.details = self.attackInfo.find('.details');
            self.health = self.attackInfo.find('.health');
        },

        update: function(entity) {
            var self = this;

            if (!entity) {
                if (self.isVisible())
                    self.hide();

                self.hovering = null;
                return;
            }

            if (!self.isVisible())
                self.display();

            self.hovering = entity;

            self.name.html(entity.name);

            if (self.hasHealth())
                self.details.html(entity.hitPoints + ' / ' + entity.maxHitPoints);
            else
                self.details.html('HUrp de durp, it is item.');

            self.image.width = entity.sprite.width;
            self.image.height = entity.sprite.height;


        },

        hasHealth: function() {
            return this.hovering.type === 'mob' || this.hovering.type === 'player';
        },

        display: function() {
            this.attackInfo.fadeIn('fast');
        },

        hide: function(){
            this.attackInfo.fadeOut('fast');
        },

        isVisible: function() {
            return this.attackInfo.css('display') === 'block';
        }

    });

});