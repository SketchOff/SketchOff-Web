'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));


exports.queueInfo = function (req, res) {
  res.json({msg: 'this queue is a bitch'});
};

exports.roomsInfo = function (req, res) {
  res.json({msg: 'these rooms cool doe'});
};