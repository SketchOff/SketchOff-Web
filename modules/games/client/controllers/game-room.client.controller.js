'use strict';

// Games controller
angular.module('games').controller('GameRoomController', ['$rootScope', '$scope', 'Authentication', 'Socket', '$state',
    function($rootScope, $scope, Authentication, Socket, $state) {

        $scope.authentication = Authentication;
        $scope.GameRoom = {};

        var is_judge = false;
        var set_winner = false;

        var getGameInfo = function() {
            Socket.emit('get game info');
        };
        getGameInfo();

        /* START Socket Event Functions */

        var gameInfoResponse = function(msg) {
            for (var key in msg) {
                $scope.GameRoom[key] = msg[key];
            }
            if ($scope.GameRoom.judge === $scope.authentication.user.username) is_judge = true;
        };

        // var setPhrases = function(msg) {
        //     $scope.GameRoom.phrases = msg;
        // };

        var establish = function(msg) {
            $scope.GameRoom.state = 'ESTABLISHING';
            $scope.GameRoom.judge = msg.judge;
            $scope.GameRoom.players = msg.players;
            $scope.GameRoom.waiting_players = msg.waiting_players;
            $scope.GameRoom.phrase_selection_countdown = undefined;
            $scope.GameRoom.drawing_countdown = undefined;
            $scope.GameRoom.winner_selection_countdown = undefined;
            $scope.GameRoom.new_game_countdown = undefined;
            $scope.GameRoom.early_end_reason = undefined;
            $scope.GameRoom.judge_didnt_pick = undefined;
            $scope.GameRoom.phrase = undefined;
            $scope.GameRoom.winner = undefined;
            // TODO: Give judge a countdown to select phrase, otherwise kick judge
        };

        var draw = function(msg) {
            $scope.GameRoom.state = 'DRAWING';
            $scope.GameRoom.phrase = msg;
        };

        var selectWinner = function(msg) {
            $scope.GameRoom.state = 'SELECTING_WINNER';
        };

        var end = function(msg) {
            $scope.GameRoom.state = 'ENDING';
            $scope.GameRoom.winner = msg.winner;
            if (msg.reason) {
                $scope.GameRoom.early_end_reason = msg.reason;
            }
            if (msg.judge_didnt_pick) {
                $scope.GameRoom.judge_didnt_pick = true;
            }
        };

        var terminate = function(msg) {
            $state.go('games.terminated');
        };

        var playerJoin = function(msg) {
            $scope.GameRoom.waiting_players = msg;
        };

        var selectPhraseCountdown = function(msg) {
            $scope.GameRoom.phrase_selection_countdown = msg;
        };

        var drawCountdown = function(msg) {
            $scope.GameRoom.drawing_countdown = msg;
        };

        var selectWinnerCountdown = function(msg) {
            $scope.GameRoom.winner_selection_countdown = msg;
        };

        var startNewGameCountdown = function(msg) {
            $scope.GameRoom.new_game_countdown = msg;
        };

        var playerLeft = function(msg) {
            $scope.GameRoom.players = msg.players;
            $scope.GameRoom.waiting_players = msg.waiting_players;
        };

        /* END Socket Event Functions */

        /* Socket Event Listeners */
        Socket.on('game info responding', gameInfoResponse);

        // Socket.on('setting phrases', setPhrases);

        Socket.on('ESTABLISHING', establish);

        Socket.on('DRAWING', draw);

        Socket.on('SELECTING_WINNER', selectWinner);

        Socket.on('ENDING', end);

        Socket.on('TERMINATING', terminate);

        Socket.on('player joining', playerJoin);

        Socket.on('selecting phrase countdown', selectPhraseCountdown);

        Socket.on('drawing countdown', drawCountdown);

        Socket.on('selecting winner countdown', selectWinnerCountdown);

        Socket.on('starting new game countdown', startNewGameCountdown);

        Socket.on('player leaving', playerLeft);

        /* END Socket Event Listeners */

        /* START Button Functions */
        $scope.setPhrase = function(phrase) {
            Socket.emit('set phrase', phrase);
        };

        $scope.setWinner = function(winner) {
            set_winner = true;
            Socket.emit('set winner', winner);
        };

        $scope.leaveGameRoom = function() {
            $state.go('home');
        };
        /* END Button Functions */


        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams) {
                if (fromState.name === 'games.room') {
                    Socket.emit('leave room');
                }
            });

    }

]);
