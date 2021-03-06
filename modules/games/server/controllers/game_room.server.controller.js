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
    Drawing = mongoose.model('Drawing'),
    Flag = mongoose.model('Flag'),
    fs = require('fs'),
    errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


var mkdirSync = function(path) {
    try {
        fs.mkdirSync(path);
    } catch (e) {
        if (e.code !== 'EEXIST') throw e;
    }
};


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
        this._id = room_id + '-1';
        this.is_public = is_public_room;
        // Set to true if judge leaves
        this.first_game = true;
        this.available = false;
        this.waiting_players = [];
        this.CountdownTimes = CountdownTimes;
        this.winner = null;
        this.interval = null;
        this.winner_points = 100;
        this.participation_points = 10;
        this.chat_messages = [];
        if (this.isPublic()) {
            this.State = new GameRoomStates.Establishing(this);
        } else {
            this.lobbyLeader = null;
            this.setLobbyLeader();
            console.log("THE FOLLOWING LINE IS HERE");
            console.log(this.lobbyLeader);
            this.State = new GameRoomStates.Lobby(this);
        }
        if (this.hasAdminSubscribers()) getIO().to('admin_updates').emit('room update', [this.getRoomID(), this.getInfo()]);
    }

    getChatMessages() {
        return this.chat_messages;
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

    // Emits _data_ to everyone
    emitToEveryone(type, data) {
        // console.log('emitting data to everyone');
        this.players.forEach(function(player) {
            player.emit(type, data);
        });
    }

    // Emits _data_ to player_id (Authentication.user._uid)
    emitToPlayer(type, player_id, data) {
        // console.log('emitting data to specific player ' + player_id);
        this.players.forEach(function(player) {
            if (player.request.user._uid === player_id) {
                player.emit(type, data);
            }
        });
    }

    // Emits _data_ to everyone except player_id (Authentication.user._uid)
    emitToEveryoneExcept(type, player_id, data) {
        // console.log('emitting data to everyone except ' + player_id);
        this.players.forEach(function(player) {
            if (player.request.user._uid !== player_id) {
                player.emit(type, data);
            }
        });
    }

    setLobbyLeader() {
        if (this.players.length !== 0) {
            console.log(this.players);
            this.lobbyLeader = this.players[this.players.length - 1].request.user.username;
        }
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

    //error here?
    // Add a player to the game
    addPlayer(player) {
        if (!player.game_room_id) {
            player.game_room_id = this.getRoomID();
            if (player.rooms.indexOf(this.getRoomID()) < 0) {
                player.join(this.getRoomID());
            }
        }
        if (this.getStateName === "LOBBY") {
            this.players.push(player);
        } else {
            var index = getRandomIntInclusive(0, this.players.length - 1);
            this.players.splice(index, 0, player);
        }
        var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(player.request.user.username);
        ConnectedPlayer.in_game = true;
        ConnectedPlayer.in_queue = false;
    }

    addWaitingPlayer(player) {
        var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(player.request.user.username);
        ConnectedPlayer.in_queue = false;
        ConnectedPlayer.in_game = true;
        GameRoomManager.ConnectedPlayers.set(player.request.user.username, ConnectedPlayer);

        player.join(this.getRoomID());
        player.game_room_id = this.getRoomID();
        this.waiting_players.push(player);
        getIO().to(this.getRoomID()).emit('player joining', this.getPlayersInfo());
        if (this.hasAdminSubscribers()) getIO().to('admin_updates').emit('room update', [this.getRoomID(), this.getRoomInfo()]);
        this.addMessage({
            type: 'status',
            text: 'is now connected',
            created: Date.now(),
            profileImageURL: player.request.user.profileImageURL,
            username: player.request.user.username
        });
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
        var temp = this._id.split('-');
        var game_num = parseInt(temp[1]);
        game_num++;
        this._id = this.room_id + '-' + game_num;
        console.log('incrementing game id', this._id);
    }

    getPhrases() {
        var adjs = ["other", "new", "good", "high", "old", "great", "big", "American", "small", "large", "national", "young", "different", "black", "long", "little", "important", "political", "bad", "white", "real", "best", "right", "social", "only", "public", "sure", "low", "early", "able", "human", "local", "late", "hard", "major", "better", "economic", "strong", "possible", "whole", "free", "military", "true", "federal", "international", "full", "special", "easy", "clear", "recent", "certain", "personal", "open", "red", "difficult", "available", "likely", "short", "single", "medical", "current", "wrong", "private", "past", "foreign", "fine", "common", "poor", "natural", "significant", "similar", "hot", "dead", "central", "happy", "serious", "ready", "simple", "left", "physical", "general", "environmental", "financial", "blue", "democratic", "dark", "various", "entire", "close", "legal", "religious", "cold", "final", "main", "green", "nice", "huge", "popular", "traditional", "cultural"];
        var noun = ["time", "issue", "year", "side", "people", "kind", "way", "head", "day", "house", "man", "service", "thing", "friend", "woman", "father", "life", "power", "child", "hour", "world", "game", "school", "line", "state", "end", "family", "member", "student", "law", "group", "car", "country", "city", "problem", "community", "hand", "name", "part", "president", "place", "team", "case", "minute", "week", "idea", "company", "kid", "system", "body", "program", "information", "question", "back", "work", "parent", "government", "face", "number", "others", "night", "level", "Mr", "office", "point", "door", "home", "health", "water", "person", "room", "art", "mother", "war", "area", "history", "money", "party", "storey", "result", "fact", "change", "month", "morning", "lot", "reason", "right", "research", "study", "girl", "book", "guy", "eye", "food", "job", "moment", "word", "air", "business", "teacher"];
        var adjset = this.getWordSet(adjs, this.getFourRand());
        var nounset = this.getWordSet(noun, this.getFourRand());
        var phrases = [
            adjset[0] + ' ' + nounset[0],
            adjset[1] + ' ' + nounset[1],
            adjset[2] + ' ' + nounset[2],
            adjset[3] + ' ' + nounset[3]
        ];

        // var phrases = ['pregnant pencils', 'tall people', 'smelly clothes', 'pesty pelicans'];
        return phrases;
    }

    // Returns 4 unique random numbers in range 1-100
    getFourRand() {
        var rands = [-1, -1, -1, -1];
        for (var i = 0; i < rands.length; i++) {
            // fast round
            var tmp = ~~(Math.random() * 100);
            while (rands.indexOf(tmp) > 0) {
                tmp = ~~(Math.random() * 100);
            }
            rands[i] = tmp;
        }
        return rands;
    }

    // Returns an array of words from wordList as determined by indexes
    getWordSet(wordList, indexes) {
        var a = [];
        for (var i = 0; i < indexes.length; i++) {
            a.push(wordList[indexes[i]]);
        }
        return a;
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
        if (winner === this.getJudgeUsername()) throw new Error('Cannot set judge as game winner.');
        this.winner = winner;
        this.setState('Ending');
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
        this.flagPlayer(player.request.user._id);
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


        if ((this.getStateName() !== 'LOBBY') || this.getNumPlayers() === 0) {
            if (this.getNumAllPlayers() < min_players) {
                console.log('Terminating because not enough total players');
                this.setState('Terminating');
            } else if (this.getNumPlayers() < min_players) {
                console.log('not enough playing player but enough total players');
                this.setState('Ending', 'Not enough active players to continue.');
                this.addMessage({
                    type: 'status',
                    text: 'disconnected',
                    created: Date.now(),
                    profileImageURL: player.request.user.profileImageURL,
                    username: player.request.user.username
                });
            } else {
                getIO().to(this.getRoomID()).emit('player leaving', this.getPlayersInfo());
                if (player.request.user.username.localeCompare(this.judge.request.username) === 0) {
                    console.log('The judge left the game. But the game will continue.');
                    this.setState('Ending', 'The judge left the game.');
                } else {
                    console.log('Player left but doesnt effect game play');
                }
                if (this.hasAdminSubscribers()) getIO().to('admin_updates').emit('room update', [this.getRoomID(), this.getRoomInfo()]);
                this.addMessage({
                    type: 'status',
                    text: 'disconnected',
                    created: Date.now(),
                    profileImageURL: player.request.user.profileImageURL,
                    username: player.request.user.username
                });
            }
            if (this.hasAdminSubscribers())
                getIO().to('admin_updates').emit('room update', [this.getRoomID(), this.getRoomInfo()]);
        }
    }

    flagPlayer(user_id){
        if(this.getStateName() !== 'ENDING'){
            User.findById(user_id).exec(function (err, user){
                if(err || !user){
                    console.log('problem trying to flag user');
                    throw err;
                }
                var TheUser = user;
                var TheFlag = new Flag({created: Date.now,reason: 'Left game early'});
                TheUser.flags.push(TheFlag);
                TheUser.save(function (err) {
                    if (err) {
                        console.log('problem trying to push flag to user');
                        throw err;
                    }
                });
            });
        }
    }

    getPlayersInfo() {
        var PlayersInfo = {};
        PlayersInfo.players = this.getPlayerUsernames();
        PlayersInfo.waiting_players = this.getWaitingPlayerUsernames();
        return PlayersInfo;
    }

    getRoomInfo() {
        var RoomInfo = {};
        RoomInfo.room_type = this.getRoomType();
        RoomInfo.state = this.getStateName();
        RoomInfo.game_id = this.getGameID();
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
            players_minus_judge: getNotJudge(this.getPlayerUsernames(), this.getJudgeUsername()),
            waiting_players: this.getWaitingPlayerUsernames(),
            state: this.getStateName(),
            judge: this.getJudgeUsername(),
            phrases: this.getPhrases(),
            chat_messages: this.getChatMessages()
        };
        return GameInfo;
    }

    getLobbyInfo() {
        var LobbyInfo = {};
        LobbyInfo.lobbyLeader = this.lobbyLeader;
        LobbyInfo.players = this.getPlayerUsernames();
        LobbyInfo.state = this.getStateName();
        LobbyInfo._id = this.getRoomID();
        LobbyInfo.min_players = min_players;
        LobbyInfo.max_players = max_players;
        return LobbyInfo;
    }

    hasAdminSubscribers() {
        return (!!getIO().sockets.adapter.rooms.admin_updates);
    }

    disconnectAllPlayers() {
        this.waiting_players.forEach(function(player) {
            player.leave(this.getRoomID());
            delete player.game_room_id;

            player.active_user = false;
            var ConnectedPlayer = GameRoomManager.ConnectedPlayers.get(player.request.user.username);
            ConnectedPlayer.in_queue = false;
            ConnectedPlayer.in_game = false;
            GameRoomManager.ConnectedPlayers.set(player.request.user.username, ConnectedPlayer);
        }, this);

        this.players.forEach(function(player) {
            player.leave(this.getRoomID());
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

    saveGame(early_end_reason) {
        console.log('Saving game', this.getGameID());
        var _id = this.getGameID();

        var _game = {
            players: this.getPlayerUsers(),
            judge: this.getJudgeUser(),
            winner: this.getWinnerUser(),
            game_id: this.getGameID()
        };

        if (early_end_reason) {
            _game.early_end = early_end_reason;
        }

        var game = new Game(_game);

        try {
            game.save();
        } catch (e) {
            console.log('Error saving game');
            console.log(e);
            // TODO: Handle this socket event
            getIO().to(this.getRoomID()).emit('game save failure');
        }
    }

    awardPoints() {
        if (this.hasWinner()) {
            var winner = this.getWinnerUser();
            if (winner.xp) winner.xp += this.winner_points;
            else winner.xp = this.winner_points;

            try {
                winner.save(function(err) {});
            } catch (e) {
                console.log('Error awarding winner points');
                console.log(e);
            }
        } else {
            try {
                for (let player of this.players) {
                    if (player.request.user.xp) player.request.user.xp += this.participation_points;
                    else player.request.user.xp = this.participation_points;
                    player.request.user.save();
                }
            } catch (e) {
                console.log('Error awarding participation_points');
                console.log(e);
            }
        }
    }

    startPrivateGame() {
        this.setState('Establishing');
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

    addMessage(msg) {
        this.chat_messages.unshift(msg);
        if (this.getChatMessages().length >= 20) this.chat_messages.pop();
        getIO().to(this.getRoomID()).emit('receiving chat messages', this.getChatMessages());
        console.log('adding message', msg);
    }




    saveImage(game_id, player_name, data) {
        var path = './uploads/' + game_id + '/';
        var fname = player_name + '.png';
        var loc = path + fname;

        mkdirSync(path);

        var dt = data.replace(/^data:image\/\w+;base64,/, "");
        // console.log(dt);
        // var buf = new Buffer(data, 'base64');
        // fs.writeFile(path+fname, buf, function(err) {
        fs.writeFile(loc, dt, 'base64', function(err) {
            if (err) {
                throw err;
            }
            console.log('Wrote image to ' + path);

            User.findOne({
                username: player_name
            }, '_id', function(err, id) {
                var _drawing = {
                    author: id,
                    fileLocation: loc,
                };
                var drawing = new Drawing(_drawing);

                try {
                    drawing.save();
                } catch (e) {
                    console.log('Error saving drawing to db');
                    console.log(e);
                }

            });
        });
    }

}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getNotJudge(players, judge) {
    var t = players.slice();
    // console.log(t, judge);
    var i = t.indexOf(judge);
    if (i > -1) {
        t.splice(i, 1);
    }
    // console.log(t);
    return t;
}
