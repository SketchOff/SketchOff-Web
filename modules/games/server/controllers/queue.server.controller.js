'use strict';


import {
    min_players, max_players
}
from './game_room.server.controller';
import * as QueueStates from './states/queue.states.server.controller';
import * as GameRoomManager from './game_room_manager.server.controller';

var _io;

export function getIO() {
    return _io;
}

class Queue {
    constructor() {
        this.players = [];
        this.available_games = [];
        this.state = new QueueStates.NotEnough(this);
    }

    addPlayer(player) { // TODO TEST
        console.log(GameRoomManager.getGameRoomMap().values());
        if(this.players.some(function(p) {
            return p.request.user.username === player.request.user.username;
        }) || isInAGame(player, GameRoomManager)) {
            console.log('player already waiting');
            player.emit('already waiting redirect');

        } else {
            console.log(this.players.map(p => p.request.user.username));
            console.log("adding " + player.request.user.username);
            this.players.push(player);
            this.state.addPlayer();
        }

    }

    numPlayers() {
        return this.players.length;
    }

    setState(state) {
        switch (state) {
            case 'NOT_ENOUGH':
                console.log('q changed states to NOT_ENOUGH');
                this.state = new QueueStates.NotEnough(this);
                break;
            case 'AVAILABLE_GAMES':
                console.log('q changed states to AVAILABLE_GAMES');
                this.state = new QueueStates.AvailableGames(this);
                break;
        }
        console.log(this.getStateName());
    }

    getStateName() {
        return this.state.name;
    }

    createGame() {
        var gamePlayers = this.players.slice(0, max_players);
        if (gamePlayers.length >= min_players) {
            gamePlayers = this.players.splice(0, max_players);
            GameRoomManager.createGameRoom(gamePlayers, true);
        }
    }

    setIO(io) {
        _io = io;
    }

    addAvailableGame(game_id) {
        console.log(game_id, 'added to available games');
        this.available_games.push(game_id);
        if(this.getStateName() !== 'AVAILABLE_GAMES') this.setState('AVAILABLE_GAMES');
    }

    removeAvailableGame(game_id) {
        console.log(game_id, 'removed from available games');
        var available_game_index = this.available_games.indexOf(game_id);
        if (available_game_index > -1) this.available_games.splice(available_game_index, 1);
        if (this.available_games < 1) this.setState('NOT_ENOUGH');
    }

    removePlayer(player) {
        var index = -1;
        for(var i = 0; i < this.players.length; i++) {
            if(this.players[i].request.user.username === player.request.user.username) {
                index = i;
            }
        }
        if(index > -1){
            this.players = this.players.splice(i,1);
        }
    }

    removePlayerBySocket(player) {
        var index = -1;
        for(var i = 0; i < this.players.length; i++) {
            if(this.players[i] === player) {
                index = i;
            }

        }
        if(index > -1){
            this.players = this.players.splice(i,1);
        }
    }

}


function isInAGame(player, manager) {
    var it = manager.getGameRoomMap().values();
    var result = false;
    for(var g of it) {
        if (g.getPlayerUserNames().some(n => player.request.user.username === n)) {
            result = true;
            break;
        }
    }
    return result;
}

export var q = new Queue();


// export function addPlayer(player) {
//     // add player to queue
//     queue.push(player);

//     // available game rooms, start filling
//     var count = 0;
//     while (availableGameRooms.length) {
//              var CurrRoom = availableGameRooms[count];

//         // remove game room if its not in selecting winner or ending state or is full
//         if (CurrRoom.getStateName() !== 'SELECTING_WINNER' || CurrRoom.getStateName() !== 'ENDING' || CurrRoom.isFull) {
//              availableGameRooms.splice(count, 1);
//         }
//         // add player to game room
//         else {
//             availableGameRooms[count].addPlayer(queue.pop());
//         }
//         count++;
//     }

//     // if queue has enough players,
//     if (queue.length >= min_players) {

//     }
// }
