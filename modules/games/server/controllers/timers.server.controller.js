'use strict';

import {
    getIO
}
from './queue.server.controller';

export var countdownFactory = function(GameRoom, time, NextState, emit_msg) {
    var start = process.hrtime();
    var time_left = time;
    getIO().to(GameRoom.getRoomID()).emit(emit_msg, time_left);

    GameRoom.interval = setInterval(function() {
        decrementTime();
        getIO().to(GameRoom.getRoomID()).emit(emit_msg, time_left);
        if (time_left < 0) {
            clearInterval(this);
            GameRoom.setState(NextState);
        }
    }, 1000);

    function decrementTime() {
        time_left--;
    }
};
