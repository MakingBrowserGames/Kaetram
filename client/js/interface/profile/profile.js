/* global log, _ */

define(['jquery', './pages/state', './pages/skill', './pages/settings'], function($, State, Skill, Settings) {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;

            self.body = $('#profileDialog');
            self.button = $('#profileButton');

            self.next = $('#next');
            self.previous = $('#previous');

            self.activePage = null;
            self.activeIndex = 0;
            self.pages = [];

            self.load();
        },

        load: function() {
            var self = this;

            self.button.click(function() {

                self.game.interface.hideAll();

                if (self.isVisible())
                    self.hide();
                else
                    self.show();

                if (!self.activePage.loaded)
                    self.activePage.load();

            });

            self.next.click(function() {
                if (self.activeIndex + 1 < self.pages.length)
                    self.setPage(self.activeIndex + 1);
                else
                    self.next.removeClass('enabled');
            });

            self.previous.click(function() {
                if (self.activeIndex > 0)
                    self.setPage(self.activeIndex - 1);
                else
                    self.previous.removeClass('enabled');
            });

            self.state = new State(self.game);
            self.skill = new Skill(self.game);
            self.settings = new Settings(self.game);

            self.pages.push(self.state, self.skill, self.settings);

            self.activePage = self.state;

            if (self.activeIndex === 0 && self.activeIndex !== self.pages.length)
                self.next.addClass('enabled');
        },

        update: function() {
            var self = this;

            _.each(self.pages, function(page) { page.update(); });
        },

        resize: function() {
            var self = this;

            _.each(self.pages, function(page) { page.resize(); });
        },

        setPage: function(index) {
            var self = this,
                page = self.pages[index];

            self.clear();

            if (page.isVisible())
                return;

            page.show();

            self.activePage = page;
            self.activeIndex = index;

            if (self.activeIndex + 1 === self.pages.length)
                self.next.removeClass('enabled');
            else if (self.activeIndex === 0)
                self.previous.removeClass('enabled');
            else {
                self.previous.addClass('enabled');
                self.next.addClass('enabled');
            }
        },

        show: function() {
            this.body.fadeIn('slow');
        },

        hide: function() {
            this.body.fadeOut('fast');
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