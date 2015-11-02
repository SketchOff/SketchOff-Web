'use strict';

import {
    q
}
from '../controllers/queue.server.controller';
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
        socket.emit('game info response', {
            _id: GameRoom._id,
            players: GameRoom.getPlayerUserNames(),
            waiting_players: GameRoom.getWaitingPlayerUserNames(),
            state: GameRoom.getStateName(),
            judge: GameRoom.getJudgeUserName(),
            phrases: GameRoom.getPhrases()
        });
    });

    socket.on('set phrase', function(msg) {
        var GameRoom = GameRooms.getGameRoom(socket.game_room_id);
        GameRoom.setPhrase(msg);
    });

    socket.on('set winner', function(msg) {
        var GameRoom = GameRooms.getGameRoom(socket.game_room_id);
        GameRoom.setWinner(msg);
        GameRoom.setState('Ending');
    });

    socket.on('leave room', function() {
        var GameRoom = GameRooms.getGameRoom(socket.game_room_id);
        GameRoom.removePlayer(socket);
    });

    socket.on('admin updates subscribe', function() {
        socket.join('admin_updates');
        socket.emit('initial queue info', q.getInfo());
        socket.emit('initial rooms info', GameRooms.getInfo());
    });

    socket.on('disconnect', function() {
        if (socket.request.user.username) {
            console.log(socket.request.user.username, 'has disconnected');
            if (socket.game_room_id) {
                var GameRoom = GameRooms.getGameRoom(socket.game_room_id);
                GameRoom.removePlayer(socket);
            }
        }
    });
}
