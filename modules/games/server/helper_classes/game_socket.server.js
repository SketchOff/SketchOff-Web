'use strict';

export class GameSocket {
    // each player has a socket
    // var players;
    // var roomName;
    // var recvdCallback;
    // var setPhraseCallback;
    // var judge;
    constructor(io, roomName, players, judge, recvdCallback, setPhraseCallback) {
        this.players = players;
        this.roomName = roomName;
        this.recvdCallback = recvdCallback;
        this.setPhraseCallback = setPhraseCallback;
        this.judge = judge;
        this.io = io;
        //////// auto routing

        // player diffs sent to judge as they happen
        // stupid?
        this.io.of("/players")
            .on('canvas diff', function(data) { // from some player
                judge.socket.emit('diff incoming!', data);
            });

        // judge sets phrase
        this.io.of("/players")
            .on('phrase chosen', function(obj) {
                let phrase = obj.phrase;
                this.setPhraseCallback(phrase);
                this.emitToEveryone('phrase chosen', {phrase: phrase});
            });
    }
    emitToEveryone(event, obj) {
        this.players.forEach(function(p) {
            p.socket.emit(event, obj);
        });
    }

    emitToPlayer(player, obj) {
        player.socket.emit('general emission', obj);
    }

    kickPlayer(player) {
        player.socket.emit('disconnect please');
        player.socket.leave(this.roomName);
    }


}
