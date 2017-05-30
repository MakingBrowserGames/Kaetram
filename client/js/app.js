/* global log, Class, Detect, Modules */

define(['jquery'], function($) {

    return Class.extend({

        init: function() {
            var self = this;

            log.info('Loading the main application...');

            self.config = null;

            self.body = $('body');
            self.parchment = $('#parchment');
            self.container = $('#container');
            self.window = $(window);
            self.canvas = $('#canvas');
            self.border = $('#border');

            self.intro = $('#intro');

            self.loginButton = $('.login');
            self.registerButton = $('.createNew');
            self.helpButton = $('#helpButton');
            self.loading = $('.loader');

            self.loginFields = [];
            self.registerFields = [];

            self.game = null;

            self.parchmentAnimating = false;

            self.sendStatus('Initializing the main app');

            self.zoom();
            self.updateOrientation();
            self.load();
        },

        load: function() {
            var self = this;

            self.loginButton.click(function() {
                self.login();
            });

            self.registerButton.click(function() {
                self.openScroll('loadCharacter', 'createCharacter');
            });

            window.scrollTo(0, 1);

            self.window.resize(function() {
                self.zoom();
            });

            $.getJSON('data/config.json', function(json) {
                self.config = json;

                if (self.readyCallback)
                    self.readyCallback();
            });

            $(document).keydown(function(e) {
                var key = e.which;

                if (key === Modules.Keys.Enter) {
                    self.login();
                    return;
                }

                if (!self.game || !self.game.started)
                    return;

                self.game.onInput(Modules.InputType.Key, key);
            });

            $(document).keyup(function(e) {
                var key = e.which;

                if (!self.game || !self.game.started)
                    return;

                self.game.input.keyUp(key);
            });

            $(document).mousemove(function(event) {
                if (!self.game || !self.game.input)
                    return;

                self.game.input.setCoords(event);

            });

            self.canvas.click(function(event) {
                if (!self.game || !self.game.started || event.button !== 0)
                    return;

                window.scrollTo(0, 1);
                self.game.input.handle(Modules.InputType.LeftClick, event);

            });

        },

        login: function() {
            var self = this;

            if (!self.game || !self.game.loaded || self.statusMessage || !self.verifyForm())
                return;

            self.toggleLogin(true);
            self.game.connect();
        },

        zoom: function() {
            var self = this,
                zoomFactor = self.window.width() / self.container.width();

            if (self.getScaleFactor() === 3)
                zoomFactor -= 0.1;

            self.body.css({
                'zoom': zoomFactor,
                '-moz-transform': 'scale(' + zoomFactor + ')'
            });

            self.border.css('top', 0);

            self.zoomFactor = zoomFactor;
        },

        fadeMenu: function() {
            var self = this;

            self.updateLoader(null);

            setTimeout(function() {
                self.body.addClass('game');
                self.body.addClass('started');
                self.body.removeClass('intro');
            }, 500);
        },

        openScroll: function(origin, destination) {
            var self = this;

            if (!destination)
                return;

            self.cleanErrors();

            if (!self.isMobile()) {
                if (self.parchmentAnimating)
                    return;

                self.parchmentAnimating = true;

                self.parchment.toggleClass('animate').removeClass(origin);

                setTimeout(function() {

                    self.parchment.toggleClass('animate').addClass(destination);
                    self.parchmentAnimating = false;

                }, self.isTablet() ? 0 : 1000);

            } else
                self.parchment.removeClass(origin).addClass(destination);
        },

        displayScroll: function(content) {
            var self = this,
                state = self.parchment.attr('class');

            if (self.game.started) {

                self.parchment.removeClass().addClass(content);

                self.body.removeClass('credits legal about').toggleClass(content);

                if (self.game.player)
                    self.body.toggleClass('death');

                if (content !== 'about')
                    self.helpButton.removeClass('active');

            } else if (state !== 'animate')
                self.openScroll(state, state === content ? 'loadCharacter' : content);

        },

        verifyForm: function() {
            var self = this,
                activeForm = self.getActiveForm();

            if (activeForm === 'null')
                return;

            switch (activeForm) {

                case 'loadCharacter':

                    var nameInput = $('#loginNameInput'),
                        passwordInput = $('#loginPasswordInput');

                    if (self.loginFields.length === 0)
                        self.loginFields = [nameInput, passwordInput];

                    if (!nameInput.val()) {
                        self.sendError(nameInput, 'Please enter a username.');
                        return false;
                    }

                    if (!passwordInput.val()) {
                        self.sendError(passwordInput, 'Please enter a password.');
                        return false;
                    }

                    break;

                case 'createCharacter':

                    var characterName = $('#registerNameInput'),
                        registerPassword = $('#registerPasswordInput'),
                        registerPasswordConfirmation = $('#registerPasswordConfirmationInput'),
                        email = $('#registerEmailInput');

                    if (self.registerFields.length === 0)
                        self.registerFields = [characterName, registerPassword, registerPasswordConfirmation, email];

                    if (!characterName.val()) {
                        self.sendError(characterName, 'A username is necessary you silly.');
                        return false;
                    }

                    if (!registerPassword.val()) {
                        self.sendError(registerPassword, 'You must enter a password.');
                        return false;
                    }

                    if (registerPasswordConfirmation.val() !== registerPassword.val()) {
                        self.sendError(registerPasswordConfirmation, 'Please ensure the two passwords match!');
                        return false;
                    }

                    if (!email.val() || !self.verifyEmail(email.val())) {
                        self.sendError(email, 'You must enter a valid email to register.');
                        return false;
                    }

                    break;
            }

            return true;
        },

        verifyEmail: function(email) {
            return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
        },

        sendStatus: function(message) {
            var self = this;

            self.cleanErrors();

            self.statusMessage = message;

            if (!message)
                return;

            $('<span></span>', {
                'class': 'status blink',
                text: message
            }).appendTo('.validation-summary');

            $('.status').append('<span class="loader__dot">.</span><span class="loader__dot">.</span><span class="loader__dot">.</span>');
        },

        sendError: function(field, error) {
            this.cleanErrors();

            $('<span></span>', {
                'class': 'validation-error blink',
                text: error
            }).appendTo('.validation-summary');

            if (!field)
                return;

            field.addClass('field-error').select();
            field.bind('keypress', function(event) {
                field.removeClass('field-error');

                $('.validation-error').remove();

                $(this).unbind(event);
            });
        },

        cleanErrors: function() {
            var self = this,
                activeForm = self.getActiveForm(),
                fields = activeForm === 'loadCharacter' ? self.loginFields : self.registerFields;

            for (var i = 0; i < fields.length; i++)
                fields[i].removeClass('field-error');

            $('.validation-error').remove();
            $('.status').remove();
        },

        getActiveForm: function() {
            return this.parchment[0].className;
        },

        isRegistering: function() {
            return this.getActiveForm() === 'createCharacter';
        },

        resize: function() {
            var self = this;

            if (self.game)
                self.game.resize();
        },

        setGame: function(game) {
            this.game = game;
        },

        hasWorker: function() {
            return !!window.Worker;
        },

        getScaleFactor: function() {
            var width = window.innerWidth,
                height = window.innerHeight;

            /**
             * These are raw scales, we can adjust
             * for up-scaled rendering in the actual
             * rendering file.
             */

            return width <= 1000 ? 1 : ((width <= 1500 || height <= 870) ? 2 : 3);
        },

        revertLoader: function() {
            this.updateLoader('Connecting');
        },

        updateLoader: function(message) {
            var self = this;

            if (!message) {
                self.loading.html('');
                return;
            }

            var dots = '<span class="loader__dot">.</span><span class="loader__dot">.</span><span class="loader__dot">.</span>';
            self.loading.html(message + dots);
        },

        toggleLogin: function(toggle) {
            var self = this;

            self.revertLoader();

            if (toggle) {
                self.loginButton.fadeOut('slow');
                self.registerButton.fadeOut('slow');
                self.loading.removeAttr('hidden');
            } else {
                self.loginButton.fadeIn('slow');
                self.registerButton.fadeIn('slow');
                self.loading.attr('hidden', true);
            }
        },

        updateOrientation: function() {
            this.orientation = this.getOrientation();
        },

        getOrientation: function() {
            return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        },

        getZoom: function() {
            return this.zoomFactor;
        },

        onReady: function(callback) {
            this.readyCallback = callback;
        },

        isMobile: function() {
            return this.getScaleFactor() < 2;
        },

        isTablet: function() {
            return Detect.isIpad() || (Detect.isAndroid() && this.getScaleFactor() > 1);
        }

    });

});