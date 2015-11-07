 'use strict';

 import {
     q
 }
 from '../controllers/queue.server.controller';
 import * as GameRoomManager from '../controllers/game_room_manager.server.controller';

 var setSocket = false;

 // Create the game socket.io configuration
 export default function(io, socket) {

     if (!setSocket) {
         setSocket = true;
         q.setIO(io);
     }

     console.log(socket.request.user.username, 'connected');
     GameRoomManager.ConnectedPlayers.set(socket.request.user.username, {
         in_queue: false,
         in_game: false,
         in_lobby: false,
         socket_id: socket.id
     });

     socket.on('join public game', function() {
         var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(socket.request.user.username);

         if (ConnectedPlayer.in_queue) {
            socket.emit('already in queue');
         } else if (ConnectedPlayer.in_game) {
            socket.emit('already in game');
         } else {
             q.addPlayer(socket);

             ConnectedPlayer.in_queue = true;
             GameRoomManager.ConnectedPlayers.set(socket.request.user.username, ConnectedPlayer);
         }
     });

     socket.on('get game info', function() {
         var GameRoom = GameRoomManager.getGameRoom(socket.game_room_id);
         socket.emit('game info responding', {
             _id: GameRoom._id,
             players: GameRoom.getPlayerUserNames(),
             waiting_players: GameRoom.getWaitingPlayerUserNames(),
             state: GameRoom.getStateName(),
             judge: GameRoom.getJudgeUserName(),
             phrases: GameRoom.getPhrases()
         });

         for (let username of GameRoom.getPlayerUserNames()) {
             var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(socket.request.user.username);
             ConnectedPlayer.in_queue = false;
             ConnectedPlayer.in_game = true;
             GameRoomManager.ConnectedPlayers.set(socket.request.user.username, ConnectedPlayer);
         }
     });

     socket.on('set phrase', function(msg) {
         var GameRoom = GameRoomManager.getGameRoom(socket.game_room_id);
         GameRoom.setPhrase(msg);
     });

     socket.on('set winner', function(msg) {
         var GameRoom = GameRoomManager.getGameRoom(socket.game_room_id);
         GameRoom.setWinner(msg);
         GameRoom.setState('Ending');
     });

     socket.on('leave room', function() {
         if (socket.game_room_id) {
             var GameRoom = GameRoomManager.getGameRoom(socket.game_room_id);
             GameRoom.removePlayer(socket);

             var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(socket.request.user.username);
             ConnectedPlayer.in_game = false;
             GameRoomManager.ConnectedPlayers.set(socket.request.user.username, ConnectedPlayer);
         }
     });

     socket.on('admin updates subscribe', function() {
         socket.join('admin_updates');
         socket.emit('initial queue info', q.getInfo());
         socket.emit('initial rooms info', GameRoomManager.getInfo());
     });

     socket.on('disconnect', function() {
         if (socket.request.user.username) {
             console.log(socket.request.user.username, 'has disconnected');
             if (socket.game_room_id) {
                 var GameRoom = GameRoomManager.getGameRoom(socket.game_room_id);
                 GameRoom.removePlayer(socket);
             }

             GameRoomManager.ConnectedPlayers.delete(socket.request.user.username);
         }
     });
 }
