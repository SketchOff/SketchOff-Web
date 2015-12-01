'use strict';

import * as prof from '../controllers/profile.server.controller';


// Create the game socket.io configuration
export default function(io, socket) {

    socket.on('send friend request', function(profileId) {
        prof.friendRequest(String(profileId), String(socket.request.user._id), io);
    });

    socket.on('init profile page', function(profileId) {
        prof.initProfile(String(profileId), String(socket.request.user._id), io);
    });
/*
    socket.on('get player name', function(profileId) {
    	prof.getDisplayUser(profileId, function(displayName, userName) {
    		socket.emit('return player name', profileId, displayName, userName);	
    	});
    	
    });

*/

    socket.on('delete friend', function(friend) {
        //do checks?
        if (friend)
            console.log("received socket call: delete friend. friend: " + friend.profileId);
        prof.deleteFriendship(String(friend.profileId), String(socket.request.user._id), io);
    });

    socket.on('reject friend request', function(pendingFriend) {
        if (pendingFriend.profileId)
            prof.deleteFriendRequest(String(pendingFriend.profileId), String(socket.request.user._id), io);
        else
            console.log('profile id not found');
    });

    socket.on('accept friend request', function(pendingFriend) {
    	//check if requesterId is in socket.profile.pendingfriendrequests?
    	if (pendingFriend.profileId)
    		prof.createFriendship(String(pendingFriend.profileId), String(socket.request.user._id));
    	else
    		console.log('profile id not found');
    	//console.log(String(requesterId.profileId), String(socket.request.user._id));
    	
    });



}
