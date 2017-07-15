/* global log, _ */

define(['jquery', './pages/state', './pages/skill', './pages/settings'], function($, State, Skill, Settings) {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;

            self.body = $('#profileDialog');
            self.button = $('#profileButton');

            self.activePage = null;
            self.pages = [];

            self.load();
        },

        load: function() {
            var self = this;

            self.button.click(function() {

                if (self.isVisible())
                    self.hide();
                else
                    self.show();

            });

            self.state = new State(self.game);
            self.skill = new Skill(self.game);
            self.settings = new Settings(self.game);

            self.pages.push(self.state, self.skill, self.settings);
        },

        setPage: function(index) {
            var self = this,
                page = self.pages[index];

            self.clear();

            if (page.isVisible())
                return;

            page.show();

            self.activePage = page;
        },

        show: function() {
            this.body.fadeIn('fast');
        },

        hide: function() {
            this.body.fadeOut('slow');
        },

        isVisible: function() {
            return this.body.css('display') === 'block';
        },

        clear: function() {
            var self = this;

            if (self.activePage)
                self.activePage.hide();
        },

        getScale: function() {
            return this.game.getScaleFactor();
        }

    });

});