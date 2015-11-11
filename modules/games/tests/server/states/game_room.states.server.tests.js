    'use strict';

    import GameRoom from '../../../server/controllers/game_room.server.controller';
    import {
        max_players, min_players
    }
    from '../../../server/controllers/game_room.server.controller';
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

    describe('Game Room States Tests', function() {
        // initialize a game room

        describe('Public Game Room: Max Number of Player', function() {
            var TheGameRoom, players;

            describe('First Game: Instantiation and Establishing State', function() {
                it('should not be able to create a game with incorrect or missing arguments', function(done) {
                    (function() {
                        new GameRoom(players, true);
                    }).should.throw();
                    (function() {
                        new GameRoom('string', true, 'randomly_generated_id');
                    }).should.throw();
                    (function() {
                        new GameRoom([], true, 'randomly_generated_id');
                    }).should.throw();
                    (function() {
                        new GameRoom([players[0]], true, 'randomly_generated_id');
                    }).should.throw();
                    (function() {
                        new GameRoom(players[0].concat(players), true, 'randomly_generated_id');
                    }).should.throw();
                    (function() {
                        new GameRoom(players, 'string', 'randomly_generated_id');
                    }).should.throw();
                    done();
                });

                it('should be able to create a game room with max number of players', function(done) {
                    players = getMockSockets(max_players);
                    TheGameRoom = new GameRoom(players, true, 'randomly_generated_id');
                    TheGameRoom.getRoomID().should.be.exactly('randomly_generated_id');
                    TheGameRoom.getNumPlayers().should.be.exactly(max_players);
                    TheGameRoom.isFull().should.be.true; // jshint ignore:line
                    done();
                });

                it('should be the first game', function(done) {
                    TheGameRoom.isFirstGame().should.be.true // jshint ignore:line
                    done();
                });

                it('should be in the ESTABLISHING state after GameRoom initialization', function(done) {
                    TheGameRoom.getStateName().should.be.exactly('ESTABLISHING');
                    done();
                });

                it('should have a game_room_id property equal to the room\'s ID for every socket', function(done) {
                    for (let socket of players) {
                        socket.game_room_id.should.be.exactly('randomly_generated_id');
                    }
                    done();
                });

                it('should not have a winner yet', function(done) {
                    TheGameRoom.getWinner().should.be.exactly('No winner yet');
                    done();
                });

                it('the judge should be the first player to join the room', function(done) {
                    var first_player = players[0].request.user.username;
                    var judge = TheGameRoom.getJudgeUsername();
                    first_player.should.be.exactly(judge);
                    done();
                });

                it('should be a public game', function(done) {
                    TheGameRoom.isPublic().should.be.true; // jshint ignore:line
                    TheGameRoom.getRoomType().should.be.exactly('public');
                    done();
                });

                it('should not be accepting new players', function(done) {
                    TheGameRoom.isAvailable().should.be.true // jshint ignore:line
                    done();
                });
            });
        });
    });
