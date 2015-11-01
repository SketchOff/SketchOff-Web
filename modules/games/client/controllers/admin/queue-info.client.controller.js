'use strict';

angular.module('games.admin').controller('QueueInfoCtrl', ['$scope', 'Socket',
    function($scope, Socket) {
        var ready_for_updates = false;
        Socket.emit('admin queue updates subscribe');
        Socket.on('initial queue info', function(msg) {
            $scope.Queue = msg;
            ready_for_updates = true;
        });

        Socket.on('queue players update', function(msg) {
            if (ready_for_updates) {
                $scope.Queue.players = msg;
            }
        });

        Socket.on('queue state update', function(msg) {
            if (ready_for_updates) {
                $scope.Queue.state = msg;
            }
        });

        Socket.on('available games update', function(msg) {
            if (ready_for_updates) {
                $scope.Queue.available_games = msg;
            }
        });
    }
]);
