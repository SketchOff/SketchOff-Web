'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$state', 'Socket',
    function($scope, Authentication, $state, Socket) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        // Make sure the Socket is connected
        if (!Socket.socket) {
            Socket.connect();
        }

        $scope.joinPublicGame = function() {
            Socket.emit('join public game');
        };
    }
]);
