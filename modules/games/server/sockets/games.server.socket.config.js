'use strict';

import {q} from '../controllers/queue.server.controller';
import * as GameRooms from '../controllers/game_room_manager.server.controller';

var setSocket = false;
// Create the game socket.io configuration
export default function(io, socket) {
	if (!setSocket) {
		setSocket = true;
		q.setIO(io);
	}

    socket.on('join public game', function() {
        // TODO: Check if a user is already playing a game before adding them to the queue
        q.addPlayer(socket);
    });

    socket.on('get game info', function() {
    	var GameRoom = GameRooms.getGameRoom(socket.game_room_id);
    	socket.emit('game info response', {_id: GameRoom._id, players: GameRoom.getPlayerUserNames().join(', '), state: GameRoom.getStateName()});
    });
}
