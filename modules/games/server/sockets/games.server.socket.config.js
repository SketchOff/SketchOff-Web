'use strict';

// Player connect to game, if game state is establishing
// Wait until all players connect before changing the games state to start


// Create the game socket.io configuration
export default function(io, socket) {

	// Player requests to join a public game
    socket.on('join public game', function() {
        console.log(socket.request.user.username);
        // add player to queue
    });
}
