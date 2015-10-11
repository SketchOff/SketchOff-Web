'use strict';

var GameRooms = require('../game_rooms.server.controller');

class GameEstablished {
	constructor(GameRoom) {
		this.GameRoom = GameRoom;
		this.sayHello();
	}

	sayHello() {
		console.log('hello');
	}
}