'use strict';

import * as prof from '../controllers/profile.server.controller';

// Create the game socket.io configuration
export default function(io, socket) {

    socket.on('send friend request', function(profileId) {
        prof.friendRequest(String(profileId), String(socket.request.user._id));
    });

/*
    socket.on('get player name', function(profileId) {
    	prof.getDisplayUser(profileId, function(displayName, userName) {
    		socket.emit('return player name', profileId, displayName, userName);	
    	});
    	
    });

*/
    socket.on('accept friend request', function(requesterId) {
    	//check if requesterId is in socket.profile.pendingfriendrequests?
    	if (requesterId.profileId)
    		prof.createFriends(String(requesterId.profileId), String(socket.request.user._id));
    	else
    		console.log('profile id not found');
    	//console.log(String(requesterId.profileId), String(socket.request.user._id));
    	
    });



}
