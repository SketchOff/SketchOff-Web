'use strict';

/**
 * Module dependencies.
 */
var articlesPolicy = require('../policies/profile.server.policy'),
  articles = require('../controllers/profile.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/profile').all(articlesPolicy.isAllowed)
    .get(profile.list)
    //.post(articles.create);

  // Single article routes
  app.route('/api/profile/:profileId').all(articlesPolicy.isAllowed)
    .get(profile.read)
    //.put(articles.update)
    //.delete(articles.delete);

  // Finish by binding the article middleware
  app.param('profileId', profile.profileByID);
};
