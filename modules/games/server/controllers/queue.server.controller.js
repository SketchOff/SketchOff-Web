'use strict';


import {min_players, max_players} from './game_room.server.controller';
import * as QueueStates from './states/queue.states.server.controller';
import * as GameRoomManager from './game_room_manager.server.controller';

var _io;

export function getIO() {
    return _io;
}

class Queue {
    constructor() {
        this.players = [];
        this.availableGames = [];
        this.state = new QueueStates.NotEnough(this);
    }

    addPlayer(player) {
        // check if already in
        // if in. emit to socket
        if(this.players.some(function(p) { return p.request.user.username === player.request.user.username; })) {
            console.log('player already in game');
            console.log(this.players);
            player.emit('already in game redirect');

        } else {
            console.log(this.players.map(p => p.request.user.username));
            console.log("adding " + player.request.user.username);
            this.state.addPlayer(player);
        }

    }

    numPlayers() {
        return this.players.length;
    }

    setState(state) {
        switch (state) {
            case 'ENOUGH':
                this.state = new QueueStates.Enough(this);
                break;
            case 'NOT_ENOUGH':
                this.state = new QueueStates.NotEnough(this);
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
        } else {
            this.queue.setState('NOT_ENOUGH');
        }
    }

    setIO(io) {
        _io = io;
    }
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
