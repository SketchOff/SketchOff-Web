'use strict';

import GameRoom from './game_room.server.controller.js';

var GameRooms = new Map();

exports.createGame = function(players, public_game) {
	var game_id = generateID();
    GameRooms.set(game_id, new GameRoom(players, public_game, game_id));
};

exports.createGame([1, 2, 3, 4, 5, 6], true);

/**
Helper Functions
*/

// Generate id based on epoch for the game_room
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
