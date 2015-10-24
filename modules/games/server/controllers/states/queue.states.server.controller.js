'use strict';

// No Available Games and not enough players to create a new game
export class NotEnough {
	constructor(queue) {
		this.queue = queue;
	}

	addPlayer(player) {
		this.queue.players.push(player);
		console.log('number of players in queue', this.queue.numPlayers());
	}
}

// No Available Games, but enough players to create a new game
export class Enough {

}

export class AvailableGames {
    constructor(queue){
        this.queue = queue;
    }
    addPlayer(player) {
        let ps = this.queue.players;
        let gs = this.queue.availableGames;
    }
}
