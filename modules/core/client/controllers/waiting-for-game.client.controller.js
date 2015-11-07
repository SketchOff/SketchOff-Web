'use strict';

angular.module('core').controller('WaitingForGameCtrl', ['$scope', 'Authentication', '$modalInstance', 'Socket', '$state',
    function($scope, Authentication, $modalInstance, Socket, $state) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        $scope.Error = {exists: false};
        
        // Send a request to server
        Socket.emit('join public game');


        $scope.cancel = function() {
            Socket.emit('leave queue');
            $modalInstance.dismiss('cancel');
        };

        // Add an event listener to the 'ESTABLISHED' event
        Socket.on('ESTABLISHED', function(msg) {
            $modalInstance.close();
            $state.go('games.room');
        });

        Socket.on('already in queue', function() {
            $scope.Error.exists = true;
            $scope.Error.in_game = 'You\'re already waiting for a game';
        });

        Socket.on('already in game', function() {
            $scope.Error.exists = true;
            $scope.Error.in_queue = 'You\'re already playing a game';
        });

    }
]);
