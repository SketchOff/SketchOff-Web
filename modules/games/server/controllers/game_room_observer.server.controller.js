'use strict';

var PublicGameRoom = require('./game_rooms.server.controller.js').PublicGameRoom;

var newPGR = new PublicGameRoom([1,2,3]);

newPGR.on('hello', function(msg) {
	console.log(msg);
});

newPGR.startGame();