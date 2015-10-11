'use strict';

var GameRoom = require('./game_room.server.controller').GameRoom;
var GameRooms = new Map();
console.log(GameRoom);

exports.createGame = function () {
	new GameRoom([1,2,3,4,5,6], true);
};

exports.createGame();
