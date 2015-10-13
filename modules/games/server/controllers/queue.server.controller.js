'use strict';

import {
    min_players, max_players
}
from './game_room.server.controller';

var queue = [];
var availableGameRooms = [];

export function addPlayer(player) {
    // add player to queue
    queue.push(player);

    // available game rooms and players, start filling
    var count = 0;
    while (availableGameRooms.length && queue.length) {
		var CurrRoom = availableGameRooms[count];
        
        // remove game room if its not in selecting winner or ending state or is full
        if (CurrRoom.getStateName() !== 'SELECTING_WINNER' || CurrRoom.getStateName() !== 'ENDING' || CurrRoom.isFull) {
        	availableGameRooms.splice(count, 1);
        } else {
            // fill game room until full and then remove
            while (!CurrRoom.isFull) {
                availableGameRooms[count].addPlayer(queue.pop());
            }
        	availableGameRooms.splice(count, 1);
        }
        count++;
    }
    
    // if queue has enough players, 
    if (queue.length >= min_players) {

    }
}
