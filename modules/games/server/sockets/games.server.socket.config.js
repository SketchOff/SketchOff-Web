'use strict';

// Player connect to game, if game state is establishing
// Wait until all players connect before changing the games state to start
import {q} from '../controllers/queue.server.controller';

// Create the game socket.io configuration
export default function(io, socket) {

    socket.on('join public game', function() {
        console.log(socket.request.user.username, 'clicked join public game');
        // TODO: Check if a user is already playing a game before adding them to the queue
        q.addPlayer(socket);
    });
}
