'use strict';

angular.module('core').controller('WaitingForGameCtrl', ['$scope', 'Authentication',
    function($scope, Authentication) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

    }
]);