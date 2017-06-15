/**
 * -- Packets Information --
 * Handshake - Responsible for the initial batch of packets sent from and to the server
 * Intro - Sent with Packets.LoginType representing login information [Packets.Introduction, Packets.LoginType.Login, [userData]];
 * Welcome - Packet received after the server has processed the Packets.LoginType
 * Spawns - Client receives information about the position of NPCs
 *
 * -- Opcode Information --
 * Login - Sent alongside `Intro` to indicate the type of login
 * Register - Same as Login
 */

var Packets = {
    Handshake: 0,
    Intro: 1,
    Welcome: 2,
    Spawn: 3,
    List: 4,
    Who: 5,
    Equipment: 6,
    Ready: 7,
    Drop: 8,
    Movement: 9,
    Teleport: 10,
    Request: 11,
    Despawn: 12,
    Target: 13,
    Combat: 14,
    Animation: 15,
    Projectile: 16,
    Population: 17,
    Points: 18,
    Network: 19
};

Packets.IntroOpcode = {
    Login: 0,
    Register: 1
};

Packets.EquipmentOpcode = {
    Batch: 0,
    Equip: 1,
    Unequip: 2
};

Packets.MovementOpcode = {
    Request: 0,
    Started: 1,
    Step: 2,
    Stop: 3,
    Move: 4,
    Follow: 5,
    Entity: 6
};

Packets.TargetOpcode = {
    Talk: 0,
    Attack: 1,
    None: 2
};

Packets.CombatOpcode = {
    Initiate: 0,
    Hit: 1,
    Finish: 2
};

Packets.ProjectileOpcode = {
    Static: 0,
    Dynamic: 1,
    Create: 2,
    Update: 3,
    Impact: 4
};

Packets.NetworkOpcode = {
    Ping: 0,
    Pong: 1
};

module.exports = Packets;