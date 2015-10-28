'use strict';

// Games controller
angular.module('games').controller('GamesController', ['$scope', 'Authentication', 'Socket', '$interval',
    function($scope, Authentication, Socket, $interval) {
        $scope.authentication = Authentication;
        $scope.GameRoom = {};
        $scope.GameRoom.phrase = 'not chosen';
        $scope.Drawing = {};
        $scope.Drawing.countdown = 60;

        var startCountDown = function() {
            $interval(function() {
                console.log($scope.Drawing.countdown--);
            }, 1000, 60).then(function () { console.log("Finished."); } );
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
        });

        Socket.on('phrases', function(msg) {
            console.log(msg);
            $scope.GameRoom.phrases = msg;
        });

        Socket.on('DRAWING', function(msg) {
            $scope.GameRoom.state = 'DRAWING';
            $scope.GameRoom.phrase = msg;
            startCountDown();
        });

        $scope.setPhrase = function(phrase) {
            Socket.emit('set phrase', phrase);
        };
    }

]);
