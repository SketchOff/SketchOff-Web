'use strict';



import GameRoom from '../../server/controllers/game_room.server.controller';
import {
    max_players, min_players
}
from '../../server/controllers/game_room.server.controller';
import {
    q
}
from '../../server/controllers/queue.server.controller';

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

describe('Game Room Functional Tests', function() {
    // initialize a game room
    // var TheGameRoom, players;
    // TheGameRoom = new GameRoom(players, true, 'randomly_generated_id'); // EST
    // var test_phrase = 'some phrase';
    // TheGameRoom.setPhrase(test_phrase); // DRAWING
    // initialize a queue
    describe('User Uniqueness Constraint', function() {
        describe('In Queue', function() {
            var players = getMockSockets(max_players);
            it('should not allow players who are the same user', function(done) {
                players.forEach(p => q.addPlayer(p));
                (function () { q.addPlayer(players[0]); }).should.throw();
                done();
            });
        });
    });

    describe('Users can join public game through queue', function() {
        var players = getMockSockets(max_players-1);
        it('all players get put in some game', function(done) {
            players.forEach(p => q.addPlayer(p));
            players.every(p => p.game_room_id).should.be.true; // jshint ignore:line
            done();
        });
    });

});
