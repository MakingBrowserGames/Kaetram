define(['jquery'], function($) {

    return Class.extend({

        init: function(input) {
            var self = this;

            self.input = input;
            self.hovering = null;

            self.attackInfo = $('#attackInfo');

            self.image = self.attackInfo.find('.image div');
            self.name = self.attackInfo.find('.name');
            self.details = self.attackInfo.find('.details');
            self.health = self.attackInfo.find('.health');
        },

        update: function(entity) {
            var self = this;

            if (!entity) {
                if (self.isVisible() && !self.input.getPlayer().hasTarget())
                    self.hide();

                self.hovering = null;
                return;
            }

            log.info('entity exists');

            if (!self.isVisible())
                self.display();

            self.hovering = entity;

            self.name.html(entity.type === 'player' ? entity.username : entity.name);

            if (self.hasHealth()) {
                self.health.css('display', 'block');
                self.details.html(entity.hitPoints + ' / ' + entity.maxHitPoints);
            } else {
                self.health.css('display', 'none');
                self.details.html('');
            }

            self.hovering.onHitPoints(function(hitPoints) {
                if (hitPoints < 1)
                    self.hide();
                else
                    self.details.html(hitPoints + ' / ' + self.hovering.maxHitPoints);
            });
        },

        clean: function() {
            var self = this;

            self.details.html('');
            self.hovering = null;
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