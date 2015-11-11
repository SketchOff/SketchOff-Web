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
        var TestingCountdownTimes = {};
        TestingCountdownTimes.choose_phrase = 1;
        TestingCountdownTimes.drawing = 1;
        TestingCountdownTimes.winner_selection = 1;
        TestingCountdownTimes.new_game = 1;

        // TODO: Move instantiation errors to game_room.server.tests
        describe('Public Game Room: Max Number of Player', function() {
            var players = getMockSockets(max_players);
            var TheGameRoom = new GameRoom(players, true, 'randomly_generated_id', TestingCountdownTimes);

            describe('Instantiation Errors', function() {
                var TempCountdownTimes = TestingCountdownTimes;

                // TODO: Move each test into its own it blocks
                it('should not be able to create a game with incorrect or missing arguments', function(done) {
                    (function() {
                        new GameRoom(players, true, 'randomly_generated_id');
                    }).should.throw('Missing arguments');

                    (function() {
                        new GameRoom('string', true, 'randomly_generated_id', TempCountdownTimes);
                    }).should.throw('Players param is not an array');

                    (function() {
                        new GameRoom([1,2,3], true, 'randomly_generated_id', TempCountdownTimes);
                    }).should.throw('Players array contains non-object values');

                    (function() {
                        new GameRoom([], true, 'randomly_generated_id', TempCountdownTimes);
                    }).should.throw('Too few players');

                    (function() {
                        new GameRoom([players[0]], true, 'randomly_generated_id', TempCountdownTimes);
                    }).should.throw('Too few players');

                    (function() {
                        new GameRoom(players.concat([players[0]]), true, 'randomly_generated_id', TempCountdownTimes);
                    }).should.throw('Too many players');

                    (function() {
                        new GameRoom(players, 'string', 'randomly_generated_id', TempCountdownTimes);
                    }).should.throw('is_public_room param must be a boolean');

                    (function() {
                        new GameRoom(players, true, 1234, TempCountdownTimes);
                    }).should.throw('game_id param must be a string');

                    (function() {
                        new GameRoom(players, true, 'randomly_generated_id', 'string');
                    }).should.throw('CountdownTimes param must be an object');

                    delete TempCountdownTimes.new_game;
                    (function() {
                        new GameRoom(players, true, 'randomly_generated_id', TempCountdownTimes);
                    }).should.throw('Missing necessary countdown properties for the CountdownTimes param');

                    TempCountdownTimes.new_game = 1;
                    TempCountdownTimes.unnecessary_property = 1;
                    (function() {
                        new GameRoom(players, true, 'randomly_generated_id', TempCountdownTimes);
                    }).should.throw('Unnecessary properties in CountdownTimes param');

                    delete TempCountdownTimes.unnecessary_property;
                    TempCountdownTimes.new_game = 'string';
                    (function() {
                        new GameRoom(players, true, 'randomly_generated_id', TempCountdownTimes);
                    }).should.throw('All countdown values must be numbers');

                    TempCountdownTimes.new_game = -1;
                    (function() {
                        new GameRoom(players, true, 'randomly_generated_id', TempCountdownTimes);
                    }).should.throw('Countdown values cant be less than 0');

                    TempCountdownTimes.new_game = 1;

                    done();
                });
            });

            describe('First Game: ESTABLISHING State', function() {

                it('should have correct values for CountdownTimes', function(done) {
                    TheGameRoom.getCountdownTimes().should.be.eql(TestingCountdownTimes);
                    done();
                });

                it('should have max number of players', function(done) {
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

                it('should be accepting new players', function(done) {
                    TheGameRoom.isAvailable().should.be.true // jshint ignore:line
                    done();
                });

                it('should not have a phrase set', function(done) {
                    TheGameRoom.getPhrase().should.be.exactly('Not chosen yet');
                    done();
                });
            });

            describe('First Game: Drawing State', function() {
                var test_phrase = 'some phrase';
                it('should change states after phrase selection', function(done) {
                    TheGameRoom.setPhrase(test_phrase);
                    TheGameRoom.getStateName().should.be.exactly('DRAWING');
                    done();
                });

                it('should have the phrase set correctly', function(done) {
                    TheGameRoom.getPhrase().should.be.exactly(test_phrase);
                    done();
                });

                it('should not be accepting new players', function(done) {
                    TheGameRoom.isAvailable().should.not.be.true; // jshint ignore:line
                    done();
                });
            });
        });
    });
