'use strict';

//Games controller
angular.module('games').controller('PrivateGamesController', ['$scope', 'Authentication', 'Socket', '$uibModal', '$interval', '$state',
    function($scope, Authentication, Socket, $uibModal, $interval, $state) {
        $scope.authentication = Authentication;

	var modalInstance;

	$scope.Test = {};
	$scope.Test.players = ['Player 1', 'Player A', 'Player !'];


        var getLobbyInfo = function() {
            Socket.emit('get lobby info');
            console.log('game info emitted');
        };
   	getLobbyInfo();

        Socket.on('lobby info responding', function(msg) {
        	$scope.GameRoom = msg;
        });

    Socket.on('update lobby info', function(msg) {
            $scope.GameRoom = msg;
        });

    Socket.on('go private game'){
        console.log('go private game');
        $state.go('games.room');
    }

	$scope.invitePlayers = function() {
            $scope.animationsEnabled = true;
            modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/games/client/views/invite-friends.client.modal.view.html',
                controller: 'InvitePlayersCtrl'
            });
        };

	$scope.startGame = function() {
	    if($scope.GameRoom.players.length <= $scope.GameRoom.min_players){
            Socket.emit('start private game')
        } else {
            alert("not enough players to start");
        }
	};

    }

]);



