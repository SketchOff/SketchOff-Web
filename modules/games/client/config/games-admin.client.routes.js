'use strict';

// Setting up route
angular.module('games.admin.routes').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider
            .state('admin.queue-rooms-info', {
                url: '/queue-rooms-info',
                templateUrl: 'modules/games/client/views/admin/queue-rooms-info.client.view.html'
            });
    }
]);
