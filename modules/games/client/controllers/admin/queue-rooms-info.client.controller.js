'use strict';

angular.module('games.admin').controller('QueueRoomsInfoCtrl', ['$scope', 'Socket',
    function($scope, Socket) {
        var ready_for_q_updates = false;
        Socket.emit('admin updates subscribe');
        Socket.on('initial queue info', function(msg) {
            $scope.Queue = msg;
            ready_for_q_updates = true;
        });

        Socket.on('queue players update', function(msg) {
            if (ready_for_q_updates) {
                $scope.Queue.players = msg;
            }
        });

        Socket.on('queue state update', function(msg) {
            if (ready_for_q_updates) {
                $scope.Queue.state = msg;
            }
        });

        Socket.on('available games update', function(msg) {
            if (ready_for_q_updates) {
                $scope.Queue.available_games = msg;
            }
        });

        var ready_for_rooms_updates = false;
        Socket.on('initial rooms info', function(msg) {
            $scope.Rooms = msg;
            console.log(msg);
            ready_for_rooms_updates = true;
        });
    }
]);
