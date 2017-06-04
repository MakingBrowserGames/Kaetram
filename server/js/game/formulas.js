var Formulas = {};

Formulas.LevelExp = [];

module.exports = Formulas;

Formulas.getDamage = function(attacker, target) {
    return 15;
};

Formulas.expToLevel = function(experience) {
    if (experience < 0)
        return -1;

    for (var i = 1; i < Formulas.LevelExp.length; i++)
        if (experience < Formulas.LevelExp[i])
            return i;
};

Formulas.getMaxHitPoints = function(level) {
    return 100 + (level * 30);
};

Formulas.getMaxMana = function(level) {
    return 10 + (level * 8);
};