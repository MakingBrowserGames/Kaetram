define(['../interface/inventory', '../interface/bank',
        '../interface/quests', '../interface/abilities'], function(Inventory, Bank, Quests, Abilities) {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;

            self.inventory = new Inventory(game);
            self.abilities = new Abilities(game);
            self.quests = new Quests(game);
            self.bank = new Bank(game);
        }

    });

});