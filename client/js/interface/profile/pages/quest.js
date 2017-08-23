define(['jquery', '../page'], function($, Page) {

    return Page.extend({

        init: function() {
            var self = this;

            self._super('#questPage');

            self.achievements = $('#achievementList');
            self.quests = $('#questList');


        }
    });

});