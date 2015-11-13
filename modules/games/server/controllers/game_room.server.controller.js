'use strict';

import * as GameRoomStates from './states/game_room.states.server.controller';
import {
    getIO, q
}
from './queue.server.controller';
import * as GameRoomManager from '../controllers/game_room_manager.server.controller';

var path = require('path'),
    mongoose = require('mongoose'),
    Game = mongoose.model('Game'),
    User = mongoose.model('User'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

// Default game properties
export var min_players = 2;
export var max_players = 7;


export default class GameRoom {

    // TODO: Add points objects to constructor parameter
    // TODO: Create save-id which is game_id + game_num;
    constructor(players, is_public_room, room_id, CountdownTimes) {
        if (arguments.length !== 4) throw new Error('Missing arguments');
        if (!Array.isArray(players)) throw new Error('Players param is not an array');
        players.forEach(function(player) {
            if (typeof player !== 'object') throw new Error('Players array contains non-object values');
        });
        if (is_public_room) {
            if (players.length < min_players) throw new Error('Too few players');
            if (players.length > max_players) throw new Error('Too many players');
        }
        if (typeof is_public_room !== 'boolean') throw new Error('is_public_room param must be a boolean');
        if (typeof room_id === 'undefined') throw new Error('room_id is undefined');
        if (typeof room_id !== 'string') throw new Error('room_id param must be a string');
        if (typeof CountdownTimes !== 'object') throw new Error('CountdownTimes param must be an object');
        if (typeof CountdownTimes.choose_phrase === 'undefined' || typeof CountdownTimes.drawing === 'undefined' || typeof CountdownTimes.winner_selection === 'undefined' || typeof CountdownTimes.new_game === 'undefined') {
            throw new Error('Missing necessary countdown properties for the CountdownTimes param');
        }
        if (Object.keys(CountdownTimes).length !== 4) {
            throw new Error('Unnecessary properties in CountdownTimes param');
        }
        if (typeof CountdownTimes.choose_phrase !== 'number' || typeof CountdownTimes.drawing !== 'number' || typeof CountdownTimes.winner_selection !== 'number' || typeof CountdownTimes.new_game !== 'number') {
            throw new Error('All countdown values must be numbers');
        }
        if (CountdownTimes.choose_phrase < 0 || CountdownTimes.drawing < 0 || CountdownTimes.winner_selection < 0 || CountdownTimes.new_game < 0) {
            throw new Error('Countdown values cant be less than 0');
        }

        this.players = players;
        // Set the room_id generated from the game_rooms controller
        this.room_id = room_id;
        this._id = room_id + '#1';
        this.is_public = is_public_room;
        // Set to true if judge leaves
        this.first_game = true;
        this.available = true;
        this.waiting_players = [];
        this.CountdownTimes = CountdownTimes;
        this.winner = null;
        this.interval = null;
        this.winner_points = 100;
        this.participation_points = 10;
        this.State = new GameRoomStates.Establishing(this);
        if (this.hasAdminSubscribers()) getIO().to('admin_updates').emit('room update', [this.getRoomID(), this.getRoomInfo()]);
    }

    getCountdownTimes() {
        return this.CountdownTimes;
    }

    getPhraseSelectionTime() {
        return this.CountdownTimes.choose_phrase;
    }

    getWinnerSelectionTime() {
        return this.CountdownTimes.winner_selection;
    }

    getDrawingTime() {
        return this.CountdownTimes.drawing;
    }

    getNewGameTime() {
        return this.CountdownTimes.new_game;
    }

    getRoomType() {
        if (this.is_public) return 'public';
        return 'private';
    }

    isPublic() {
        return this.is_public;
    }

    setState(State, reason) {
        console.log(this.room_id, 'is changing states to', State);
        this.cancelCurrCountdown();
        this.State = new GameRoomStates[State](this, reason);
        if (this.hasAdminSubscribers()) {
            if (State === 'Terminating') getIO().to('admin_updates').emit('room termination', this.getRoomID());
            else getIO().to('admin_updates').emit('room update', [this.getRoomID(), this.getRoomInfo()]);
        }
    }

    getStateName() {
        return this.State.getName();
    }

    isFull() {
        var num = this.players.length + this.waiting_players.length;
        return num === max_players;
    }

    addWaitingPlayer(player) {
        var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(player.request.user.username);
        ConnectedPlayer.in_queue = false;
        ConnectedPlayer.in_game = true;
        GameRoomManager.ConnectedPlayers.set(player.request.user.username, ConnectedPlayer);

        player.join(this._id);
        player.game_room_id = this._id;
        this.waiting_players.push(player);
        getIO().to(this._id).emit('player joining', this.getWaitingPlayerUsernames());
        if (this.hasAdminSubscribers()) getIO().to('admin_updates').emit('room update', [this.getRoomID(), this.getRoomInfo()]);
    }

    getPlayerUsernames() {
        var player_names = [];
        this.players.forEach(function(player) {
            player_names.push(player.request.user.username);
        });
        return player_names;
    }

    getPlayerUsers() {
        var player_users = [];
        this.players.forEach(function(player) {
            player_users.push(player.request.user);
        });
        return player_users;
    }

    getWaitingPlayerUsernames() {
        var waiting_player_names = [];
        this.waiting_players.forEach(function(player) {
            waiting_player_names.push(player.request.user.username);
        });
        return waiting_player_names;
    }

    getJudgeUsername() {
        return this.judge.request.user.username;
    }

    getJudgeUser() {
        return this.judge.request.user;
    }

    getJudge() {
        return this.judge;
    }

    getRoomID() {
        return this.room_id;
    }

    getGameID() {
        return this._id;
    }

    incrementGameID() {
        var temp = this._id.split('#');
        var game_num = parseInt(temp[1]);
        game_num++;
        this._id = this.room_id + '#' + game_num;
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
        this.winner = 'No winner';
    }

    hasWinner() {
        return (this.winner && this.winner.localeCompare('No winner') !== 0 && this.winner.localeCompare('No winner yet') !== 0);
    }

    setWinner(winner) {
        this.winner = winner;
    }

    getWinner() {
        return this.winner;
    }

    isAvailable() {
        return this.available;
    }

    isFirstGame() {
        return this.first_game;
    }

    // TODO: Flag player for leaving mid game
    removePlayer(player) {
        console.log('removing', player.request.user.username, 'from', this.getRoomID());
        player.leave(this.getRoomID());
        player.active_user = false;
        var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(player.request.user.username);
        ConnectedPlayer.in_game = false;
        GameRoomManager.ConnectedPlayers.set(player.request.user.username, ConnectedPlayer);

        if (this.players.indexOf(player) > -1) {
            this.players.splice(this.players.indexOf(player), 1);
        } else {
            this.waiting_players.splice(this.waiting_players.indexOf(player), 1);
        }
        delete player.game_room_id;

        if (this.getNumAllPlayers() < min_players) {
            console.log('Terminating because not enough total players');
            this.setState('Terminating');
        } else if (this.getNumPlayers() < min_players) {
            console.log('not enough playing player but enough total players');
            this.setState('Ending', 'Not enough active players to continue.');
        } else {
            if (player.request.user.username.localeCompare(this.judge.request.username) === 0) {
                console.log('The judge left the game.');
                this.setState('Ending', 'The judge left the game.');
            } else {
                console.log('player left but doesnt effect game play');
                getIO().to(this._id).emit('player leaving', {
                    players: this.getPlayerUsernames(),
                    waiting_players: this.getWaitingPlayerUsernames()
                });
            }
            if (this.hasAdminSubscribers()) getIO().to('admin_updates').emit('room update', [this.getRoomID(), this.getRoomInfo()]);
        }
    }

    getRoomInfo() {
        var RoomInfo = {};
        RoomInfo.room_type = this.getRoomType();
        RoomInfo.state = this.getStateName();
        RoomInfo.players = this.getPlayerUsernames();
        RoomInfo.waiting_players = this.getWaitingPlayerUsernames();
        RoomInfo.judge = this.getJudgeUsername();
        RoomInfo.phrase = this.getPhrase();
        RoomInfo.winner = this.getWinner();
        return RoomInfo;
    }

    getGameInfo() {
        var GameInfo = {
            game_id: this.getGameID(),
            players: this.getPlayerUsernames(),
            waiting_players: this.getWaitingPlayerUsernames(),
            state: this.getStateName(),
            judge: this.getJudgeUsername(),
            phrases: this.getPhrases()
        };
        return GameInfo;
    }

    hasAdminSubscribers() {
        return (!!getIO().sockets.adapter.rooms.admin_updates);
    }

    disconnectAllPlayers() {
        this.waiting_players.forEach(function(player) {
            player.leave(this._id);
            delete player.game_room_id;

            player.active_user = false;
            var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(player.request.user.username);
            ConnectedPlayer.in_queue = false;
            ConnectedPlayer.in_game = false;
            GameRoomManager.ConnectedPlayers.set(player.request.user.username, ConnectedPlayer);
        }, this);

        this.players.forEach(function(player) {
            player.leave(this._id);
            delete player.game_room_id;

            player.active_user = false;
            var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(player.request.user.username);
            ConnectedPlayer.in_queue = false;
            ConnectedPlayer.in_game = false;
            GameRoomManager.ConnectedPlayers.set(player.request.user.username, ConnectedPlayer);
        }, this);
    }

    cancelCurrCountdown() {
        clearInterval(this.interval);
    }

    getWinnerUser() {
        var winner_user_object;
        for (var player of this.players) {
            if (player.request.user.username.localeCompare(this.winner) === 0) {
                winner_user_object = player.request.user;
                break;
            }
        }
        return winner_user_object;
    }

    saveGame() {
        var _id = this._id;

        var _game = {
            players: this.getPlayerUsers(),
            judge: this.getJudgeUser(),
            winner: this.getWinnerUser()
        };
        var game = new Game(_game);

        game.save(function(err) {
            if (err) {
                console.log('error saving game');
                console.log(err);
                getIO().to(_id).emit('game save failure', {
                    message: errorHandler.getErrorMessage(err)
                });
            }
        });
    }

    awardPoints() {
        if (this.hasWinner()) {
            var winner = this.getWinnerUser();
            if (winner.xp) winner.xp += this.winner_points;
            else winner.xp = this.winner_points;

            winner.save(function(err) {
                if (err) {
                    console.log('error awarding winner points');
                    console.log(err);
                }
            });
        } else {
            var saveCallback = function(err) {
                if (err) {
                    console.log('error awarding participation points');
                    console.log(err);
                }
            };

            for (let player of this.players) {
                if (player.request.user.xp) player.request.user.xp += this.participation_points;
                else player.request.user.xp = this.participation_points;
                player.request.user.save(saveCallback);
            }
        }
    }

    countdownFactory(time, NextState, emit_msg) {
        var time_left = time;
        var that = this;
        getIO().to(this.getRoomID()).emit(emit_msg, time_left);

        this.interval = setInterval(function() {
            time_left--;
            getIO().to(that.getRoomID()).emit(emit_msg, time_left);
            if (time_left < 0) {
                clearInterval(this);
                if (NextState === 'Ending') {
                    // TODO: Kick/Flag Judge
                    that.setState(NextState, 'Judge didn\'t pick a phrase');
                } else that.setState(NextState);
            }
        }, 1000);
    }
}
