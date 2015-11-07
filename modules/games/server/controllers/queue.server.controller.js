'use strict';


import {
    min_players, max_players
}
from './game_room.server.controller';
import * as QueueStates from './states/queue.states.server.controller';
import * as GameRoomManager from './game_room_manager.server.controller';

var _io;

export function getIO() {
    return _io;
}

class Queue {
    constructor() {
        this.players = [];
        this.available_games = [];
        this.state = new QueueStates.NotEnough(this);
    }

    addPlayer(player) {
        player.active_user = true;
        this.players.push(player);
        this.state.addPlayer();
    }

    removePlayer(username) {
        var index = 0;
        for (let player of this.players) {
            if (player.request.user.username.localeCompare(username) === 0) {
                player.active_user = false;
                var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(player.request.user.username);
                ConnectedPlayer.in_queue = false;
                ConnectedPlayer.in_game = false;
                GameRoomManager.ConnectedPlayers.set(player.request.user.username, ConnectedPlayer);
                
                this.players.splice(index, 1);
                this.updateAdmin();
                break;
            }
            index++;
        }
    }

    numPlayers() {
        return this.players.length;
    }

    setState(state) {
        switch (state) {
            case 'NOT_ENOUGH':
                this.state = new QueueStates.NotEnough(this);
                break;
            case 'AVAILABLE_GAMES':
                this.state = new QueueStates.AvailableGames(this);
                break;
        }
        if (this.hasAdminSubscribers()) _io.to('admin_updates').emit('queue state update', this.getStateName());
    }

    getStateName() {
        return this.state.name;
    }

    createGame() {
        var gamePlayers = this.players.slice(0, max_players);
        if (gamePlayers.length >= min_players) {
            gamePlayers = this.players.splice(0, max_players);
            GameRoomManager.createGameRoom(gamePlayers, true);
        }
    }

    setIO(io) {
        _io = io;
    }

    addAvailableGame(game_id) {
        this.available_games.push(game_id);
        if (this.hasAdminSubscribers()) _io.to('admin_updates').emit('available games update', this.available_games);
        if (this.getStateName() !== 'AVAILABLE_GAMES') this.setState('AVAILABLE_GAMES');
    }

    removeAvailableGame(game_id) {
        var available_game_index = this.available_games.indexOf(game_id);
        if (available_game_index > -1) this.available_games.splice(available_game_index, 1);
        if (this.hasAdminSubscribers()) _io.to('admin_updates').emit('available games update', this.available_games);
        if (this.available_games < 1) this.setState('NOT_ENOUGH');
    }

    getPlayerUsernames() {
        var usernames = [];
        this.players.forEach(function(player) {
            usernames.push(player.request.user.username);
        });
        return usernames;
    }

    getNumPlayers() {
        return this.players.length;
    }

    getAvailableGameIds() {
        return this.available_games;
    }

    getInfo() {
        var queue_info = {};
        queue_info.state = this.getStateName();
        queue_info.players = this.getPlayerUsernames();
        queue_info.available_games = this.getAvailableGameIds();
        return queue_info;
    }

    hasAdminSubscribers() {
        return (!!_io.sockets.adapter.rooms.admin_updates);
    }

    updateAdmin() {
        if (this.hasAdminSubscribers()) _io.to('admin_updates').emit('queue players update', this.getPlayerUsernames());
    }
}

export var q = new Queue();
