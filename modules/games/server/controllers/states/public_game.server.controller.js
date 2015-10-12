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

export class Starting {
	constructor(GameRoom) {
		console.log('STARTING');
		this.state_name = 'STARTING';
		this.GameRoom = GameRoom;
	}
}

export class Ending {
	constructor(GameRoom) {
		console.log('ENDING');
		this.state_name = 'ENDING';
		this.GameRoom = GameRoom;
	}
}

export class SelectingWinner {
	constructor(GameRoom) {
		console.log('SELECTING_WINNER');
		this.state_name = 'SELECTING_WINNER';
		this.GameRoom = GameRoom;
	}
}

export class DisplayingResults {
	constructor(GameRoom) {
		console.log('DISPLAYING_RESULTS');
		this.state_name = 'DISPLAYING_RESULTS';
		this.GameRoom = GameRoom;
	}
}

export class Terminating {
	constructor(GameRoom) {
		console.log('TERMINATING');
		this.state_name = 'TERMINATING';
		this.GameRoom = GameRoom;
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
