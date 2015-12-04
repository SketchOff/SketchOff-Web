'use strict';

// Articles controller
angular.module('games').controller('GameViewController', ['$scope', '$stateParams', 'Authentication', 'Games',
    function($scope, $stateParams, Authentication, Games) {
        $scope.authentication = Authentication;
        $scope.flags = {
            ready: false
        };

        // Find existing Article
        $scope.findOne = function() {
            $scope.game = Games.get({
                gameId: $stateParams.gameId
            }, function(game) {
                $scope.flags.ready = true;
                console.log('flags ready', $scope.flags.ready);
            });
        };

    }
]);
