'use strict';

import {GameRooms} from '../game_rooms.server.controller';

export class Establishing {
	constructor(GameRoom) {
		console.log('ESTABLISHING');
		this.GameRoom = GameRoom;
	}
}

export class Starting {
	constructor(GameRoom) {
		console.log('STARTING');
		this.GameRoom = GameRoom;
	}
}

export class Ending {
	constructor(GameRoom) {
		console.log('ENDING');
		this.GameRoom = GameRoom;
	}
}

export class SelectingWinner {
	constructor(GameRoom) {
		console.log('SELECTING_WINNER');
		this.GameRoom = GameRoom;
	}
}

export class DisplayingResults {
	constructor(GameRoom) {
		console.log('DISPLAYING_RESULTS');
		this.GameRoom = GameRoom;
	}
}