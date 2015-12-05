'use strict';

angular.module('games').controller('InvitePlayersCtrl', ['$scope', 'Authentication', '$modalInstance', 'Socket',
    function($scope, Authentication, $modalInstance, Socket) {
        // This provides Authentication context.
        $scope.authentication = Authentication;

        $scope.avaliableUsernames = [];
        $scope.totalItems = $scope.avaliableUsernames.length;
        $scope.currentPage = 1;
        $scope.numPerPage = 5;
        var avaliablePlayers;

        Socket.emit('get all avaliable players');
        Socket.on('avaliable players responding', function(msg) {
            avaliablePlayers = msg;
            for (var username in avaliablePlayers) {
                $scope.avaliableUsernames.push(username);
            }
            $scope.totalItems = avaliablePlayers.length;
        });


        $scope.paginate = function(value) {
            var begin, end, index;
            begin = ($scope.currentPage - 1) * $scope.numPerPage;
            end = begin + $scope.numPerPage;
            index = $scope.avaliableUsernames.indexOf(value);
            return (begin <= index && index < end);
        };



        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };

        $scope.invite = function(player_username) {
            var socket_id = avaliablePlayers[player_username].socket_id;
            Socket.emit('invite player', socket_id);
        };

        $scope.getAvaliablePlayers = function() {
            Socket.emit('get all avaliable players');
        };

        setInterval($scope.getAvaliablePlayers(), 5000);

    }
]);
