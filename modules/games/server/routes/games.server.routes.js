'use strict';

/**
 * Module dependencies.
 */
var GameRoomManager = require('../controllers/game_room_manager.server.controller');

module.exports = function (app) {
  // // Articles collection routes
  // app.route('/api/articles').all(articlesPolicy.isAllowed)
  //   .get(articles.list)
  //   .post(articles.create);

  // // Single article routes
  // app.route('/api/articles/:articleId').all(articlesPolicy.isAllowed)
  //   .get(articles.read)
  //   .put(articles.update)
  //   .delete(articles.delete);

  // // Finish by binding the article middleware
  // app.param('articleId', articles.articleByID);
};
