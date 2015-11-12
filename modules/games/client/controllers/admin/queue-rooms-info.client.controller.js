'use strict';

angular.module('games.admin').controller('QueueRoomsInfoCtrl', ['$scope', 'Socket',
    function($scope, Socket) {
        $scope.isEmpty = function(obj) {
        	console.log(obj);
            for (var i in obj)
                if (obj.hasOwnProperty(i)) return false;
            return true;
        };
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
            ready_for_rooms_updates = true;
        });

        Socket.on('room update', function(msg) {
            console.log('game update!');
            $scope.Rooms[msg[0]] = msg[1];
        });

        Socket.on('room termination', function(msg) {
            msg = msg.toString();
            console.log('delete ', $scope.Rooms[msg]);
            delete $scope.Rooms[msg];
        });
    }
]);
