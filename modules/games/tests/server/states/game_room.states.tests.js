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

    describe('Game Room States Tests', function() {
        // initialize a game room

        describe('A. Public Game Room: Max Number of Player', function() {
            var TheGameRoom, players;

            it('A1. Should be able to create a game room with max number of players', function(done) {
            	players = getMockSockets(max_players);
            	TheGameRoom = new GameRoom(players, true, 'randomly_generated_id');
            	TheGameRoom.getNumPlayers().should.be.exactly(max_players);
                console.log('statename = ',TheGameRoom.getStateName());
            	done();
            });

            it('A2. Should be in the ESTABLISHING state after GameRoom initialization', function(done) {
                TheGameRoom.getStateName().should.be.exactly('ESTABLISHING');
                done();
            }); 

            it('A3. Should have a game_room_id property equal to the room\'s ID for every socket', function(done) {
                for (let socket of players) {
                    socket.game_room_id.should.be.exactly('randomly_generated_id');
                }
                done();
            });
        });
    });
