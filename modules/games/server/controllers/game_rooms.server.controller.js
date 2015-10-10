'use strict';

function createGameSocket() {
    return {
        kickPlayer: function(player) {
            console.log('kicked', player);
        }
    };
}

// Generate a random id for the game_room
var generateID = function() {
    var id_length = 8;
    var timestamp = new Date();

    // number of milliseconds since 1970
    return timestamp.valueOf();
};

class PublicGameRoom {

    constructor(players) {
        // Set players prop, return error if not array
        if (Array.isArray(players)) this.players = players;
        else throw 'Attempted to create game without correct players param';

        // Available game states
        this.game_states = ['ESTABLISHED', 'START', 'DRAW', 'OVER', 'CHOOSE_WINNER', 'DISPLAY_WINNER', 'TERMINATED'];
        this.game_state = this.game_states[0];
        // Set min and max players
        this.min_players = 3;
        this.max_players = 8;
        // Set the first judge
        this.judge = players[0];
        // Create and set a time id for game_room
        this._id = generateID();
        // Create a socket channel for game_room and subscribe players
        this.game_socket = createGameSocket(this.players, this.playerDisconnects);
    }

    set gameState(state) {
        this.game_state = state;
    }

    get gameState() {
        return this.game_state;
    }

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
}

var x = new PublicGameRoom([1, 2, 3]);
console.log(x.gameState);
console.log(x.players);
x.playerExits(1);
console.log(generateID());
