'use strict';

import * as GameRoomManager from '../game_room_manager.server.controller';
import {
    min_players, max_players
}
from '../game_room.server.controller';
import {
    getIO, q
}
from '../queue.server.controller';
import * as Timers from '../timers.server.controller';

export class Establishing {
    constructor(GameRoom) {
        this.GameRoom = GameRoom;
        console.log('ESTABLISHING', this.GameRoom._id);
        this.name = 'ESTABLISHING';
        this.GameRoom.players = shuffle(this.GameRoom.players);
        this.GameRoom.judge = this.GameRoom.players[0];
        this.GameRoom.winner = null;
        if (this.GameRoom.first_game) {
            this.connectPlayers();
            console.log('connecting players');
            getIO().to(this.GameRoom._id).emit('ESTABLISHED');
        } else {
            this.addWaitingPlayers();
            var x = this.GameRoom.players.shift();
            this.GameRoom.players.push(x);
            this.GameRoom.judge = this.GameRoom.players[0];
            console.log('emmitted establishing');
            getIO().to(this.GameRoom._id).emit('ESTABLISHING', {judge: this.GameRoom.judge.request.user.username, players: this.GameRoom.getPlayerUserNames(), waiting_players: this.GameRoom.getWaitingPlayerUserNames()});
            q.removeAvailableGame(this.GameRoom._id);
        }
        // TODO: Add timer for choosing phrase
        // Timers.countdownFactory(this.GameRoom, 'choose_phrase_time', 'Drawing', 'choosing phrase countdown');
    }

    getName() {
        return this.name;
    }

    connectPlayers() {
        this.GameRoom.players.forEach(function(player) {
            player.join(this.GameRoom._id);
            player.game_room_id = this.GameRoom._id;
        }, this);
    }

    addWaitingPlayers() {
        this.GameRoom.players = this.GameRoom.players.concat(this.GameRoom.waiting_players);
        this.GameRoom.waiting_players = [];
    }

}

export class Drawing {
    constructor(GameRoom) {
        console.log('DRAWING');
        this.name = 'DRAWING';
        this.GameRoom = GameRoom;
        getIO().to(this.GameRoom._id).emit('DRAWING', this.GameRoom.getPhrase());
        Timers.countdownFactory(this.GameRoom, 'drawing_time', 'SelectingWinner', 'drawing countdown');
    }

    getName() {
        return this.name;
    }
}

export class SelectingWinner {
    constructor(GameRoom) {
        console.log('SELECTING_WINNER');
        this.name = 'SELECTING_WINNER';
        this.GameRoom = GameRoom;
        getIO().to(this.GameRoom._id).emit('SELECTING_WINNER');
        if (!this.GameRoom.isFull()) q.addAvailableGame(this.GameRoom._id);
        Timers.countdownFactory(this.GameRoom, 'winner_selection_time', 'Ending', 'selecting winner countdown');
    }

    getName() {
        return this.name;
    }
}

export class Ending {
    constructor(GameRoom) {
        console.log('ENDING');
        this.name = 'ENDING';
        this.GameRoom = GameRoom;
        this.GameRoom.first_game = false;
        getIO().to(this.GameRoom._id).emit('ENDING', this.GameRoom.winner);
        Timers.countdownFactory(this.GameRoom, 'new_game_time', 'Establishing', 'new game countdown');


        // display results
        // save game info to game history schema
        // go to establishing after 15s
    }

    getName() {
        return this.name;
    }
}

export class Terminating {
    constructor(GameRoom) {
        console.log('TERMINATING');
        this.name = 'TERMINATING';
        GameRoomManager.removeGameRoom(GameRoom._id);
    }

    getName() {
        return this.name;
    }
}

/**
Establishing Helpers
*/

// The de-facto unbiased shuffle algorithm is the Fisher-Yates (aka Knuth) Shuffle.
function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
