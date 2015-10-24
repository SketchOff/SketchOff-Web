'use strict';

angular.module('core').controller('WaitingForGameCtrl', ['$scope', 'Authentication', '$modalInstance',
    function($scope, Authentication, $modalInstance) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    }
]);
