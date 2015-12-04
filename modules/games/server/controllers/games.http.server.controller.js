'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Game = mongoose.model('Game'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


/**
 * Show the current Game
 */
exports.read = function (req, res) {
  res.json(req.game);
};

/**
 * Game middleware
 */
exports.gameByID = function (req, res, next, id) {

  console.log('game id = ', id);

  console.log('line reached');

  Game.findOne({game_id: id}).populate('winner').populate('judge').populate('players').exec(function (err, game) {
    if (err) {
      return next(err);
    } else if (!game) {
      return res.status(404).send({
        message: 'No Game with that identifier has been found'
      });
    }
    req.game = game;
    next();
  });
};
