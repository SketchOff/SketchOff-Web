'use strict';

// Games controller
angular.module('games').controller('GamesController', ['$scope', 'Authentication', 'Socket', '$interval',
    function($scope, Authentication, Socket, $interval) {
        $scope.authentication = Authentication;
        $scope.GameRoom = {};
        $scope.Drawing = {};
        $scope.SelectingWinner = {};
        $scope.Ending = {};
        var drawing_time = 5;
        var selecting_winner_time = 5;
        var new_game_time = 5;
        var is_judge = false;
        var set_winner = false;

        var startDrawingCountDown = function() {
            $scope.Drawing.countdown = drawing_time;

            $interval(function() {
                $scope.Drawing.countdown--;
            }, 1000, drawing_time).then(function() {
                console.log('Drawing Time Finished.');
                if (!is_judge) Socket.emit('drawing times up');
            });
        };

        var startSelectingWinnerCountDown = function() {
            $scope.SelectingWinner.countdown = selecting_winner_time;

            $interval(function() {
                $scope.SelectingWinner.countdown--;
            }, 1000, selecting_winner_time).then(function() {
                if (is_judge && !set_winner) {
                    console.log('Selecting Winner Time Finished.');
                    Socket.emit('selecting winner times up');
                } else set_winner = false;
            });
        };

        var startNewGameCountDown = function() {
            $scope.Ending.countdown = new_game_time;

            $interval(function() {
                $scope.Ending.countdown--;
            }, 1000, new_game_time).then(function() {
                console.log('Round Transmission Finished.');
                Socket.emit('start new game');
            });
        };

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
            startDrawingCountDown();
        });

        Socket.on('SELECTING_WINNER', function() {
            $scope.GameRoom.state = 'SELECTING_WINNER';
            startSelectingWinnerCountDown();
        });

        Socket.on('ENDING', function(msg) {
            console.log('ending');
            $scope.GameRoom.state = 'ENDING';
            if (msg === null) msg='No winner';
            $scope.GameRoom.winner = msg;
            startNewGameCountDown();
        });

        Socket.on('player joined', function(msg) {
            $scope.GameRoom.players_waiting = msg;
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
