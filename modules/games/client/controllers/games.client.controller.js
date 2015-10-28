'use strict';

// Games controller
angular.module('games').controller('GamesController', ['$scope', 'Authentication', 'Socket', '$interval',
    function($scope, Authentication, Socket, $interval) {
        $scope.authentication = Authentication;

        var getGameInfo = function() {
            Socket.emit('game info');
            console.log('game info emitted');
        };
    }

]);
