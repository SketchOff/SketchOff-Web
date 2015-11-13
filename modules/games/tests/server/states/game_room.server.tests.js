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

    describe('Game Room Tests', function() {
        var TestingCountdownTimes = {};
        TestingCountdownTimes.choose_phrase = 1;
        TestingCountdownTimes.drawing = 1;
        TestingCountdownTimes.winner_selection = 1;
        TestingCountdownTimes.new_game = 1;
        var players = getMockSockets(max_players);
        // var TheGameRoom = new GameRoom(players, true, 'randomly_generated_id', TestingCountdownTimes);


        describe('Timer Tests: Public Game', function() {
            it('public game it should start in establishing state', function(done) {
                done();
            });
        });

        describe('Public Game Instantiation', function() {
            TestingCountdownTimes.choose_phrase = 100;
            TestingCountdownTimes.drawing = 100;
            TestingCountdownTimes.winner_selection = 100;
            TestingCountdownTimes.new_game = 100;
            players = getMockSockets(max_players);
            var TheGameRoom = new GameRoom(players, true, 'randomly_generated_id', TestingCountdownTimes);


            describe('Instantiation Errors', function() {
                // TODO: Move each test into its own it blocks
                it('should not be able to create a game with incorrect or missing arguments', function(done) {
                    (function() {
                        new GameRoom(players, true, 'randomly_generated_id');
                    }).should.throw('Missing arguments');
                    done();
                });

                it('should not be able to create a game room with a non array value for players', function(done) {
                    (function() {
                        new GameRoom('string', true, 'randomly_generated_id', TestingCountdownTimes);
                    }).should.throw('Players param is not an array');
                    done();
                });

                it('should not be able to create a game room with non-objects in the players param', function(done) {
                    (function() {
                        new GameRoom([1, 2, 3], true, 'randomly_generated_id', TestingCountdownTimes);
                    }).should.throw('Players array contains non-object values');
                    done();
                });

                it('should not be able to create a game room with no players in the players array param', function(done) {
                    (function() {
                        new GameRoom([], true, 'randomly_generated_id', TestingCountdownTimes);
                    }).should.throw('Too few players');
                    done();
                });

                it('should not be able to create a game room with 1 less than min_players', function(done) {
                    (function() {
                        var temp_players = [];
                        for (var i = 0; i < min_players - 1; i++) temp_players.push(players[i]);
                        new GameRoom(temp_players, true, 'randomly_generated_id', TestingCountdownTimes);
                    }).should.throw('Too few players');
                    done();
                });

                it('should not be able to create a game with 1 more than max players', function(done) {
                    (function() {
                        new GameRoom(players.concat([players[0]]), true, 'randomly_generated_id', TestingCountdownTimes);
                    }).should.throw('Too many players');
                    done();
                });

                it('should not be able to create a game with a non-boolean value for the is_public_room param', function(done) {
                    (function() {
                        new GameRoom(players, 'string', 'randomly_generated_id', TestingCountdownTimes);
                    }).should.throw('is_public_room param must be a boolean');
                    done();
                });

                it('should not be able to create a goame room with a non-string value for the room_id param', function(done) {
                    (function() {
                        new GameRoom(players, true, 1234, TestingCountdownTimes);
                    }).should.throw('room_id param must be a string');
                    done();
                });

                it('should not be able to create a game room with a non object for the CountdownTimes param', function(done) {
                    (function() {
                        new GameRoom(players, true, 'randomly_generated_id', 'string');
                    }).should.throw('CountdownTimes param must be an object');
                    done();
                });

                it('should not be able to create a game with a CountdownTimes param object thats missing a property', function(done) {
                    delete TestingCountdownTimes.new_game;
                    (function() {
                        new GameRoom(players, true, 'randomly_generated_id', TestingCountdownTimes);
                    }).should.throw('Missing necessary countdown properties for the CountdownTimes param');
                    TestingCountdownTimes.new_game = 100;
                    done();
                });

                it('should not be able to create a game room with an extra unnecessary property on the CountdownTimes object', function(done) {
                    TestingCountdownTimes.unnecessary_property = 1;
                    (function() {
                        new GameRoom(players, true, 'randomly_generated_id', TestingCountdownTimes);
                    }).should.throw('Unnecessary properties in CountdownTimes param');
                    delete TestingCountdownTimes.unnecessary_property;
                    done();
                });

                it('should not be able to create a game with a CountdownTimes object that has a non-number value in one of its properties', function(done) {
                    TestingCountdownTimes.new_game = 'string';
                    (function() {
                        new GameRoom(players, true, 'randomly_generated_id', TestingCountdownTimes);
                    }).should.throw('All countdown values must be numbers');
                    TestingCountdownTimes.new_game = 100;
                    done();
                });

                it('should not be able to create a game room with a value less than 0 in one of its CountdownTimes properties', function(done) {
                    TestingCountdownTimes.new_game = -1;
                    (function() {
                        new GameRoom(players, true, 'randomly_generated_id', TestingCountdownTimes);
                    }).should.throw('Countdown values cant be less than 0');
                    TestingCountdownTimes.new_game = 100;
                    done();
                });
            });

            it('should have correct values for CountdownTimes', function(done) {
                TheGameRoom.getCountdownTimes().should.be.eql(TestingCountdownTimes);
                done();
            });

            it('countdown getters should return correct values', function(done) {
                TheGameRoom.getPhraseSelectionTime().should.be.exactly(TestingCountdownTimes.choose_phrase);
                TheGameRoom.getDrawingTime().should.be.exactly(TestingCountdownTimes.drawing);
                TheGameRoom.getWinnerSelectionTime().should.be.exactly(TestingCountdownTimes.winner_selection);
                TheGameRoom.getNewGameTime().should.be.exactly(TestingCountdownTimes.new_game);
                done();
            });

            it('should have max number of players', function(done) {
                TheGameRoom.getRoomID().should.be.exactly('randomly_generated_id');
                TheGameRoom.getNumPlayers().should.be.exactly(max_players);
                TheGameRoom.isFull().should.be.exactly(true); // jshint ignore:line
                done();
            });

            it('should be the first game', function(done) {
                TheGameRoom.isFirstGame().should.be.exactly(true); // jshint ignore:line
                done();
            });

            it('should correctly set the room id', function(done) {
                TheGameRoom.getRoomID().should.be.exactly('randomly_generated_id');
                done();
            });

            it('should correctly set the game id', function(done) {
                TheGameRoom.getGameID().should.be.exactly('randomly_generated_id#1');
                done();
            });

            it('should be a public game', function(done) {
                TheGameRoom.isPublic().should.be.exactly(true); // jshint ignore:line
                TheGameRoom.getRoomType().should.be.exactly('public');
                done();
            });

            it('should not have a phrase set', function(done) {
                TheGameRoom.getPhrase().should.be.exactly('Not chosen yet');
                done();
            });
        });
    });
