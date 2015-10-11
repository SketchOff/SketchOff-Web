'use strict';

import GameRoom from './game_room.server.controller.js';

export var GameRooms = new Map();

exports.createGame = function () {
	new GameRoom([1,2,3,4,5,6], true);
};

exports.createGame();
