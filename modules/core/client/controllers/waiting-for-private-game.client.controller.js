'use strict';

angular.module('core').controller('WaitingForPrivateGameCtrl', ['$scope', 'Authentication', '$modalInstance', 'Socket', '$state',
    function($scope, Authentication, $modalInstance, Socket, $state) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        
        // Send a request to server
        Socket.emit('join public game');//private game?


        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        // Add an event listener to the 'ESTABLISHED' event
        Socket.on('ESTABLISHED', function(message) {
            console.log('WaitingForPrivateGameCtrl says: game established');
            $modalInstance.close();
            $state.go('games.private-lobby');
        });

    }
]);
