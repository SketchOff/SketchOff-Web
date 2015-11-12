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
  res.json(req.Profile);
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
    } else if (!user) { //  user dne
      return res.status(404).send({
        message: 'No profile with that identifier has been found'
      });
    }
    var strippedUser = {
      _id:user._id,
      displayName:user.displayName,
      username:user.username,
      profileImageURL:user.profileImageURL,
      firstName:user.firstName,
      lastName:user.lastName,
      email:user.email,
      friends:user.friends,
      created:user.created,
      provider:user.provider,
      same:false
    };
    if (String(req.user._id) === id) {
      strippedUser.pendingFriendRequests = user.pendingFriendRequests;
      strippedUser.roles = user.roles;
      strippedUser.same = true;
    }
    req.Profile = strippedUser;
    next();
  });
};
