'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Socket', '$uibModal', '$timeout', '$state',
    function($scope, Authentication, Socket, $uibModal, $timeout, $state) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        $scope.error = {};

        var modalInstance;

        // Make sure the Socket is connected
        if (!Socket.socket && Authentication.user) {
            Socket.connect();
        }

        $scope.joinPublicGame = function() {
            $scope.animationsEnabled = true;
            modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/core/client/views/waiting-for-game.client.modal.view.html',
                controller: 'WaitingForGameCtrl'
            });
        };

        Socket.on('already in game redirect', function() {
            $scope.error.already_waiting = 'Youre already waiting to join a game';
            console.log("already wating");
        });

        $scope.startPrivateGame = function() {
            Socket.emit('create private game');
            $state.go('games.private-lobby');
        };
    }
]);
