var Formulas = {},
    Utils = require('../util/utils');

Formulas.LevelExp = [];

module.exports = Formulas;

Formulas.getDamage = function(attacker, target) {
    if (!attacker || !target)
        return;

    var damage, damageAbsorbed,
        weaponLevel = attacker.weapon ? attacker.weapon.getLevel() : attacker.weaponLevel,
        attackerArmourLevel = attacker.armour ? attacker.armour.getDefense() : attacker.armourLevel,
        targetArmourLevel = target.armour ? target.armour.getDefense() : target.armourLevel,
        usingRange = attacker.weapon ? attacker.weapon.isRanged() : attacker.isRanged();

    if (weaponLevel < 1)
        weaponLevel = 1;

    if (attackerArmourLevel < 1)
        attackerArmourLevel = 1;

    if (targetArmourLevel < 1)
        targetArmourLevel = 1;

    /**
     * Set the baseline damage
     */

    damage = (attacker.level * (Utils.random(0.45, 2.175)));

    /**
     * Take in consideration weapon level & armour
     */

    damage += (weaponLevel * (2.125 + (Utils.random(0.1, 1.25))) * (usingRange ? Utils.random(0.75, 1.15) : 2.15 + Utils.random(2.1, 4.2)));
    damage += (attackerArmourLevel * (Utils.random(0.15, 0.35)));

    /**
     * Handle damage absorption
     * TODO - Improve upon this when pendants, rings and boots are added into the game
     */

    damageAbsorbed = target.level + Utils.random(0, targetArmourLevel) * (0.55 + Utils.random(-0.35, 0.05));

    damage = Math.round(damage);
    damageAbsorbed = Math.round(damageAbsorbed);

    damage -= damageAbsorbed;

    if (isNaN(damage) || !damage || damage < 0)
        damage = 0;

    return damage;
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