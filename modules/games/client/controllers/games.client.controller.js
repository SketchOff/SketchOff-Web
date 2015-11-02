'use strict';

// Games controller
angular.module('games').controller('GamesController', ['$rootScope', '$scope', 'Authentication', 'Socket', '$state',
    function($rootScope, $scope, Authentication, Socket, $state) {

        $scope.authentication = Authentication;
        $scope.GameRoom = {};

        var is_judge = false;
        var set_winner = false;
        var pressed_leave_room = false;

        var getGameInfo = function() {
            Socket.emit('get game info');
        };
        getGameInfo();

        Socket.on('game info response', function(msg) {
            for (var key in msg) {
                $scope.GameRoom[key] = msg[key];
            }
            if ($scope.GameRoom.judge === $scope.authentication.user.username) is_judge = true;
        });

        Socket.on('set phrases', function(msg) {
            $scope.GameRoom.phrases = msg;
        });

        Socket.on('ESTABLISHING', function(msg) {
            $scope.GameRoom.state = 'ESTABLISHING';
            $scope.GameRoom.phrase = undefined;
            $scope.GameRoom.winner = undefined;
            $scope.GameRoom.judge = msg.judge;
            $scope.GameRoom.players = msg.players;
            $scope.GameRoom.waiting_players = msg.waiting_players;
            $scope.GameRoom.drawing_countdown = undefined;
            $scope.GameRoom.winner_selection_countdown = undefined;
            $scope.GameRoom.new_game_countdown = undefined;
            $scope.GameRoom.early_end_reason = undefined;
            $scope.GameRoom.judge_didnt_pick = undefined;
            // TODO: Give judge a countdown to select phrase, otherwise kick judge
        });

        Socket.on('DRAWING', function(msg) {
            $scope.GameRoom.state = 'DRAWING';
            $scope.GameRoom.phrase = msg;
        });

        Socket.on('SELECTING_WINNER', function() {
            $scope.GameRoom.state = 'SELECTING_WINNER';
        });

        Socket.on('ENDING', function(msg) {
            $scope.GameRoom.state = 'ENDING';
            console.log(msg.winner);
            $scope.GameRoom.winner = msg.winner;
            if (msg.reason) {
                $scope.GameRoom.early_end_reason = msg.reason;
            } 
            if (msg.judge_didnt_pick) {
                $scope.GameRoom.judge_didnt_pick = true;
            }
        });

        Socket.on('TERMINATING', function() {
            $state.go('games.terminated');
        });

        Socket.on('player joined', function(msg) {
            $scope.GameRoom.waiting_players = msg;
        });

        Socket.on('drawing countdown', function(msg) {
            $scope.GameRoom.drawing_countdown = msg;
        });

        Socket.on('selecting winner countdown', function(msg) {
            $scope.GameRoom.winner_selection_countdown = msg;
        });

        Socket.on('new game countdown', function(msg) {
            $scope.GameRoom.new_game_countdown = msg;
        });

        Socket.on('player left', function(msg) {
            $scope.GameRoom.players = msg.players;
            $scope.GameRoom.waiting_players = msg.waiting_players;
        });

        Socket.on('judge left', function(msg) {
            $scope.GameRoom.players = msg.players;
            $scope.GameRoom.waiting_players = msg.waiting_players;
        });

        $scope.setPhrase = function(phrase) {
            Socket.emit('set phrase', phrase);
        };

        $scope.setWinner = function(winner) {
            set_winner = true;
            Socket.emit('set winner', winner);
        };

        $scope.leaveGameRoom = function() {
            Socket.emit('leave room');
            pressed_leave_room = true;
            $state.go('home');
        };

        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams) {
                if (fromState.name === 'games.room' && !pressed_leave_room) {
                    Socket.emit('leave room');
                }
            });

    }

]);
