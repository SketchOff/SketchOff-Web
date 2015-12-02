'use strict';

/**
 * Module dependencies.
 */
var gamesPolicy = require('../policies/games.server.policy'),
  games = require('../controllers/games.http.server.controller');

module.exports = function (app) {
    app.route('/api/games/:gameId').all(gamesPolicy.isAllowed)
    .get(games.read);

  app.param('gameId', games.gameByID);

};
