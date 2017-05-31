var Mobs = {};

Mobs.Properties = {};
Mobs.Ids = {};

Mobs.idToString = function(id) {

    if (id in Mobs.Ids)
        return Mobs.Ids[id].key;

    return null;
};

Mobs.idToName = function(id) {

    if (id in Mobs.Ids)
        return Mobs.Ids[id].name;

    return null;
};

module.exports = Mobs;