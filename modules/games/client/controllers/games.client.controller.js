'use strict';

// Games controller
angular.module('games').controller('GamesController', ['$scope', 'Authentication',
  function ($scope, $stateParams, $location, Authentication) {
    $scope.authentication = Authentication;

   
  }
]);
