'use strict';

// Games controller
angular.module('games').controller('GamesController', ['$scope', 'Authentication', 'Socket', '$interval',
    function($scope, Authentication, Socket, $interval) {
        $scope.authentication = Authentication;
        $scope.GameRoom = {};
        $scope.GameRoom.phrase = 'not chosen';
        $scope.Drawing = {};
        var drawing_time = 10;
        $scope.Drawing.countdown = drawing_time;
        var isJudge = false;

        var startCountDown = function() {
            $interval(function() {
                $scope.Drawing.countdown--;
            }, 1000, drawing_time).then(function() {
                console.log("Finished.");
                if (!isJudge) Socket.emit('drawing times up');
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
            startCountDown();
        });

        Socket.on('SELECTING_WINNER', function() {
            $scope.GameRoom.state = 'SELECTING_WINNER';
        }); 

        $scope.setPhrase = function(phrase) {
            Socket.emit('set phrase', phrase);
        };
    }

]);
