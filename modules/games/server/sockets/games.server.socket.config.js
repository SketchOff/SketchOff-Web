'use strict';

import {q} from '../controllers/queue.server.controller';

// Create the game socket.io configuration
export default function(io, socket) {

	// Player requests to join a public game
    socket.on('join public game', function() {
        console.log(socket.request.user.username, 'clicked join public game');
        // TODO: Check if a user is already playing a game before adding them to the queue
        q.addPlayer(socket);
    });
}
