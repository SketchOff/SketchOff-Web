'use strict';

// Games controller
angular.module('games').controller('TerminatedGameCtrl', ['$scope', 'Authentication', '$state', '$uibModal',
    function($scope, Authentication, $state, $uibModal) {
        $scope.authentication = Authentication;
        var modalInstance;

        $scope.goHome = function() {
            $state.go('home');
        };

        $scope.joinPublicGame = function() {
            $scope.animationsEnabled = true;
            modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/core/client/views/waiting-for-game.client.modal.view.html',
                controller: 'WaitingForGameCtrl'
            });
        };
    }
]);
