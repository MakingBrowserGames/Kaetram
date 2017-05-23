/* global module */

var Utils = {};

module.exports = Utils;

Utils.random = function(range) {
    return Math.floor(Math.random() * range);
};

Utils.randomInt = function(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
};

/**
 * There is seriously no way two clients can end up with the same ID
 */

Utils.generateClientId = function() {
    return Utils.randomInt(0, 1000000) + Utils.randomInt(0, 40000) + Utils.randomInt(0, 9000);
};

Utils.generateInstance = function(randomizer, id, modulo) {
    return '' + randomizer + id + randomizer + Utils.randomInt(0, modulo);
};