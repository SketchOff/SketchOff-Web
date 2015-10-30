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
            players_waiting: GameRoom.getWaitingPlayerUserNames(),
            state: GameRoom.getStateName(),
            judge: GameRoom.getJudgeUserName(),
            phrases: GameRoom.getPhrases(), 
            choose_phrase_time: GameRoom.choose_phrase_time,
            drawing_time: GameRoom.drawing_time,
            winner_selection_time: GameRoom.winner_selection_time,
            new_game_time: GameRoom.new_game_time
        });
    });

    socket.on('set phrase', function(msg) {
        var GameRoom = GameRooms.getGameRoom(socket.game_room_id);
        console.log('dis judge chose the following phrase', msg);
        GameRoom.setPhrase(msg);
    });

    socket.on('set winner', function(msg) {
        console.log('winner selected:', msg);
        var GameRoom = GameRooms.getGameRoom(socket.game_room_id);
        GameRoom.setWinner(msg);
        GameRoom.setState('Ending');
    });

    
}
