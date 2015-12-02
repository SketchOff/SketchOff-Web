'use strict';

//Games service used for communicating with the articles REST endpoints
angular.module('games').factory('Games', ['$resource',
  function ($resource) {
    return $resource('api/games/:gameId', {
      gameId: '@_id'
    });
  }
]);
