var Mobs = {};

Mobs.Properties = {};
Mobs.Ids = {};

Mobs.getNameFromId = function(id) {

    if (id in Mobs.Ids)
        return Mobs.Ids[id].key;

    return null;
};

Mobs.getMobNameFromId = function(id) {

    if (id in Mobs.Ids)
        return Mobs.Ids[id].name;

    return null;
};

module.exports = Mobs;