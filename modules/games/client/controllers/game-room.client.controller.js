'use strict';

// Games controller
angular.module('games').controller('GameRoomController', ['$rootScope', '$scope', 'Authentication', 'Socket', '$state', '$window',
    function($rootScope, $scope, Authentication, Socket, $state, $window) {

        $scope.authentication = Authentication;
        $scope.GameRoom = {};
        $scope.playerVars = {
            toolSize: 5,
            toolColor: "#000000",
            activeTool: 0
        };

        // UndoStates
        // [RECENT ITEM, 2nD RECENT ITEM .... LAST ITEM]
        $scope.clientImageStates = {
            canvas: null,
            uStates: [],
            rStates: [],
            cState: null
        };

        $scope.virtualCanvases = {
            vc: null
        };

        $scope.MAX_UNDO_STATES = 10;
        $scope.GameRoom.chat_messages = [];

        var is_judge = false;
        var set_winner = false;

        var getGameInfo = function() {
            Socket.emit('get game info');
        };
        getGameInfo();

        /* START Socket Event Functions */

        var gameInfoResponse = function(msg) {
            console.log('game info response', msg);
            for (var key in msg) {
                $scope.GameRoom[key] = msg[key];
            }
            if ($scope.GameRoom.judge === $scope.authentication.user.username) is_judge = true;
        };

        // var setPhrases = function(msg) {
        //     $scope.GameRoom.phrases = msg;
        // };

        var establish = function(msg) {
            console.log(msg);
            $scope.GameRoom.state = 'ESTABLISHING';
            $scope.GameRoom.judge = msg.judge;
            $scope.GameRoom.players = msg.players;
            $scope.GameRoom.game_id = msg.game_id;
            $scope.GameRoom.players_minus_judge = msg.players.slice();
            var i = msg.players.indexOf(msg.judge);
            if(i>-1) {
                $scope.GameRoom.players_minus_judge.splice(i, 1);
            }
            $scope.GameRoom.players_minus_judge = $scope.GameRoom.players_minus_judge;
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
            // console.log($scope.GameRoom.players);
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
            $scope.GameRoom.players = msg.players;
            $scope.GameRoom.waiting_players = msg.waiting_players;
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
            console.log(msg);
            $scope.GameRoom.players = msg.players;
            $scope.GameRoom.waiting_players = msg.waiting_players;
        };

        var messagesReceived = function(msg) {
            console.log('chat messages', msg);
            $scope.GameRoom.chat_messages = msg;
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

        // Add an event listener to the 'chatMessage' event
        Socket.on('receiving chat messages', messagesReceived);

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
            if ($scope.GameRoom.state !== 'ENDING' && $scope.GameRoom.state !== 'TERMINATING') {
                if (confirm('You will be flagged for leaving the game early') === true) {
                    $state.go('home');
                }
            } else {
                $state.go('home');
            }
        };

        // Create a controller method for sending messages
        $scope.sendMessage = function() {
            // Create a new message object
            var msg = {
                text: this.messageText
            };

            Socket.emit('receiving chat message', msg);

            // Clear the message text
            this.messageText = '';
        };

        /* END Button Functions */

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            if (fromState.name === 'games.room') {
                Socket.emit('leave room');
            }        
        });

        $scope.setTool = function(arg) {
            // console.log("Active tool changed from " + $scope.playerVars.activeTool + " to " + arg);
            $scope.playerVars.activeTool = arg;
        };

        $scope.isActiveTool = function(arg) {
            if($scope.playerVars.activeTool === arg) {
                return {"color":"purple"};
            }
            else {
                return {"color":"black"};
            }
        };

        // Returns style (green = can undo, black = cannot undo)
        $scope.hasUndo = function() {
            if($scope.clientImageStates.uStates.length > 0) {
                return {"color":"green"};
            }
            else {
                return {"color":"black"};
            }
        };

        $scope.hasRedo = function() {
            // Case: cannot redo
            if($scope.clientImageStates.rStates.length > 0) {
                return {"color":"green"};
            }
            else {
                return {"color":"black"};
            }
        };

        $scope.undoClicked = function() {
            // console.log('attempted undo');
            if($scope.hasUndo().color === "green") {
                // console.log('undo successful ' + $scope.clientImageStates.uStates.length -1);
                var img = new Image(640, 480);
                var ctx = $scope.clientImageStates.canvas.getContext('2d');
                img.src = "";
                img.onload = function(e) {
                    ctx.clearRect(0,0,640,480);
                    ctx.drawImage(img,0,0);
                };
                var dt = $scope.clientImageStates.uStates.pop();
                img.src = dt;

                $scope.clientImageStates.rStates.push($scope.clientImageStates.cState);
                $scope.clientImageStates.cState = dt;
            }

            var pkt = {
                sType:'pDiff',
                data: {
                    clientID: $scope.getUserID(),
                    diffTool: 3, 
                    toolData: null
                }
            };

            $scope.broadcastCanvasData(pkt);
        };

        // Remove the event listener when the controller instance is destroyed
        $scope.$on('$destroy', function() {
            Socket.removeListener('game info responding');
            Socket.removeListener('ESTABLISHING');
            Socket.removeListener('DRAWING');
            Socket.removeListener('SELECTING_WINNER');
            Socket.removeListener('ENDING');
            Socket.removeListener('TERMINATING');
            Socket.removeListener('player joining');
            Socket.removeListener('selecting phrase countdown');
            Socket.removeListener('drawing countdown');
            Socket.removeListener('selecting winner countdown');
            Socket.removeListener('starting new game countdown');
            Socket.removeListener('player leaving');
            Socket.removeListener('receiving chat messages');
            Socket.removeListener('CLIENT_P2S_pSync');
            Socket.removeListener('CLIENT_P2S_pDiff');
        });


        $rootScope.$on('$stateChangeStart',
            function(event, toState, toParams, fromState, fromParams) {
                if (fromState.name === 'games.room') {
                    Socket.emit('leave room');
                }
            }
        );

        $scope.redoClicked = function() {
            if($scope.hasRedo().color === "green") {
                // console.log('redo successful ' + $scope.clientImageStates.rStates.length -1);
                var img = new Image(640, 480);
                var ctx = $scope.clientImageStates.canvas.getContext('2d');
                img.src = null;

                img.onload = function() {
                    ctx.clearRect(0,0,640,480);
                    ctx.drawImage(img,0,0);
                };

                var dt = $scope.clientImageStates.rStates.pop();
                img.src = dt;
                
                $scope.clientImageStates.uStates.push($scope.clientImageStates.cState);
                $scope.clientImageStates.cState = dt;
            }

            var pkt = {
                sType:'pDiff',
                data: {
                    clientID: $scope.getUserID(),
                    diffTool: 4, 
                    toolData: null
                }
            };

            $scope.broadcastCanvasData(pkt);
        };        

        $scope.increaseToolSize = function() {
            // console.log("+tool size");
            $scope.playerVars.toolSize++;
            // console.log($scope.playerVars.toolSize-1, $scope.playerVars.toolSize+1);
        };

        $scope.decreaseToolSize = function() {
            $scope.playerVars.toolSize--;
        };

        $scope.colorStyle = function(arg) {
            // console.log(arg)
            return {"background-color":arg};
        };

        $scope.setColor = function(arg) {
            $scope.playerVars.toolColor = arg;
        };

        $scope.iconToName = function(id) {
            return ['Pen','Line','Eraser'][id];
        };

        $scope.getUserID = function() {
            // console.log($scope.authentication.user);
            // console.log();
            // console.log($scope.authentication.user._id);
            return $scope.authentication.user.username;
        };

        $scope.amJudge = function() {
            return is_judge;
        };

        // NOTE: THIS IS NOT AN OFF BY ONE ERROR BECAUSE THE JUDGE IS A PLAYER
        $scope.existPlayer = function(arg) {
            return $scope.GameRoom.players.length > arg;
        };

        $scope.getNumPlayers = function(arg) {
            return $scope.GameRoom.players.length-1;
        };

        // Note off by 1 error, valid arg = 1-> # players
        $scope.getPlayer = function(arg) {
            var temp = [];
            var joff = 0;
            for(var i=0; i< $scope.GameRoom.players.length-1; i++) {
                if($scope.GameRoom.players[i] === $scope.GameRoom.judge) {
                    joff += 1;
                }
                temp[i] = $scope.GameRoom.players[i+joff];
            }

            return temp[arg-1];
        };

        $scope.broadcastCanvasData = function(data) {
            // console.log('canvas data broadcasted');
            // console.log('canvas type =' + data.sType);
            // TODO: b64 encode&decode
            Socket.emit('CLIENT_P2S_'+data.sType, data.data);
            // console.log("socket emitted: " + 'CLIENT_P2S_'+data.sType); 
        };
    }
]);