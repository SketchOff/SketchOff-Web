'use strict';

// Games controller
angular.module('games').controller('ArticlesController', ['$scope', 'Authentication',
  function ($scope, $stateParams, $location, Authentication) {
    $scope.authentication = Authentication;

   
  }
]);
