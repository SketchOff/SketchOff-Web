'use strict';

// Setting up route
angular.module('games.admin.routes').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider
            .state('admin.queue-info', {
                url: '/queue-info',
                templateUrl: 'modules/games/client/views/admin/queue-info.client.view.html'
            })
            .state('admin.game-rooms-info', {
                url: '/game-rooms-info',
                templateUrl: 'modules/games/client/views/admin/game-rooms-info.client.view.html'            });
    }
]);
