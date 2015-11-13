'use strict';

//Articles service used for communicating with the articles REST endpoints
angular.module('profile').factory('Profiles', ['$resource',
  function ($resource) {
    return $resource('api/profile/:profileId', {
      profileId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
      // friendRequest: {
      // 	method: 'POST'
      // }
    });
  }
]);
