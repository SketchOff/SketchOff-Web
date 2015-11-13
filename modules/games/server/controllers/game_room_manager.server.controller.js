'use strict';

import GameRoom from './game_room.server.controller.js';

var GameRooms = new Map();
var DefaultCountdownTimes ={};
DefaultCountdownTimes.choose_phrase = 5;
DefaultCountdownTimes.drawing = 5;
DefaultCountdownTimes.winner_selection = 5;
DefaultCountdownTimes.new_game = 5;

export var ConnectedPlayers = new Map();

// Create a new game room and add it to the GameRooms map
export function createGameRoom(players, public_game, CountdownTimes) {
    var game_room_id = generateID();
    if (!CountdownTimes) CountdownTimes = DefaultCountdownTimes;
    GameRooms.set(game_room_id, new GameRoom(players, public_game, game_room_id, CountdownTimes));
}

// remove a GameRoom from the GameRooms map
export function removeGameRoom(game_room_id) {
    var Room = GameRooms.get(game_room_id);
    Room.disconnectAllPlayers();
    GameRooms.delete(game_room_id);
}

export function getGameRoom(game_room_id) {
    return GameRooms.get(game_room_id);
}

export function getInfo() {
    var RoomsInfo = {};
    GameRooms.forEach(function(GameRoom, id) {
        RoomsInfo[id] = GameRoom.getRoomInfo();
    });
    return RoomsInfo;
}

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
