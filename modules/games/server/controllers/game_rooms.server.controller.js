'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Games = {};

class PublicGameRoom {

    constructor(players) {
        // Set players prop, return error if not array
        if (Array.isArray(players)) this.players = shuffle(players);
        else throw 'Attempted to create game without correct players param';

        // Available game states
        this.game_states = ['ESTABLISHED', 'START', 'DRAW', 'OVER', 'CHOOSE_WINNER', 'DISPLAY_WINNER', 'TERMINATE'];
        this.game_state = this.game_states[0];
        // Set min and max players
        this.min_players = 3;
        this.max_players = 8;
        // Set the first judge
        this.judge = players[0];
        // Create and set a time id for game_room
        this._id = generateID();
        // Create a socket channel for game_room and subscribe players, callback to startGame when players are connected
        this.game_socket = createGameSocket(this.players, this.playerDisconnects, this.startGame);
        // Add the game to the Games map
        Games[this._id] = this;
    }

    // TODO: Not sure if these get/set are needed
    // set gameState(state) {
    //     this.game_state = state;
    // }

    // get gameState() {
    //     return this.game_state;
    // }

    // When a player presses leave game
    playerExits(playerToRemove) {
        // Delete player from players array
        this.players.splice(this.players.indexOf(playerToRemove), 1);

        // If theres not enough players to continue, terminate game
        if (this.players.length < this.min_players) this.game_state = this.game_states[6];
        // Else disconnect the player from the game socket
        else this.game_socket.kickPlayer(playerToRemove);
    }

    // When a player disconnects without warning, e.g. closes window
    playerDisconnects(playerToRemove) {
        // Delete player from players array
        this.players.splice(this.players.indexOf(playerToRemove), 1);
        // If theres not enough players to continue, terminate game
        if (this.players.length < this.min_players) this.game_state = this.game_states[6];
    }

    // Sets a new judge by popping the end player
    newJudge() {
        this.judge = this.players.pop();
        this.players = this.players.unshift(this.judge);
    }

    // Begin the game by prompting judge to pick a phrase
    startGame() {
        this.emit('hello', 'hi');
        this.game_state = this.game_states[1];
        let phrases = generatePhrases();
        showJudge(phrases);
    }
}

util.inherits(PublicGameRoom, EventEmitter);

exports.PublicGameRoom = PublicGameRoom;

/**
Helper Functions
*/
function createGameSocket() {
    return {
        kickPlayer: function(player) {
            console.log('kicked', player);
        }
    };
}

// Generate a random id for the game_room
function generateID() {
    var id_length = 8;
    var timestamp = new Date();

    // number of milliseconds since 1970
    return timestamp.valueOf();
}

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// The de-facto unbiased shuffle algorithm is the Fisher-Yates (aka Knuth) Shuffle.
function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// Creates a list of randomly generated phrases
function generatePhrases() {
    return ['old duck', 'pregnant paperclip', 'fat chair', 'trendy turtles', 'fluffy cups'];
}

// Show the judge the phrases and prompt him to chose amongst them
function showJudge(phrases) {

}

// Kill the game by deleting it from the game map
function killGame(gameID) {
    delete Games[gameID];
}
