'use strict';

import {
    getIO
}
from './queue.server.controller';

export var countdownFactory = function(GameRoom, time, NextState, emit_msg) {
	var time_left = time;
    GameRoom.interval = setInterval(function() {
    	getIO().to(GameRoom.getRoomID()).emit(emit_msg, time_left);
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
