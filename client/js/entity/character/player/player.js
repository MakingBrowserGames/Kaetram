/* global Modules */

define(['../character'], function(Character) {

    return Character.extend({

        init: function() {
            var self = this;

            self._super(-1, Modules.Types.Player);

            self.username = '';
            self.password = '';
            self.email = '';

            self.avatar = null;

            self.wanted = false;
            self.experience = -1;
            self.pvpKills = -1;
            self.pvpDeaths = -1;

            self.prevX = 0;
            self.prevY = 0;

            self.loadEquipment();
        },

        loadEquipment: function() {
            var self = this;

            self.armour = null;
            self.weapon = null;
            self.pendant = null;
            self.ring = null;
            self.boots = null;
        },

        performAction: function(orientation, action) {
            this._super(orientation, action);
        },

        setSprite: function(sprite) {
            this._super(sprite);
        },

        getSpriteName: function() {
            return this.sprite ? this.sprite : 'clotharmor';
        },

        setGridPosition: function(x, y) {
            this._super(x, y);
        }

    });

});