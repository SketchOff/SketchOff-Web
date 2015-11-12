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
    describe('User Uniqueness Constraint  -- [[NOTE thowing error until function is written to get all users in all games]]', function() {
        var players = getMockSockets(max_players);
        it('should not allow players who are the same user', function(done) {
            players.forEach(p => q.addPlayer(p));
            var player_duplicate = new SocketMock();
            player_duplicate.request = players[0].request;
            duplicateUsernameExists(q.getPlayerUsernames()).should.be.false;  // jshint ignore:line
            // see description
            true.should.be.false;  // jshint ignore:line
            //                done();
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

describe('Queue States. Something wrong here. Ask Dan |||| ', function() {
    describe('NOT_ENOUGH --> AVAILABLE_GAMES', function() {
        var players = getMockSockets(max_players - 1); // so game will not be full
        it('should change state', function() {
            q.getStateName().should.be.equal('NOT_ENOUGH');
            players.forEach(p => q.addPlayer(p));
            q.getStateName().should.be.equal('AVAILABLE_GAMES');
            var players2 = getMockSockets(1);
            q.addPlayer(players2[0]);
        });
    });
    describe('AVAILABLE_GAMES --> NOT_ENOUGH', function() {
        var players = getMockSockets(min_players-1); //insufficient
        it('should change state', function() {
            q.getStateName().should.be.equal('AVAILABLE_GAMES');
            players.forEach(p => q.addPlayer(p));
            q.getStateName().should.be.equal('NOT_ENOUGH');
        });
    });
});


function duplicateUsernameExists (usns) {
    var counts = [];
    for (var i = 0; i<= usns.length; i++) {
        for (var j = 0; j<= usns.length; j++) {
            if (i !== j && usns[i] === usns[j]) {
                return true;
            }
        }
    }
    return false;
}
