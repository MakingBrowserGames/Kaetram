# Kaetram

The following repository is a codename for the original game - [Tap Tap Adventure](https://taptapadventure.com) (TTA). It is an expansion, rather, a complete rehaul of the original game through the usage of proper up-to-date framework and rendering techniques. All of the features currently in TTA will be redone, and re-added to this game. The main purpose of this rewrite is to ensure maximum compatibility on as many devices as possible, while also providing a cleaner environment for new developers joining the project!

Note: After this repository reaches the same level as TTA, it will be merged with the original repository, and this one will be deleted.

Currently Finished: 

* Rendering (Entities, Tilemap, Animations)
* Server/Client communication
* MySQL saving and loading (with automatic generation)
* Entity and Player handler (to avoid cluttering up the main file)
* Properly done Title Screen and connection
* Re-arranged CSS accordingly
* Sprite loading done properly (without massive amounts of hardcoding)

To-Do:

* Entity movement (pathfinding)
* Entity spawning (receive information from the server side)
* Add door system
* Combat System (should be handled in the server side)
* Add the new interface
* Implement Abilities, Special Effects and Inventory
* Miscellaneous stuff from TTA such as Guilds, Parties, Shops, Enchantment, etc.


## Running Kaetram

Firstly, ensure you `clone` the repository, and you are into the current file directory (in Terminal). Secondly, make sure you have the latest version of NodeJS.

Step 1 - Installing the Dependencies

`sudo npm install -d`

You do not need `http-server` like in TTA, though you can use it if you want.

Step 2 - Run the server

`node server/js/main.js`

Step 3 - Connect locally

`http://127.0.0.1:1800`

If you are experiencing any errors with the connection, check the IP and Port in the configuration files, though this should not happen.

### For Developers

If you are planning on aiding with development, I highly suggest installing `nodemon` as a npm dependency, it automatically restarts the server and saves you the hassle.
