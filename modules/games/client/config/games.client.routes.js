'use strict';

// Setting up route
angular.module('games').config(['$stateProvider',
    function($stateProvider) {
        // Articles state routing
        $stateProvider
            .state('games', {
                abstract: true,
                url: '/',
                template: '<ui-view/>'
            })
            .state('games.room', {
                url: 'play',
                templateUrl: 'modules/games/client/views/game-room.client.view.html'
            })
            .state('games.terminated', {
                url: '',
                templateUrl: 'modules/games/client/views/terminated-game-room.client.view.html'
            })
            .state('games.private-lobby', {
                url: 'lobby',
                templateUrl: 'modules/games/client/views/private-room-lobby.client.view.html'
            })
            .state('games.view', {
                url: 'games/:gameId',
                templateUrl: 'modules/games/client/views/game-view.client.view.html',
                data: {
                    roles: ['user', 'admin']
                }
            });
    }
]);
