'use strict';

//Games controller
angular.module('games').controller('GamesController', ['$scope', 'Authentication', 'Socket', '$uibModal', '$interval',
    function($scope, Authentication, Socket, $uibModal, $interval) {
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
            // $timeout(function() {
            //     modalInstance.close();
            // }, 3000);
        };


    }

]);



