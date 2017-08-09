var cls = require('../../../../lib/class'),
    Modules = require('../../../../util/modules');

module.exports = Trade = cls.Class.extend({

    /**
     * Trade states proceed as follows..
     *
     * 1. Initial request (either player requests a trade)
     * 2. Trading screen opens (player select their items)
     * 3. First player accepts
     * 4. Second player accepts
     * 5. Trade finished.
     *
     * Each trading instance is assigned to a player,
     * and it is only triggered whenever a trade is intiated.
     *
     * After the trade, the oPlayer for each repsective player is cleared.
     *
     */

    init: function(player, oPlayer) {
        var self = this;

        self.player = player;
        self.oPlayer = oPlayer;

        self.playerItems = [];
        self.oPlayerItems = [];

        self.state = null;
    },

    select: function(instance, slot) {
        var self = this;

        if (instance === self.player.instance) {
            var item = self.player.inventory.slots[slot],
                index = self.player.indexOf(item);

            if (index > -1)
                self.playerItems.splice(index, 1);
            else
                self.playerItems.push(item);

        } else if (instance === self.oPlayer.instance) {
            var oItem = self.oPlayer.inventory.slots[slot],
                oIndex = self.oPlayerItems.indexOf(oItem);

            if (oIndex > -1)
                self.oPlayerItems.splice(oIndex, 1);
            else
                self.oPlayerItems.push(oItem);
        }
    },

    accept: function() {
        var self = this;

        switch (self.state) {
            case Modules.Trade.Started:

                break;

            case Modules.Trade.Accepted:

                break;
        }
    },

    decline: function() {

    }

});