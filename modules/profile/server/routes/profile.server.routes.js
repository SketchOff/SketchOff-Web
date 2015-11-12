'use strict';

/**
 * Module dependencies.
 */
var profilePolicy = require('../policies/profile.server.policy'),
  profile = require('../controllers/profile.server.controller');

module.exports = function (app) {
  // Articles collection routes
  //app.route('/api/profile').all(articlesPolicy.isAllowed)
    //.get(profile.list);
    //.post(articles.create);

  // Single article routes
  app.route('/api/profile/:profileId').all(profilePolicy.isAllowed)
    .get(profile.read)
    .post(profile.friendRequest);
    //.put(articles.update)
    //.delete(articles.delete);

  // Finish by binding the article middleware
  app.param('profileId', profile.profileByID);
};
