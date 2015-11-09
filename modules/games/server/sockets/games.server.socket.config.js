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

     if (!GameRoomManager.ConnectedPlayers.has(socket.request.user.username)) {
         GameRoomManager.ConnectedPlayers.set(socket.request.user.username, {
             in_queue: false,
             in_game: false,
             in_lobby: false,
             num_connections: 1,
             socket_id: socket.id
         });
     } else {
         var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(socket.request.user.username);
         ConnectedPlayer.num_connections++;
     }
     console.log(socket.request.user.username, 'connected');


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
             players: GameRoom.getPlayerUsernames(),
             waiting_players: GameRoom.getWaitingPlayerUsernames(),
             state: GameRoom.getStateName(),
             judge: GameRoom.getJudgeUsername(),
             phrases: GameRoom.getPhrases()
         });

         for (let username of GameRoom.getPlayerUsernames()) {
             var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(username);
             ConnectedPlayer.in_queue = false;
             ConnectedPlayer.in_game = true;
             GameRoomManager.ConnectedPlayers.set(username, ConnectedPlayer);
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

     socket.on('leave queue', function() {
         console.log(socket.request.user.username, 'has left the queue');
         q.removePlayer(socket.request.user.username);

         var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(socket.request.user.username);
         ConnectedPlayer.in_queue = false;
         GameRoomManager.ConnectedPlayers.set(socket.request.user.username, ConnectedPlayer);
     });

     socket.on('admin updates subscribe', function() {
         socket.join('admin_updates');
         socket.emit('initial queue info', q.getInfo());
         socket.emit('initial rooms info', GameRoomManager.getInfo());
     });

     socket.on('disconnect', function() {
         var GameRoom;

         if (socket.request.user.username) {
             console.log(socket.request.user.username, 'has disconnected');

             var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(socket.request.user.username);

             if (ConnectedPlayer && ConnectedPlayer.num_connections === 1) {
                 console.log('only connection for user');
                 if (ConnectedPlayer && ConnectedPlayer.in_queue) {
                     q.removePlayer(socket.request.user.username);
                 }

                 if (socket.game_room_id) {
                     GameRoom = GameRoomManager.getGameRoom(socket.game_room_id);
                     GameRoom.removePlayer(socket);
                 }
                 GameRoomManager.ConnectedPlayers.delete(socket.request.user.username);
             } else {
                 ConnectedPlayer.num_connections--;
                 if (socket.active_user) {
                     console.log('multiple connections but this was the active one');
                     if (ConnectedPlayer && ConnectedPlayer.in_queue) {
                         q.removePlayer(socket.request.user.username);
                     }

                     if (socket.game_room_id) {
                         GameRoom = GameRoomManager.getGameRoom(socket.game_room_id);
                         GameRoom.removePlayer(socket);
                     }
                 }
             }
         }
     });
 }
