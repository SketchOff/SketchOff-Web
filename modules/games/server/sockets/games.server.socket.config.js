'use strict';

import * as GameSocket from '../helper_classes/game_socket.server.js';
import Queue as Queue from '../controllers/queue.server.controller.js';

// Player connect to game, if game state is establishing
// Wait until all players connect before changing the games state to start

// Create the game socket.io configuration
export default function(io, socket) {

    socket.on('join public game', function() {
        console.log(socket.request.user.username);
        // send to queue WITH io and socket to pass around
    });
}
