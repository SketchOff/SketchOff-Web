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
            state: GameRoom.getStateName(),
            judge: GameRoom.getJudgeUserName(),
            phrases: GameRoom.getPhrases()
        });
    });

    socket.on('set phrase', function(msg) {
        var GameRoom = GameRooms.getGameRoom(socket.game_room_id);
        console.log('dis nigga chose the following phrase', msg);
        GameRoom.setPhrase(msg);
    });

    socket.on('drawing times up', function() {
        var GameRoom = GameRooms.getGameRoom(socket.game_room_id);
        GameRoom.finished_drawing_players.push(socket.request.user.username);
        if (GameRoom.allPlayersFinishedDrawing()) {
            console.log('ALL PLAYERS TIME ENDED... SWITCH STATE');
            GameRoom.setState('SelectingWinner');
        }
    });

    socket.on('set winner', function(msg) {
        console.log('winner selected:', msg);
        var GameRoom = GameRooms.getGameRoom(socket.game_room_id);
        GameRoom.setWinner(msg);
        GameRoom.setState('Ending');
    });

    socket.on('selecting winner times up', function() {
        console.log('selecting winner times up');
        var GameRoom = GameRooms.getGameRoom(socket.game_room_id);
        GameRoom.noWinner();
        GameRoom.setState('Ending');
    });

    socket.on('start new game', function() {
        var GameRoom = GameRooms.getGameRoom(socket.game_room_id);
        GameRoom.ready_for_new_game_players.push(socket.request.user.username);
        if (GameRoom.everyoneIsReadyForNewGame()) {
            console.log('ALL PLAYERS READY FOR NEW GAME... RESTARTING');
            GameRoom.setState('Establishing');
        }
    });
}
