'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', 'Socket', '$uibModal', '$timeout',
    function($scope, Authentication, Socket, $uibModal, $timeout) {
        // This provides Authentication context.
        $scope.authentication = Authentication;
        $scope.error = {};

        var modalInstance;

        // Make sure the Socket is connected
        if (!Socket.socket) {
            Socket.connect();
        }

        $scope.joinPublicGame = function() {
            $scope.animationsEnabled = true;
            modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/core/client/views/waiting-for-game.client.modal.view.html',
                controller: 'WaitingForGameCtrl'
            });
            // $timeout(function() {
            //     modalInstance.close();
            // }, 3000);
        };

        $scope.startPrivateGame = function() {
        };

        Socket.on('already waiting redirect', function() {
            $scope.error.already_waiting = 'Your already waiting to join a game';
            console.log("already wating");
        });


    }
]);
