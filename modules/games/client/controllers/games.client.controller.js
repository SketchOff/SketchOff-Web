'use strict';

// Games controller
angular.module('games').controller('GamesController', ['$scope', 'Authentication', 'Socket', '$interval',
    function($scope, Authentication, Socket, $interval) {
        $scope.authentication = Authentication;
        $scope.GameRoom = {};

        var getGameInfo = function() {
            Socket.emit('get game info');
            console.log('game info emitted');
        };
   		getGameInfo();

        Socket.on('game info response', function(msg) {
        	$scope.GameRoom = msg;
        });

        Socket.on('phrases', function(msg) {
            console.log(msg);
            $scope.GameRoom.phrases = msg;
        });

        $scope.setPhrase = function(phrase) {
            Socket.emit('set phrase', phrase);
        };
    }

]);
