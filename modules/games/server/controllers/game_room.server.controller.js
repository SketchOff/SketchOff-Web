'use strict';

import * as PublicGameStates from './states/public_game.states.server.controller';
import * as PrivateGameStates from './states/private_game.states.server.controller';
import {
    getIO, q
}
from './queue.server.controller';
import * as Timers from './timers.server.controller';

// Set min and max players
export var min_players = 2;
export var max_players = 7;

export default class GameRoom {

    constructor(players, is_public_room, game_id) {
        // Set players prop, return error if not array
        if (Array.isArray(players)) this.players = players;
        else throw 'Attempted to create game without correct players param';
        // Set the game_id generated from the game_rooms controller
        this._id = game_id;
        this.is_public = is_public_room;
        // Is game public, if not then game is private
        this.RoomStates = is_public_room ? PublicGameStates : PrivateGameStates;
        // Set to true if judge leaves
        this.first_game = true;
        this.available = true;
        this.waiting_players = [];
        this.choose_phrase_time = 5;
        this.drawing_time = 5;
        this.winner_selection_time = 5;
        this.new_game_time = 5;
        this.winner = null;
        this.State = new this.RoomStates.Establishing(this);
        if (this.hasAdminSubscribers()) getIO().to('admin_updates').emit('room update', [this.getRoomId(), this.getInfo()]);
    }

    getRoomType() {
        if (this.is_public) return 'public';
        return 'private';
    }

    setState(State, reason) {
        console.log(this._id, 'is changing states to', State);
        Timers.cancelCurrCountdown();
        this.State = new this.RoomStates[State](this, reason);
        if (this.hasAdminSubscribers()) {
            if (State === 'Terminating') getIO().to('admin_updates').emit('room termination', this.getRoomId());
            else getIO().to('admin_updates').emit('room update', [this.getRoomId(), this.getInfo()]);
        }
    }

    getStateName() {
        return this.State.getName();
    }

    isFull() {
        var num = this.players.length + this.waiting_players.length;
        return num === max_players;
    }

    // Add a player to the game
    addPlayer(player) {
        var index = getRandomIntInclusive(0, this.players.length - 1);
        this.players.splice(index, 0, player);
    }

    addWaitingPlayer(player) {
        player.join(this._id);
        player.game_room_id = this._id;
        this.waiting_players.push(player);
        getIO().to(this._id).emit('player joined', this.getWaitingPlayerUserNames());
        if (this.hasAdminSubscribers()) getIO().to('admin_updates').emit('room update', [this.getRoomId(), this.getInfo()]);
    }

    getPlayerUserNames() {
        var player_names = [];
        this.players.forEach(function(player) {
            player_names.push(player.request.user.username);
        });
        return player_names;
    }

    getWaitingPlayerUserNames() {
        var waiting_player_names = [];
        this.waiting_players.forEach(function(player) {
            waiting_player_names.push(player.request.user.username);
        });
        return waiting_player_names;
    }

    getJudgeUserName() {
        return this.judge.request.user.username;
    }

    getJudge() {
        return this.judge;
    }

    getRoomId() {
        return this._id;
    }

    getPhrases() {
        var phrases = ['pregnant pencils', 'tall people', 'smelly clothes', 'pesty pelicans'];
        return phrases;
    }

    setPhrase(phrase) {
        this.phrase = phrase;
        this.setState('Drawing');
    }

    getPhrase() {
        if (this.phrase) return this.phrase;
        return 'Not chosen yet';
    }

    getNumPlayers() {
        return this.players.length;
    }

    getNumAllPlayers() {
        return this.players.length + this.waiting_players;
    }

    noWinner() {
        this.winner = null;
    }

    setWinner(winner) {
        this.winner = winner;
    }

    getWinner() {
        if (this.getStateName() !== 'ENDING') return 'No winner yet';
        if (this.winner) return this.winner;
        return 'No winner';
    }

    isAvailable() {
        return this.available;
    }

    // TODO: If the game needs to be re-established, let players know the reason
    // TODO: Flag player for leaving mid game
    removePlayer(player) {

        if (this.players.indexOf(player) > -1) {
            this.players.splice(this.players.indexOf(player), 1);
        } else {
            this.waiting_players.splice(this.waiting_players.indexOf(player), 1);
        }
        player.leave(this._id);
        delete player.game_room_id;
        
        if (this.getNumAllPlayers() < min_players) {
            console.log('Terminating because not enough total players');
            this.setState('Terminating');
        } else if (this.getNumPlayers() < min_players) {
            console.log('not enough playing player but enough total players');
            this.setState('Ending', 'Not enough active players to continue.');
        } else {
            if (player.request.user.username.localeCompare(this.judge.request.username)) {
                console.log('judge left, restablishing game');
                // getIO().to(this._id).emit('judge left');
                this.setState('Ending', 'The judge left the game.');
            } else {
                console.log('player left but doesnt effect game play');
                getIO().to(this._id).emit('player left', {
                    players: this.getPlayerUserNames(),
                    waiting_players: this.getWaitingPlayerUserNames()
                });
            }
            if (this.hasAdminSubscribers()) getIO().to('admin_updates').emit('room update', [this.getRoomId(), this.getInfo()]);
        }
    }

    getInfo() {
        var RoomInfo = {};
        RoomInfo.room_type = this.getRoomType();
        RoomInfo.state = this.getStateName();
        RoomInfo.players = this.getPlayerUserNames();
        RoomInfo.waiting_players = this.getWaitingPlayerUserNames();
        RoomInfo.judge = this.getJudgeUserName();
        RoomInfo.phrase = this.getPhrase();
        RoomInfo.winner = this.getWinner();
        return RoomInfo;
    }

    hasAdminSubscribers() {
        return (!!getIO().sockets.adapter.rooms.admin_updates);
    }

    disconnectAllPlayers() {
        this.waiting_players.forEach(function(player) {
            player.leave(this._id);
            delete player.game_room_id;
        }, this);
        this.players.forEach(function(player) {
            player.leave(this._id);
            delete player.game_room_id;
        }, this);
    }
}

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
