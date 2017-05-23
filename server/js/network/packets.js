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
    Step: 9
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

module.exports = Packets;