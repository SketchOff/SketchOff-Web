'use strict';

import {min_players, max_players} from './game_room.server.controller';

var queue = [];

export function addPlayer(player) {
	// add player to queue
	queue.push(player);
}