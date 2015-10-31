'use strict';

angular.module('games.admin').controller('QueueInfoCtrl', ['$scope', 'Queue',
    function($scope, Queue) {
        Queue.get(function(data) {
            $scope.Queue = data;
            console.log(data);
        });
    }
]);
