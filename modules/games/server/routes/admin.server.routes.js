'use strict';

/**
 * Module dependencies.
 */
var gamesPolicy = require('../policies/games.server.policy'),
    admin = require('../controllers/admin.server.controller');

module.exports = function(app) {
    // Games route registration first. Ref: #713
    require('./games.server.routes.js')(app);

    app.route('/api/games/queue')
        .get(gamesPolicy.isAllowed, admin.queueInfo);

    app.route('/api/games/rooms')
        .get(gamesPolicy.isAllowed, admin.roomsInfo);


};
