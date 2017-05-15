/* global log, _ */

define(['../entity/sprite'], function(Sprite) {
    /**
     * Class responsible for loading all the necessary sprites from the JSON.
     */

    return Class.extend({

        init: function(renderer) {
            var self = this;

            self.renderer = renderer;

            self.spriteData = null;
            self.sprites = {};

            $.getJSON('data/sprites.json', function(json) {
                self.spriteData = json;

                self.load();
            });
        },

        load: function() {
            var self = this;

            _.each(self.spriteData, function(sprite) {
                self.sprites[sprite.id] = new Sprite(sprite, self.renderer.drawingScale);
            });

            log.info('Finished loading sprite data...');
        },

        updateSprites: function() {
            var self = this;

            _.each(self.sprites, function(sprite) {
                sprite.update(self.renderer.getDrawingScale());
            });

            log.info('Updated sprites to: ' + self.renderer.getDrawingScale());
        }


    });

});