'use strict';

// Setting up route
angular.module('games.admin.routes').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider
            .state('admin.queue-info', {
                url: '/queue-info',
                templateUrl: 'modules/games/client/views/admin/queue-info.client.view.html'
            })
            .state('admin.game-room-info', {
                url: '/game-room-info',
                templateUrl: 'modules/games/client/views/admin/game-room-info.client.view.html'            });
    }
]);
