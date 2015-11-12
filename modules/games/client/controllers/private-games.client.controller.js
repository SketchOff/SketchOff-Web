'use strict';

//Games controller
angular.module('games').controller('PrivateGamesController', ['$scope', 'Authentication', 'Socket', '$uibModal', '$interval', '$state',
    function($scope, Authentication, Socket, $uibModal, $interval, $state) {
        $scope.authentication = Authentication;

	var modalInstance;

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

	$scope.invitePlayers = function() {
            $scope.animationsEnabled = true;
            modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/games/client/views/invite-friends.client.modal.view.html',
                controller: 'InvitePlayersCtrl'
            });
        };

	$scope.startGame = function() {
	    //TODO: emit start?
	    //I DONT GET HOW A GAME IS ATTACHED TO THIS CONTROLLER
	    //I WANT TO GO FROM 'LOBBY' TO 'ESTABLISHING'
	    $state.go('games.room');//???????
	};


    }

]);



