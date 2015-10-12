'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$state', 'Socket',
    function($scope, Authentication, $state, Socket) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        $scope.joinPublicGame = function() {
            // Make sure the Socket is connected
            Socket.emit('join public game');
        };
    }
]);
