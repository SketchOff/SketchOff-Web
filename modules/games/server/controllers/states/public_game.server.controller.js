'use strict';

import * as GameRooms from '../game_rooms.server.controller';

export class Establishing {
	constructor(GameRoom) {
		console.log('ESTABLISHING');
		this.state_name = 'ESTABLISHING';
		GameRoom.players = shuffle(GameRoom.players);
		GameRoom.judge = GameRoom.players[0];
	}
}

export class Drawing {
	constructor(GameRoom) {
		console.log('DRAWING');
		this.state_name = 'DRAWING';
		this.GameRoom = GameRoom;
	}
}

export class SelectingWinner {
	constructor(GameRoom) {
		console.log('SELECTING_WINNER');
		this.state_name = 'SELECTING_WINNER';

		if (GameRoom.players.length < GameRoom.max_players) {
			// Add game room id to Queue's available games array
		}
	}
}

export class Ending {
	constructor(GameRoom) {
		console.log('ENDING');
		this.state_name = 'ENDING';
	}
}

export class Terminating {
	constructor(GameRoom) {
		console.log('TERMINATING');
		this.state_name = 'TERMINATING';
		GameRooms.removeGameRoom(GameRoom._id);
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
