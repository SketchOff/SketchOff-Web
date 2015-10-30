'use strict';

// Games controller
angular.module('games').controller('GamesController', ['$scope', 'Authentication', 'Socket', '$interval',
    function($scope, Authentication, Socket, $interval) {
        $scope.authentication = Authentication;
        $scope.GameRoom = {};

        var is_judge = false;
        var set_winner = false;

        var getGameInfo = function() {
            Socket.emit('get game info');
            console.log('game info emitted');
        };
        getGameInfo();

        Socket.on('game info response', function(msg) {
            for (var key in msg) {
                $scope.GameRoom[key] = msg[key];
            }
            if ($scope.GameRoom.judge === $scope.authentication.user.username) is_judge = true;
        });

        Socket.on('set phrases', function(msg) {
            console.log(msg);
            $scope.GameRoom.phrases = msg;
        });

        Socket.on('ESTABLISHING', function(msg) {
            $scope.GameRoom.state = 'ESTABLISHING';
            $scope.GameRoom.phrase = undefined;
            $scope.GameRoom.winner = undefined;
            $scope.GameRoom.judge = msg;
            // TODO: Give judge a countdown to select phrase, otherwise kick judge
        });

        Socket.on('DRAWING', function(msg) {
            $scope.GameRoom.state = 'DRAWING';
            $scope.GameRoom.phrase = msg;
        });

        Socket.on('SELECTING_WINNER', function() {
            $scope.GameRoom.state = 'SELECTING_WINNER';
        });

        Socket.on('ENDING', function(msg) {
            console.log('ending');
            $scope.GameRoom.state = 'ENDING';
            if (msg === null) msg = 'No winner';
            $scope.GameRoom.winner = msg;
        });

        Socket.on('player joined', function(msg) {
            $scope.GameRoom.players_waiting = msg;
        });

        Socket.on('drawing countdown', function(msg) {
            $scope.GameRoom.drawing_time = msg;
        });

        Socket.on('selecting winner countdown', function(msg) {
            $scope.GameRoom.winner_selection_time = msg;
        });

        $scope.setPhrase = function(phrase) {
            Socket.emit('set phrase', phrase);
        };

        $scope.setWinner = function(winner) {
            set_winner = true;
            Socket.emit('set winner', winner);
        };
    }

]);
