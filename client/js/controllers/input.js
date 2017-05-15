/* global Modules */

define(function() {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;

            self.selectedCellVisible = false;
            self.previousClick = {};
            self.cursorVisible = true;
            self.selectedX = -1;
            self.selectedY = -1;
        },

        handle: function(inputType, data) {
            var self = this;

            switch(inputType) {
                case Modules.InputType.Key:

                    switch(data) {
                        case Modules.Keys.Right:
                        case Modules.Keys.Left:
                        case Modules.Keys.Up:
                        case Modules.Keys.Down:
                            self.game.getCamera().handlePanning(data);
                            break;
                    }

                    break;

                case Modules.InputType.LeftClick:

                    break;

                case Modules.InputType.RightClick:

                    break;
            }
        },

        onKey: function(callback) {
            this.keyCallback = callback;
        },

        onRightClick: function(callback) {
            this.rightClickCallback = callback;
        },

        onLeftClick: function(callback) {
            this.leftClickCallback = callback;
        }

    });

});