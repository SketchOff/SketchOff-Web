'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  // Article = mongoose.model('Article'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current article
 */
exports.read = function (req, res) {
  console.log(req);
  res.json(req.user);
};

/**
 * List of Articles
 
exports.list = function (req, res) {
  Article.find().sort('-created').populate('user', 'displayName').exec(function (err, articles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(articles);
    }
  });
};

*/


/**
 * Profile middleware
 */
exports.profileByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Profile is invalid'
    });
  }

  User.findById(id).populate('user', 'displayName').exec(function (err, user) {
    if (err) {
      return next(err);
    } else if (!user) { //  user dne?
      return res.status(404).send({
        message: 'No profile with that identifier has been found'
      });
    }
    req.user = user;
    next();
  });
};
