'use strict';

// Player: { id: someid, socket: theirsocket, io: theirio, user: associateduser }

import {min_players, max_players} from './game_room.server.controller';
import * as QueueStates from './states/queue.states.server.controller';
import * as GameRoomManager from './game_room_manager.server.controller';

class Queue {
    constructor() {
        this.players = [];
        this.availableGames = [];
        this.state = new QueueStates.NotEnough(this);
    }

    addPlayer(player) {
        this.state.addPlayer(player);
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
    }

    createGame() {
        var gamePlayers = this.players.slice(0, max_players);
        if (gamePlayers.length >= min_players) {
            GameRoomManager.createGameRoom(gamePlayers, true);
        } else {
            this.queue.setState('NOT_ENOUGH');
        }
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
