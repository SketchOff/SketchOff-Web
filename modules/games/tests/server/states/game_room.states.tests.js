'use strict';

import GameRoom from '../../../server/controllers/game_room.server.controller';
import {max_players, min_players} from '../../../server/controllers/game_room.server.controller';
import {
    q
}
from '../../../server/controllers/queue.server.controller';

var should = require('should');
var SocketMock = require('socket-io-mock');
var socketPort = 3006;
var socketURL = 'http://0.0.0.0:';
var ioserver = require('socket.io').listen(socketPort);
q.setIO(ioserver);

var getMockSockets = function(num_players) {
    var sockets = [];
    for (var i = 0; i < num_players; i++) {
        sockets[i] = new SocketMock();
        sockets[i].request = {
            user: {
                username: 'user' + i
            }
        };
    }
    return sockets;
};

describe('Game Room States Tests\n', function() {
    // initialize a game room

    describe('Game Room Constructor Tests\n', function() {
        var TheGameRoom, players;

        it('Should be able to create a game room with max number of players', function(done) {
        	players = getMockSockets(max_players);
        	TheGameRoom = new GameRoom(players, true, 'randomly_generated_id');
        	TheGameRoom.getNumPlayers().should.be.exactly(max_players);
        	done();
        });
    });
});
