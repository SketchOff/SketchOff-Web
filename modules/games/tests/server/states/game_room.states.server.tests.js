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

    var mongoose = require('mongoose');
    var User = mongoose.model('User');
    var should = require('should');
    var SocketMock = require('socket-io-mock');
    var socketPort = 3006;
    var socketURL = 'http://0.0.0.0:';
    var ioserver = require('socket.io').listen(socketPort);
    q.setIO(ioserver);

    // var createMockUser = function(user_num) {
    //     // Create user credentials
    //     var credentials = {
    //         username: 'username' + user_num,
    //         password: 'M3@n.jsI$Aw3$0m3'
    //     };

    //     // Create a new user
    //     var user = new User({
    //         firstName: 'Full',
    //         lastName: 'Name' + user_num,
    //         displayName: 'Full Name' + user_num,
    //         email: credentials.username +  '@test.com',
    //         username: credentials.username,
    //         password: credentials.password,
    //         provider: 'local'
    //     });

    //     // Save a user to the test db and create new article
    //     user.save();
    // };

    var getMockSockets = function(num_players) {
        var sockets = [];
        for (var i = 0; i < num_players; i++) {
            // createMockUser(i);
            sockets[i] = new SocketMock();
            sockets[i].request = {
                user: {
                    username: 'username' + i
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

                    it('should not be accepting new players', function(done) {
                        TheGameRoom.isAvailable().should.not.be.exactly(true); // jshint ignore:line
                        done();
                    });

                    it('should not have room_id listed in the queue\'s available games', function(done) {
                        q.getAvailableGameIds().should.not.containEql(TheGameRoom.getRoomID());
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

                    it('should be in DRAWING state after setState(\'Drawing\')', function(done) {
                        TheGameRoom.setState('Establishing');
                        TheGameRoom.setState('Drawing');
                        TheGameRoom.getStateName().should.be.exactly('DRAWING');
                        done();
                    });

                    it('should have the phrase set correctly', function(done) {
                        TheGameRoom.getPhrase().should.be.exactly(test_phrase);
                        done();
                    });

                    it('should not be accepting new players', function(done) {
                        TheGameRoom.isAvailable().should.not.be.exactly(true); // jshint ignore:line
                        done();
                    });

                    it('should not be accepting new players', function(done) {
                        TheGameRoom.isAvailable().should.not.be.exactly(true); // jshint ignore:line
                        done();
                    });

                    it('should not have room_id listed in the queue\'s available games', function(done) {
                        q.getAvailableGameIds().should.not.containEql(TheGameRoom.getRoomID());
                        done();
                    });
                });

                describe('Selecting Winner State', function() {
                    it('should be in the SELECTING_WINNER state after setState(\'SelectingWinner\')', function(done) {
                        TheGameRoom.setState('SelectingWinner');
                        TheGameRoom.getStateName().should.be.exactly('SELECTING_WINNER');
                        done();
                    });

                    it('should not be accepting new players', function(done) {
                        TheGameRoom.isAvailable().should.be.exactly(false); // jshint ignore:line
                        done();
                    });

                    it('should not have room_id listed in the queue\'s available games because game is full', function(done) {
                        q.getAvailableGameIds().should.not.containEql(TheGameRoom.getRoomID());
                        done();
                    });
                });

                describe('Ending State', function() {
                    it('should throw an error if you try to set the judge as winner', function(done) {
                        var judge = TheGameRoom.getJudgeUsername();
                        (function() {
                            TheGameRoom.setWinner(judge);
                        }).should.throw('Cannot set judge as game winner.');
                        done();
                    });

                    it('should be in the ENDING state after a winner is selected', function(done) {
                        var test_winner = players[1].request.user.username;
                        TheGameRoom.setWinner(test_winner);
                        TheGameRoom.getStateName().should.be.exactly('ENDING');
                        done();
                    });
                });
            });
        });
    });
