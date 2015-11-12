'use strict';

import {
    getIO
}
from './queue.server.controller';

export var countdownFactory = function(GameRoom, time, NextState, emit_msg) {
	var time_left = GameRoom[time];
    GameRoom.interval = setInterval(function() {
    	getIO().to(GameRoom._id).emit(emit_msg, time_left);
    	decrementTime();
    	if (time_left < 0) {
    		clearInterval(this);
            GameRoom.setState(NextState);
    	}
    }, 1000);

    function decrementTime() {
        time_left--;
    }
};
