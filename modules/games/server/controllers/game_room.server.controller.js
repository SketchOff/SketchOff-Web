'use strict';

import * as PublicGameStates from './states/public_game.server.controller';
import * as PrivateGameStates from './states/private_game.server.controller';
import * as GameSocket from '../sockets/game.server.socket.config';

export default class GameRoom {

    constructor(players, public_room) {
        // Set players prop, return error if not array
        if (Array.isArray(players)) this.players = players;
        else throw 'Attempted to create game without correct players param';

        // Set min and max players
        this.min_players = 3;
        this.max_players = 8;
        // Set to true if judge leaves
        this.no_winner = false;
        // Setup states, private or public
        this.States = public_room ? PublicGameStates : PrivateGameStates;
        // Create a new socket channel for the room and connect the players
        // this.GameSocket = new GameSocket(this.players);

        // // Player disconnects from socket
        // this.GameSocket.on('player disconnect', function(player) {
        //     this.playerDisconnects(player);
        // });

        // // TODO: Handle socket ready timeout
        // this.GameSocket.on('socket ready', function(player) {
        //     // Set Initial State
        //     if (public_room) this.CurrState = new this.States.GameEstablished();
        // });
        this.CurrState = new this.States.Establishing();
    }

    set gameState(State) {
        this.CurrState = State;
    }

    get gameState() {
        return this.CurrState;
    }

    // When a player presses leave game
    playerExits(playerToRemove) {
        // Delete player from players array
        this.players.splice(this.players.indexOf(playerToRemove), 1);

        // If theres not enough players to continue, terminate game
        if (this.players.length < this.min_players) this.CurrState = 'TERMINATE';
        // Enough players to keep game open
        else {
            // Disconnect the player from the game socket
            this.game_socket.kickPlayer(playerToRemove);
            // The judge left the game, no winner can be determined
            // TODO: Flag judge for leaving mid-game!
            if (playerToRemove === this.judge) this.no_winner = true;
        }
    }

    // When a player disconnects without warning, e.g. closes window
    playerDisconnects(playerToRemove) {
        // Delete player from players array
        this.players.splice(this.players.indexOf(playerToRemove), 1);
        // If theres not enough players to continue, terminate game
        if (this.players.length < this.min_players) this.CurrState = 'TERMINATE';
        // Enough players to keep game room open
        else {
            // The judge left the game, no winner can be determined
            // TODO: Flag judge for leaving mid-game!
            if (playerToRemove === this.judge) this.no_winner = true;
        }
    }
}
