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

    describe('Game Room States Tests ->', function() {
        var TestingCountdownTimes = {};
        TestingCountdownTimes.choose_phrase = 100;
        TestingCountdownTimes.drawing = 100;
        TestingCountdownTimes.winner_selection = 100;
        TestingCountdownTimes.new_game = 100;

        describe('Public Game Room: Max Number of Player', function() {

            var players = getMockSockets(max_players);
            var TheGameRoom = new GameRoom(players, true, 'randomly_generated_id', TestingCountdownTimes);

            console.log('hlkjhkl', TheGameRoom.getStateName());
            describe('First Game -->', function() {
                describe('ESTABLISHING State', function() {
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

                    it('should be accepting new players', function(done) {
                        TheGameRoom.isAvailable().should.be.true // jshint ignore:line
                        done();
                    });

                });

                describe('Drawing State', function() {
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

                describe('Selecting Winner State', function() {
                    it('should be in the SelectingWinner state after setState(\'SelectingWinner\')', function(done) {
                        TheGameRoom.setState('SelectingWinner');
                        TheGameRoom.getStateName().should.be.exactly('SELECTING_WINNER');
                        done();
                    });
                });
            });
        });
    });
