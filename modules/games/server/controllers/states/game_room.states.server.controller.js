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

export class Lobby {
    constructor(GameRoom){
	console.log('made it to lobby');
	this.GameRoom = GameRoom;
	this.name = 'LOBBY';
	this.connectPlayers();
    }

    connectPlayers() {
        this.GameRoom.players.forEach(function(player) {
            player.join(this.GameRoom.getRoomID());
            player.game_room_id = this.GameRoom.getRoomID();
     	    var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(player.request.user.username);
      	    if (ConnectedPlayer) {
          	  ConnectedPlayer.in_queue = false;
           	 ConnectedPlayer.in_game = true;
            }
        }, this);
	console.log(this.GameRoom.getPlayerUsernames());

    }

    getName(){
        return this.name;
    }
}

export class Establishing {
    constructor(GameRoom) {
        this.GameRoom = GameRoom;
        this.name = 'ESTABLISHING';
        this.GameRoom.players = shuffle(this.GameRoom.players);
        this.GameRoom.judge = this.GameRoom.players[0];
        this.GameRoom.winner = 'No winner yet';
        if (this.GameRoom.isFirstGame()) {
            this.connectPlayers();
            getIO().to(this.GameRoom.getRoomID()).emit('ESTABLISHED');
        } else {
            this.GameRoom.incrementGameID();
            this.addWaitingPlayers();
            var x = this.GameRoom.players.shift();
            this.GameRoom.players.push(x);
            this.GameRoom.judge = this.GameRoom.players[0];
            getIO().to(this.GameRoom.getRoomID()).emit('ESTABLISHING', this.GameRoom.getRoomInfo());
            if (this.GameRoom.isPublic()) {
                this.available = false;
                q.removeAvailableGame(this.GameRoom.getRoomID());
            }
        }
        this.GameRoom.countdownFactory(this.GameRoom.getPhraseSelectionTime(), 'Ending', 'selecting phrase countdown');
    }

    getName() {
        return this.name;
    }

    connectPlayers() {
        this.GameRoom.players.forEach(function(player) {
            player.join(this.GameRoom.getRoomID());
            player.game_room_id = this.GameRoom.getRoomID();

            var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(player.request.user.username);

            if (ConnectedPlayer) {
                ConnectedPlayer.in_queue = false;
                ConnectedPlayer.in_game = true;
            }
            GameRoomManager.ConnectedPlayers.set(player.request.user.username, ConnectedPlayer);
            this.GameRoom.addMessage({
                type: 'status',
                text: 'is now connected',
                created: Date.now(),
                profileImageURL: player.request.user.profileImageURL,
                username: player.request.user.username
            });
        }, this);
    }

    addWaitingPlayers() {
        this.GameRoom.players = this.GameRoom.players.concat(this.GameRoom.waiting_players);
        this.GameRoom.waiting_players = [];
    }

}

export class Drawing {
    constructor(GameRoom) {
        this.name = 'DRAWING';
        this.GameRoom = GameRoom;
        getIO().to(this.GameRoom.getRoomID()).emit('DRAWING', this.GameRoom.getPhrase());
        this.GameRoom.countdownFactory(this.GameRoom.getDrawingTime(), 'SelectingWinner', 'drawing countdown');
    }

    getName() {
        return this.name;
    }
}

export class SelectingWinner {
    constructor(GameRoom) {
        this.name = 'SELECTING_WINNER';
        this.GameRoom = GameRoom;

        if (!this.GameRoom.isFull() && this.GameRoom.isPublic()) {
            this.available = true;
            q.addAvailableGame(this.GameRoom.getRoomID());
        }

        getIO().to(this.GameRoom.getRoomID()).emit('SELECTING_WINNER');
        if (!this.GameRoom.isFull() && this.GameRoom.isPublic()) q.addAvailableGame(this.GameRoom.getRoomID());
        this.GameRoom.countdownFactory(this.GameRoom.getWinnerSelectionTime(), 'Ending', 'selecting winner countdown');
    }

    getName() {
        return this.name;
    }
}

export class Ending {
    constructor(GameRoom, reason) {
        var message = {};
        this.name = 'ENDING';
        this.GameRoom = GameRoom;

        if (!this.GameRoom.isAvailable() && !this.GameRoom.isFull() && this.GameRoom.isPublic()) {
            this.available = true;
            q.addAvailableGame(this.GameRoom.getRoomID());
        }

        if (this.GameRoom.winner.localeCompare('No winner yet') === 0) {
            this.GameRoom.noWinner();
            if (!reason) {
                message.judge_didnt_pick = true;
                // TODO: kick and flag judge
            }
        }

        if (reason) {
            message.reason = reason;
        }
        message.winner = this.GameRoom.getWinner();
        getIO().to(this.GameRoom.getRoomID()).emit('ENDING', message);
        this.GameRoom.countdownFactory(this.GameRoom.getNewGameTime(), 'Establishing', 'starting new game countdown');
        this.GameRoom.saveGame(reason);
        this.GameRoom.awardPoints();

        if (this.GameRoom.isFirstGame()) this.GameRoom.first_game = false;

    }

    getName() {
        return this.name;
    }
}

export class Terminating {
    constructor(GameRoom) {
        this.GameRoom = GameRoom;
        this.name = 'TERMINATING';
        getIO().to(this.GameRoom.getRoomID()).emit('TERMINATING');
        if (this.GameRoom.isPublic())
            q.removeAvailableGame(this.GameRoom.getRoomID());
        GameRoomManager.removeGameRoom(this.GameRoom.getRoomID());
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
