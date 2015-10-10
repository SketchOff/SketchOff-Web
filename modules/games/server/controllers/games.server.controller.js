// 'use strict';

// // var GameSockets = require(‘GameSockets’);
// var Games = {};
// var id_counter = 0;
// var minPlayers = 3;
// var maxPlayers = 6;

// function PublicGame (players) {
//     this._id = id_counter++;
//     this.players = players;
//     this.gameSocket = new GameSockets.registerPlayers(this.players, this._id, this.playerDisconnects);

//     this.judge = this.setJudge();

//     this.killGame = function() {
//         delete Games[this._id];
//     };

//     // When a player presses leave game
//     this.playerExits = function(playerToRemove) {
//         // Delete player from players array
//         this.players.splice(this.players.indexOf(playerToRemove),1);

//         // If less than min players
//         if (this.players.length < minPlayers) this.killGame();

//         // If less than max players
//         if (this.players.length < maxPlayers) {
//                 this.needsPlayers = true;
//         }

//        gameSockets.kickPlayer(playerToRemove);
//     };
    
//     // When a player disconnects without warning, e.g. closes window
//     this.playerDisconnects = function(playerToRemove) {
//         // Delete player from players array
//         this.players.splice(this.players.indexOf(playerToRemove),1);

//         // If less than min players
//         if (this.players.length < minPlayers) this.killGame();

//         // If less than max players
//         if (this.players.length < maxPlayers) {
//                 this.needsPlayers = true;
//         }
//     };

//     this.selectJudges = function() {
//         this.judge = this.players.pop();
//         this.players = this.players.unshift(this.judge);
//     };

//     this.setWinner = function(winner) {
//         this.winner = winner;
//     };



//     Games[this._id] = this;
// }
