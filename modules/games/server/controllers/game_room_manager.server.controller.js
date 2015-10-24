'use strict';

import GameRoom from './game_room.server.controller.js';

var GameRooms = new Map();

// Create a new game room and add it to the GameRooms map
export function createGameRoom(players, public_game) {
    var game_room_id = generateID();
    GameRooms.set(game_room_id, new GameRoom(players, public_game, game_room_id));
    console.log(GameRooms);
}

// remove a GameRoom from the GameRooms map
export function removeGameRoom(game_room_id) {
	GameRooms.delete(game_room_id);
}

// exports.createGameRoom([1, 2, 3, 4, 5, 6], true);
// setInterval(function() {
//     for (var value of GameRooms.values()) {
//         console.log(value);
//         value.playerExits(value.players[0]);
//     }
//     if (GameRooms.size === 0) console.log('EMPTY');
// }, 1000);

/**
Helper Functions
*/

// Generate id based on epoch node ns time for the game_room
function generateID() {
    // current time
    var now = new Date();
    // nanoseconds since arbitrary time
    var ns = process.hrtime()[1].toString();
    // number of milliseconds since 1970, divide by 1,000,000 and floor for smaller number 
    var epoch = now.valueOf().toString();
    // combine epoch with ns to be safe and avoid collisions 
    var id = epoch + ns;

    return id;
}
