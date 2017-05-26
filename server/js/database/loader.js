var cls = require('../lib/class');

module.exports = Loader = cls.Class.extend({

    init: function(mysql) {
        var self = this;

        self.mysql = mysql;
    },

    getInventory: function(player, callback) {
        var self = this;

        self.mysql.query('SELECT * FROM `player_inventory` WHERE `player_inventory`.`username`=' + "'" + player.username + "'", function(error, rows, fields) {
            log.info('Querying..')
        });
    }

});