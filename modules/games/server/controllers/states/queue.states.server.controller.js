'use strict';

import {min_players, max_players} from '../game_room.server.controller';

// No Available Games and not enough players to create a new game
export class NotEnough {
	constructor(queue) {
		this.queue = queue;
	}

	addPlayer(player) {
		this.queue.players.push(player);
		if (this.queue.numPlayers() >= min_players) {
			this.queue.setState('ENOUGH');
		}
	}
}

// No Available Games, but enough players to create a new game
export class Enough {
	constructor(queue) {
		this.queue = queue;
		this.queue.createGame();
	}

}

export class AvailableGames {
    constructor(queue){
        this.queue = queue;
    }
    addPlayer(player) {
        
    }
}
