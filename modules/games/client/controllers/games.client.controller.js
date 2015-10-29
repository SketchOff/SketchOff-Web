'use strict';

// Games controller
angular.module('games').controller('GamesController', ['$scope', 'Authentication', 'Socket', '$interval',
    function($scope, Authentication, Socket, $interval) {
        $scope.authentication = Authentication;
        $scope.GameRoom = {};
        $scope.GameRoom.phrase = 'not chosen';
        $scope.Drawing = {};
        $scope.SelectingWinner = {};
        var drawing_time = 5;
        var selecting_winner_time = 5;
        $scope.Drawing.countdown = drawing_time;
        $scope.SelectingWinner.countdown = selecting_winner_time;
        var isJudge = false;

        var startDrawingCountDown = function() {
            $interval(function() {
                $scope.Drawing.countdown--;
            }, 1000, drawing_time).then(function() {
                console.log("Drawing Time Finished.");
                if (!isJudge) Socket.emit('drawing times up');
            });
        };

        var startSelectWinnerCountDown = function() {
            $interval(function() {
                $scope.SelectingWinner.countdown--;
            }, 1000, selecting_winner_time).then(function() {
                console.log("Selecting Winner Time Finished.");
                if(isJudge) Socket.emit('selecting winner times up');
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
            if ($scope.GameRoom.judge === $scope.authentication.user.username) isJudge = true;
        });

        Socket.on('set phrases', function(msg) {
            console.log(msg);
            $scope.GameRoom.phrases = msg;
        });

        Socket.on('DRAWING', function(msg) {
            $scope.GameRoom.state = 'DRAWING';
            $scope.GameRoom.phrase = msg;
            startDrawingCountDown();
        });

        Socket.on('SELECTING_WINNER', function() {
            $scope.GameRoom.state = 'SELECTING_WINNER';
            startSelectWinnerCountDown();
        });

        Socket.on('ENDING', function() {
            $scope.GameRoom.state = 'ENDING';
        });

        $scope.setPhrase = function(phrase) {
            Socket.emit('set phrase', phrase);
        };

        $scope.setWinner = function(winner) {
            Socket.emit('set winner', winner);
        };
    }

]);
