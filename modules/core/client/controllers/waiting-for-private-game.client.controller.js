'use strict';

angular.module('core').controller('WaitingForPrivateGameCtrl', ['$scope', 'Authentication', '$modalInstance', 'Socket', '$state',
    function($scope, Authentication, $modalInstance, Socket, $state) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

	//create a private game and add 1 player???
	$modalInstance.close();
	$state.go('games.private-lobby');

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

    }
]);
