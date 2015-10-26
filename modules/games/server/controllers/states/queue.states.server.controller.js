'use strict';

import {
    min_players, max_players
}
from '../game_room.server.controller';

// No Available Games and not enough players to create a new game
export class NotEnough {
    constructor(queue) {
        this.name = 'NOT_ENOUGH';
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
        this.name = 'ENOUGH';
        this.queue = queue;
        while (this.queue.numPlayers() >= min_players) {
        	console.log('number of players in queue before creating game =', this.queue.numPlayers());
            this.queue.createGame();
        }
        this.queue.setState('NOT_ENOUGH');
    }

}

export class AvailableGames {
    constructor(queue) {
        this.name = 'AVAILABLE_GAMES';
        this.queue = queue;
    }
    addPlayer(player) {

    }
}
