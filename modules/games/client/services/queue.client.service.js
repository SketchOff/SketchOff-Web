'use strict';

angular.module('games.admin').factory('Queue', ['$resource',
  function ($resource) {
    return $resource('api/games/queue');
  }
]);
