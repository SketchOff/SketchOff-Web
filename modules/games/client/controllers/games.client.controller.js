'use strict';

//Games controller
angular.module('games').controller('GamesController', ['$scope', 'Authentication', 'Socket', '$interval',
    function($scope, Authentication, Socket, $interval) {
        $scope.authentication = Authentication;

	$scope.Test = {};
	$scope.Test.players = ['Player 1', 'Player A', 'Player !'];


        var getGameInfo = function() {
            Socket.emit('get game info');
            console.log('game info emitted');
        };
   		getGameInfo();

        Socket.on('game info response', function(msg) {
        	$scope.GameRoom = msg;
        });


    }

]);
