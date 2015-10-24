'use strict';

// No Available Games and not enough players to create a new game
export class NotEnough {
	constructor(queue) {
		this.queue = queue;
	}

	addPlayer(player) {
		this.queue.players.push(player);
		if (this.queue.numPlayers() > 3) {
			this.queue.setState('ENOUGH');
		}
	}
}

// No Available Games, but enough players to create a new game
export class Enough {
	constructor(queue) {
		this.queue = queue;
	}
}

export class AvailableGames {
    constructor(queue){
        this.queue = queue;
    }
    addPlayer(player) {
        
    }
}
