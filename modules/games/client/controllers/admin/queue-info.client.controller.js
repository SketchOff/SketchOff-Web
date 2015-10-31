'use strict';

angular.module('games.admin').controller('QueueInfoCtrl', ['$scope', 'Queue',
    function($scope, Queue) {
        Queue.query(function(data) {
            $scope.Queue = data;
            // $scope.buildPager();
        });
    }
]);
