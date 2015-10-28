'use strict';

import {q} from '../controllers/queue.server.controller';

var setSocket = false;
// Create the game socket.io configuration
export default function(io, socket) {
	if (!setSocket) {
		setSocket = true;
		q.setIO(io);
	}

    socket.on('join public game', function() {
        console.log(socket.request.user.username, 'clicked join public game');
        // TODO: Check if a user is already playing a game before adding them to the queue
        q.addPlayer(socket);
    });

    socket.on('game info', function() {
    	console.log(socket.request.user.username, 'is requesting game info');
    });
}
