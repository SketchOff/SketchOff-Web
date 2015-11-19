'use strict';

/*
functions. test as many of these as make sense.

getIO() {
constructor() {
addPlayer(player) {
removePlayer(username) {
numPlayers() {
setState(state) {
getStateName() {
createGame() {
setIO(io) {
addAvailableGame(game_id) {
removeAvailableGame(game_id) {
getPlayerUsernames() {
forEach(function(player) {
getNumPlayers() {
getAvailableGameIds() {
getInfo() {
hasAdminSubscribers() {
updateAdmin() {

*/

import GameRoom from '../../server/controllers/game_room.server.controller';
import {
    max_players, min_players
}
from '../../server/controllers/game_room.server.controller';
import {
    q,
    Queue
}
from '../../server/controllers/queue.server.controller';

import {
    ConnectedPlayers
}
from '../../server/controllers/game_room_manager.server.controller';

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

describe('Queue Functional Tests', function() {
    describe('User Uniqueness Constraint', function() {
        var players = getMockSockets(max_players - 1);
        var que = new Queue();
        it('should not allow players who are the same user', function(done) {
            players.forEach(p => que.addPlayer(p));
            var player_duplicate = new SocketMock();
            player_duplicate.request = players[0].request; // same username, different socket
            duplicateUsernameExists(ConnectedPlayers.keys()).should.be.false;  // jshint ignore:line
            done();
        });
    });

    describe('Users can join public game through queue', function() {
        var players = getMockSockets(max_players-1);
        var que = new Queue();
        it('all players get put in some game', function(done) {
            players.forEach(p => que.addPlayer(p));
            players.every(p => p.game_room_id).should.be.true; // jshint ignore:line
            done();
        });
    });
});

// TODO
// describe('Queue Unit Tests', function() {
//     describe('')
// });

// describe('Queue States. Something wrong here. Ask Dan |||| ', function() {
//     describe('NOT_ENOUGH --> AVAILABLE_GAMES', function() {
//         var players = getMockSockets(max_players - 1); // so game will not be full
//         it('should change state', function() {
//             q.getStateName().should.be.equal('NOT_ENOUGH');
//             players.forEach(p => q.addPlayer(p));
//             var players2 = getMockSockets(1);
//             q.addPlayer(players2[0]);
//             q.getStateName().should.be.equal('AVAILABLE_GAMES');
//         });
//     });
//     describe('AVAILABLE_GAMES --> NOT_ENOUGH', function() {
//         var players = getMockSockets(min_players-1); //insufficient
//         it('should change state', function() {
//             q.getStateName().should.be.equal('AVAILABLE_GAMES');
//             players.forEach(p => q.addPlayer(p));
//             q.getStateName().should.be.equal('NOT_ENOUGH');
//         });
//     });
// });


function duplicateUsernameExists (iter) {
    for(var n1 in iter)
        for (var n2 in iter)
            if( n1 === n2 )
                return true;
    return false;
}
