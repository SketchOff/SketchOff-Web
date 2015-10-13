'use strict';

import * as PublicGameStates from './states/public_game.server.controller';
import * as PrivateGameStates from './states/private_game.server.controller';

export default class GameRoom {

    constructor(players, is_public_room, game_id) {
        // Set players prop, return error if not array
        if (Array.isArray(players)) this.players = players;
        else throw 'Attempted to create game without correct players param';
        // Set the game_id generated from the game_rooms controller
        this._id = game_id;
        // Is game public, if not then game is private
        this.is_public_room = is_public_room;
        // Set min and max players
        this.min_players = 3;
        this.max_players = 7;
        // Set to true if judge leaves
        this.no_winner = false;
        this.State = is_public_room ? new PublicGameStates.Establishing(this) : new PrivateGameStates.Establishing(this);
    }

    set CurrState(State) {
        this.State = State;
    }

    get CurrState() {
        return this.State;
    }

    // When a player presses leave game
    playerExits(playerToRemove) {
        // Delete player from players array
        this.players.splice(this.players.indexOf(playerToRemove), 1);

        // If theres not enough players to continue, terminate game
        if (this.players.length < this.min_players) {
            this.CurrState = this.is_public_room ? new PublicGameStates.Terminating(this).state_name : new PrivateGameStates.Terminating(this).state_name;
        }
        // Enough players to keep game open
        else {
            // The judge left the game, no winner can be determined
            // TODO: Flag judge for leaving mid-game!
            if (playerToRemove === this.judge) this.no_winner = true;
        }
    }

}
