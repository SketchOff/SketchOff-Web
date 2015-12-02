'use strict';

// Articles controller
angular.module('games').controller('GameViewController', ['$scope', '$stateParams', 'Authentication', 'Games',
  function ($scope, $stateParams, Authentication, Games) {
    $scope.authentication = Authentication;

    // Find existing Article
    $scope.findOne = function () {
      $scope.game = Games.get({
        gameId: $stateParams.gameId
      });
    };
  }
]);
