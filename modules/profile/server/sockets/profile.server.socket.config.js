'use strict';

import * as prof from '../controllers/profile.server.controller';

// Create the game socket.io configuration
export default function(io, socket) {

	// Player requests to join a public game
    socket.on('send friend request', function(profileId) {
       // console.log(profileId, 'clicked send friend request');
        //console.log(socket.request.user._id, 'clicked send friend request');
        prof.friendRequest(String(profileId), String(socket.request.user._id));

        // TODO: Check if a user is already playing a game before adding them to the queue
        //ProfileServer.sendRequest(socket);
    });

    socket.on('get player name', function(profileId) {
    	prof.getPlayerName(profileId, function(playerName) {
    		socket.emit('return player name', playerName);	
    	});
    	
    });

    socket.on('accept friend request', function(requesterId) {
    	prof.createFriends(String(requesterId), String(socket.request.user._id));
    });



}
