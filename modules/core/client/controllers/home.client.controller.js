'use strict';

angular.module('core').controller('HomeController', ['$scope', 'Authentication', '$state', 'Socket', '$uibModal', '$timeout',
    function($scope, Authentication, $state, Socket, $uibModal, $timeout) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        // Make sure the Socket is connected
        if (!Socket.socket) {
            Socket.connect();
        }

        $scope.joinPublicGame = function() {
            Socket.emit('join public game');
            var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/core/client/views/waiting-for-game.client.modal.view.html'
            });
            $timeout(function() {
                modalInstance.close();
            }, 3000);
        };
    }
]);
