'use strict';

import {
    getIO
}
from './queue.server.controller';

export var countdownFactory = function(GameRoom, time, NextState, emit_msg) {
	var time_left = GameRoom[time];
    var interval = setInterval(function() {
    	getIO().to(GameRoom._id).emit(emit_msg, time_left);
    	decrementTime();
        if (time === 'winner_selection_time' && GameRoom.winner !== null) clearInterval(this);
    	if (time_left < 0) {
    		clearInterval(this);
            GameRoom.setState(NextState);
    	}
    }, 1000);

    function decrementTime() {
        time_left--;
    }
};


