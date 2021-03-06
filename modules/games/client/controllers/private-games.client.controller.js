'use strict';

//Games controller
angular.module('games').controller('PrivateGamesController', ['$scope', 'Authentication', 'Socket', '$uibModal', '$state', '$rootScope',
    function($scope, Authentication, Socket, $uibModal, $state, $rootScope) {
        $scope.authentication = Authentication;

        var modalInstance;

        var getLobbyInfo = function() {
            Socket.emit('get lobby info');
            console.log('game info emitted');
        };
        getLobbyInfo();

        Socket.on('lobby info responding', function(msg) {
            $scope.GameRoom = msg;
        });

        Socket.on('update lobby info', function(msg) {
            console.log('made it to lobby info thing');
            console.log(msg);
            $scope.GameRoom = msg;
        });

        Socket.on('go private game', function() {
            console.log('go private game');
            $state.go('games.room');
        });

        Socket.on('get kicked', function() {
            Socket.emit('leave room');
            $state.go('home');
            alert("You've been kicked from the lobby!");
        });

        $scope.invitePlayers = function() {
            $scope.animationsEnabled = true;
            modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'modules/games/client/views/invite-friends.client.modal.view.html',
                controller: 'InvitePlayersCtrl'
            });
        };

        $scope.kick = function(playerUserName) {
            if ($scope.GameRoom.lobbyLeader === playerUserName) {
                alert("You can't kick yourself!  Just leave the game...");
            } else {
                Socket.emit('kick player', playerUserName);
            }
        };

        $scope.leaveGame = function() {
            Socket.emit('leave room');
            $state.go('home');
        };

        $scope.startGame = function() {
            if ($scope.GameRoom.players.length >= $scope.GameRoom.min_players) {
                Socket.emit('start private game');
            } else {
                alert("not enough players to start");
            }
        };

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            if (fromState.name === 'games.private-lobby') {
                console.log('leaving room');
                Socket.emit('leave room');
            }
        });

    }

]);
