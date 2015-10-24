'use strict';

// todo better names

export class NotEnough {

}

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
