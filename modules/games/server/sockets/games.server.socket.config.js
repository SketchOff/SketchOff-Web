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

    socket.on('join private lobby', function(msg) {
	   //ADDING THE PLAYER ISNT WORKING I DONT KNOW WHY
	   var GameRoom = GameRoomManager.getGameRoom(msg[0]);
           GameRoom.addPlayer(socket);
	   console.log(GameRoom.players[0].rooms);
	   console.log(GameRoom.players[1].rooms);
	   io.to(msg[1]).emit('joined private lobby');
       	   io.to(GameRoom.getRoomID()).emit('update lobby info', GameRoom.getLobbyInfo());
	});


    socket.on('start private game', function(){
        console.log('start private game');
        var GameRoom = GameRoomManager.getGameRoom(socket.game_room_id);
        GameRoom.startPrivateGame();
        io.to(GameRoom.getRoomID()).emit('go private game');
    });


     socket.on('create private game', function() {
         var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(socket.request.user.username);
	 console.log('creating private game');
         if (ConnectedPlayer.in_queue) {
            socket.emit('already in queue');
	    //remove from queue?
         } else if (ConnectedPlayer.in_game) {
            socket.emit('already in game');
	    //remove from game?
         } else {
	     GameRoomManager.createGameRoom([socket], false);
	     ConnectedPlayer.in_game = true;
         }
     });

     socket.on('get all avaliable players', function(){	
	 var avaliablePlayers = {};
	 GameRoomManager.ConnectedPlayers.forEach(function(val, key){if( !val.in_game && !val.in_queue){avaliablePlayers[key]=val;}});
	 socket.emit('avaliable players responding', avaliablePlayers);
     });
    

     socket.on('invite player', function(msg){
     var invite_socket_id = msg;
	 io.to(msg).emit('invite notification', [socket.game_room_id, socket.request.user.username, invite_socket_id]); 
     });


     socket.on('get game info', function() {
         console.log(socket.request.user.username, 'is requesting info for', socket.game_room_id);
         var GameRoom = GameRoomManager.getGameRoom(socket.game_room_id);
         socket.emit('game info responding', GameRoom.getGameInfo());

         for (let username of GameRoom.getPlayerUsernames()) {
             var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(username);
             ConnectedPlayer.in_queue = false;
             ConnectedPlayer.in_game = true;
             GameRoomManager.ConnectedPlayers.set(username, ConnectedPlayer);
         }
     });

     socket.on('get lobby info', function(){
          var GameRoom = GameRoomManager.getGameRoom(socket.game_room_id);
	  console.log(socket.game_room_id);
          socket.emit('lobby info responding', {
           lobbyLeader: GameRoom.lobbyLeader,
           max_players: GameRoom.max_players,
           min_players: GameRoom.min_players,
	       _id: GameRoom._id,
	       players: GameRoom.getPlayerUsernames(),
	       state: GameRoom.getStateName()
          });
     });


     socket.on('set phrase', function(msg) {
         var GameRoom = GameRoomManager.getGameRoom(socket.game_room_id);
         GameRoom.setPhrase(msg);
     });

     socket.on('set winner', function(msg) {
         var GameRoom = GameRoomManager.getGameRoom(socket.game_room_id);
         GameRoom.setWinner(msg);
     });

     socket.on('leave room', function() {
         if (socket.game_room_id) {
             var GameRoom = GameRoomManager.getGameRoom(socket.game_room_id);
             GameRoom.removePlayer(socket);

             var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(socket.request.user.username);
             ConnectedPlayer.in_game = false;
             GameRoomManager.ConnectedPlayers.set(socket.request.user.username, ConnectedPlayer);
             if(GameRoom && !GameRoom.isPublic()){
                GameRoom.setLobbyLeader();
                io.to(GameRoom.getRoomID()).emit('update lobby info', GameRoom.getLobbyInfo());
             }
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

     // Send a chat messages to all connected sockets when a message is received
     socket.on('receiving chat message', function(message) {
         var GameRoom = GameRoomManager.getGameRoom(socket.game_room_id);

         message.type = 'message';
         message.created = Date.now();
         message.profileImageURL = socket.request.user.profileImageURL;
         message.username = socket.request.user.username;

         GameRoom.addMessage(message);
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
                     if (GameRoom){
			  GameRoom.removePlayer(socket);
			  if (!GameRoom.isPublic()){
                    		GameRoom.setLobbyLeader();
                    		io.to(GameRoom.getRoomID()).emit('update lobby info', GameRoom.getLobbyInfo());
                	  }
		     }
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
                         if (GameRoom) GameRoom.removePlayer(socket);
                     }
                 }
             }
         }
     });
 }
